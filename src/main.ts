import { Diagram } from "./Diagram/Diagram";
import { DeterminantRenderer } from "./Diagram/Renderer/DeterminantRenderer";
import { DeterminantSubFamilyRenderer } from "./Diagram/Renderer/DeterminantSubFamilyRenderer";
import { FacilityFamilyRenderer } from "./Diagram/Renderer/FacilityFamilyRenderer";
import { GroupWithArcTextRenderer } from "./Diagram/Renderer/GroupWithArcTextRenderer";
import { PathologyRenderer } from "./Diagram/Renderer/PathologyRenderer";
import { Node2D } from "./Engine2D/Node2D";
import { Angle } from "./Engine2D/Parameters/Angle";
import { Size } from "./Engine2D/Parameters/Size";
import { SVGRenderer } from "./Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "./Engine2D/Vector";

const root = new Node2D();
root.setPosition(new Vector(500, 500));

// const test = new Facility();
// root.addChildren(test);

const diagram = new Diagram();
root.addChildren(diagram);

// const svg = new SVGRenderer(document.body, new Size(1000, 1000), root);
// svg.addSymbolShape(facilityShape);
// Object.values(determinantAssets).forEach(
//   (asset) => asset instanceof SymbolShape && svg.addSymbolShape(asset)
// );

// const renderTime = svg.render();

const renderer = new SVGRenderer(document.body, diagram, new Size(1000, 1000), false);

renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer));
renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer));
renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer));
renderer.addNodeRenderer(new DeterminantRenderer(renderer));
renderer.addNodeRenderer(new PathologyRenderer(renderer));

renderer.render();
console.debug("Render: " + renderer.getLastFrameTime() + " ms");

/**
 * Test area
 */

let lastFpsUpdateTime = Date.now();
let lastFpsUpdateFrames = 0;
const fpsCounter = document.querySelector("#fps") as HTMLDivElement;
const startedAt = Date.now();
let lastFrameTime = startedAt;
let frames = 0;
const frameRate = 1000 / 60;

function frame(): void {
	const now = Date.now();
	const delta = now - lastFrameTime;

	if (delta < frameRate) {
		requestAnimationFrame(frame);
		return;
	}

	const deltaTime = delta / 1000;
	const time = (now - startedAt) / 1000;

	const angle = new Angle((time * (Math.PI / 10_000)) % (Math.PI * 2));
	// diagram.setRotation(angle);
	diagram.getPathologyFamilies().forEach((family) => family.updateShiftedPosition(time));

	renderer.render();

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

frame();

/*
const determinantsGroup = new CircleGroup(
  320,
  determinants.map((sym) => {
    if(sym instanceof Determinant) {
      return sym;
    }

    const det = new Determinant(new Vector(159, 256), sym);
    det.setStep(Math.ceil(Math.random() * 4))

    document.addEventListener("click", () => {
        det.setStep(Math.ceil(Math.random() * 4))
        det.refresh()
    })

    return det;
  })
);
determinantsGroup.setElementStartRotation(Math.PI / 2)
determinantsGroup.setPosition(viewBox.div(2));
*/
/**
 * Make
 */
/*
canvas.addElement(facilitiesGroup);
canvas.addElement(determinantsGroup);
canvas.getDOM().forEach((el) => document.body.append(el));
*/
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
