import type { Vector } from "../../../Vector";
import type { FillAndStroke } from "../FillAndStroke";
import { Painter } from "./Painter";

export class CirclePainter extends Painter {
	static make(): SVGCircleElement {
		return document.createElementNS("http://www.w3.org/2000/svg", "circle");
	}

	static update(
		element: SVGCircleElement,
		position: Vector,
		radius: number,
		style: FillAndStroke,
	): void {
		element.setAttribute("r", radius.toFixed(1));

		const pos = position.toAttributes();
		element.setAttribute("cx", pos.x);
		element.setAttribute("cy", pos.y);

		style.updateElement(element);
	}
}
