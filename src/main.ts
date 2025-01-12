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

renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer));
renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer));
renderer.addNodeRenderer(new FacilityRenderer(renderer));
renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer));
renderer.addNodeRenderer(new DeterminantRenderer(renderer));
renderer.addNodeRenderer(new PathologyRenderer(renderer));
renderer.addNodeRenderer(new PathologyLinkRenderer(renderer));

renderer.render();
console.debug("Render: " + renderer.getLastFrameTime() + " ms");

renderer.getEngine().start();

/**
 * Test area
 */

let lastFpsUpdateTime = Date.now();
let lastFpsUpdateFrames = 0;
const fpsCounter = document.querySelector("#fps") as HTMLDivElement;
const startedAt = Date.now();
let lastFrameTime = startedAt;
let frames = 0;
const frameRate = 1000 / 30;

function frame(): void {
	const now = Date.now();
	const delta = now - lastFrameTime;

	if (delta < frameRate) {
		requestAnimationFrame(frame);
		return;
	}

	const deltaTime = delta / 1000;
	const time = (now - startedAt) / 1000;

	// const angle = new Angle((time * (Math.PI / 15)) % (Math.PI * 2));
	// diagram.setRotation(angle);
	// diagram.getPathologyFamilies().forEach((family) => family.updateShiftedPosition(time));

	// renderer.render();

	if (fpsCounter && now - lastFpsUpdateTime >= 1000) {
		const fpsUpdateDelta = now - lastFpsUpdateTime;
		const fpsAverage = ((frames - lastFpsUpdateFrames) / fpsUpdateDelta) * 1000;
		fpsCounter.textContent = `${fpsAverage.toFixed()} fps`;
		lastFpsUpdateTime = now;
		lastFpsUpdateFrames = frames;
	}

	lastFrameTime = now;
	frames++;
	requestAnimationFrame(frame);
}

// frame();

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
