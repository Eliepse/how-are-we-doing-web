import { Config } from "./config";
import { Diagram } from "./Diagram/Diagram";
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
const label = document.querySelector("#floatingLabel") as HTMLDivElement;

if (null === container) {
	throw new Error("Missing container");
}

if (null === label) {
	throw new Error("Missing label");
}

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

	label.textContent = event.target.id;
	const labelBBox = label.getBoundingClientRect();
	const anchor = renderer
		.localPointToWindow(event.target?.getGlobalPosition())
		.sub(new Vector(labelBBox.width, labelBBox.height).div(2));
	label.style.transform = `translate(${anchor.x.toFixed()}px, ${anchor.y.toFixed()}px)`;
	label.style.display = "";
});

diagram.addListener("mouseleave", (event) => {
	label.style.display = "none";
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
