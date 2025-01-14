import { Config } from "./config";
import { Diagram, type SelectableNode } from "./Diagram/Diagram";
import { FloatingLabelManager } from "./Diagram/FloatingLabelManager";
import { DeterminantRenderer } from "./Diagram/Renderer/DeterminantRenderer";
import { DeterminantSubFamilyRenderer } from "./Diagram/Renderer/DeterminantSubFamilyRenderer";
import { FacilityFamilyRenderer } from "./Diagram/Renderer/FacilityFamilyRenderer";
import { FacilityRenderer } from "./Diagram/Renderer/FacilityRenderer";
import { GroupWithArcTextRenderer } from "./Diagram/Renderer/GroupWithArcTextRenderer";
import { PathologyLinkRenderer } from "./Diagram/Renderer/PathologyLinksRenderer";
import { PathologyRenderer } from "./Diagram/Renderer/PathologyRenderer";
import { Translator } from "./Diagram/Translation/Translator";
import type { NodeEvent } from "./Engine2D/Core/NodeEvent";
import { SVGRenderer } from "./Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "./Engine2D/Vector";

const container = document.querySelector("#diagramContainer");
const labelContainer = document.querySelector("#labels") as HTMLDivElement;

if (null === container) {
	throw new Error("Missing container");
}

if (null === labelContainer) {
	throw new Error("Missing labels container");
}

const translator = new Translator(
	"/assets/translations/{context}.{lang}.json",
	"en",
	["en"],
	["nodes"],
);

const labelManager = new FloatingLabelManager(labelContainer);
const diagram = new Diagram();
const renderer = new SVGRenderer(
	"diagram",
	container,
	diagram,
	new Vector(1000, 1000),
	Config.Render.debug,
);

diagram.setPosition(renderer.size.div(2));

renderer.addNodeRenderer(new FacilityRenderer(renderer, diagram));
renderer.addNodeRenderer(new DeterminantRenderer(renderer, diagram));
renderer.addNodeRenderer(new PathologyRenderer(renderer, diagram));
renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer));
renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer));
renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer));
renderer.addNodeRenderer(new PathologyLinkRenderer(renderer));

const engine = renderer.getEngine();

diagram.addListener("mouseenter", (event: NodeEvent<SelectableNode | undefined>) => {
	if (undefined === event.target) {
		return;
	}

	labelManager.show(
		"hover",
		translator.translate(event.target.label, "nodes"),
		renderer.localPointToWindow(event.target?.getGlobalPosition()),
		"left",
		16,
	);
});

diagram.addListener("nodeSelected", (event: NodeEvent<SelectableNode | undefined>) => {
	if (undefined === event.target) {
		labelManager.hide("selected");
		return;
	}

	labelManager.show(
		"selected",
		translator.translate(event.target.label, "nodes"),
		renderer.localPointToWindow(event.target?.getGlobalPosition()),
		"left",
		16,
	);
});

diagram.addListener("mouseleave", () => {
	if (0 !== engine.getHovering().length) {
		return;
	}

	labelManager.hide("hover");
});

translator.loadContexts().then(() => {
	renderer.render();
	engine.start();
});

/**
 * Debugger
 */
/*
document.addEventListener("mousemove", (e) => {
  const cursor = new Vector(e.clientX, e.clientY);
  // determinantsGroup.setSize(cursor.x);
  // determinantsGroup.refresh()
  // console.debug(cursor.x)
});
*/
