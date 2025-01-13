import { Config } from "./config";
import { Diagram } from "./Diagram/Diagram";
import { DeterminantRenderer } from "./Diagram/Renderer/DeterminantRenderer";
import { DeterminantSubFamilyRenderer } from "./Diagram/Renderer/DeterminantSubFamilyRenderer";
import { FacilityFamilyRenderer } from "./Diagram/Renderer/FacilityFamilyRenderer";
import { FacilityRenderer } from "./Diagram/Renderer/FacilityRenderer";
import { GroupWithArcTextRenderer } from "./Diagram/Renderer/GroupWithArcTextRenderer";
import { PathologyLinkRenderer } from "./Diagram/Renderer/PathologyLinksRenderer";
import { PathologyRenderer } from "./Diagram/Renderer/PathologyRenderer";
import { Node2D } from "./Engine2D/Node2D";
import { SVGRenderer } from "./Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "./Engine2D/Vector";

const root = new Node2D();

const diagram = new Diagram();
root.addChildren(diagram);

const renderer = new SVGRenderer(
	"diagram",
	document.body,
	diagram,
	new Vector(1000, 1000),
	Config.Render.debug,
);

root.setPosition(renderer.size.div(2));

renderer.addNodeRenderer(new FacilityRenderer(renderer, diagram));
renderer.addNodeRenderer(new DeterminantRenderer(renderer, diagram));
renderer.addNodeRenderer(new PathologyRenderer(renderer, diagram));
renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer));
renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer));
renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer));
renderer.addNodeRenderer(new PathologyLinkRenderer(renderer));

renderer.render();
console.debug("Render: " + renderer.getLastFrameTime() + " ms");

renderer.getEngine().start();

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
