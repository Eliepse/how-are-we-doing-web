import type { Vector } from "../../../Vector";
import { Painter } from "./Painter";
import type { Stroke } from "./Stroke";

export class CirclePainter extends Painter {
	static make(): SVGCircleElement {
		return document.createElementNS("http://www.w3.org/2000/svg", "circle");
	}

	static update(
		element: SVGCircleElement,
		position: Vector,
		radius: number,
		stroke?: Stroke,
		fill: string = "currentColor"
	): void {
		element.setAttribute("r", radius.toFixed(1));
		element.setAttribute("fill", fill);

		const pos = position.toAttributes();
		element.setAttribute("cx", pos.x);
		element.setAttribute("cy", pos.y);

		if (stroke) {
			element.setAttribute("stroke", stroke.color);
			element.setAttribute("stroke-width", stroke.width.toFixed());
		} else {
			element.removeAttribute("stroke");
			element.removeAttribute("stroke-width");
		}
	}
}
