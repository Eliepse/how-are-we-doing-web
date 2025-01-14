import { Config } from "./config";
import { Diagram } from "./Diagram/Diagram";
import { FloatingLabelManager } from "./Diagram/FloatingLabelManager";
import { DeterminantRenderer } from "./Diagram/Renderer/DeterminantRenderer";
import { DeterminantSubFamilyRenderer } from "./Diagram/Renderer/DeterminantSubFamilyRenderer";
import { FacilityFamilyRenderer } from "./Diagram/Renderer/FacilityFamilyRenderer";
import { FacilityRenderer } from "./Diagram/Renderer/FacilityRenderer";
import { GroupWithArcTextRenderer } from "./Diagram/Renderer/GroupWithArcTextRenderer";
import { PathologyLinkRenderer } from "./Diagram/Renderer/PathologyLinksRenderer";
import { PathologyRenderer } from "./Diagram/Renderer/PathologyRenderer";
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

diagram.addListener("mouseenter", (event: NodeEvent) => {
	if (undefined === event.target) {
		return;
	}

	labelManager.show(
		"hover",
		event.target.id,
		renderer.localPointToWindow(event.target?.getGlobalPosition()),
		"left",
		16,
	);
});

diagram.addListener("nodeSelected", (event: NodeEvent) => {
	if (undefined === event.target) {
		labelManager.hide("selected");
		return;
	}

	labelManager.show(
		"selected",
		event.target.id,
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

renderer.render();
engine.start();

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
