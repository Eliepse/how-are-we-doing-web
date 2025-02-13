import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { SVGStyle } from "../ValueObject/SVGStyle";
import { Painter } from "./Painter";

export class CirclePainter extends Painter {
	static make(): SVGCircleElement {
		return document.createElementNS("http://www.w3.org/2000/svg", "circle");
	}

	static update(
		element: SVGCircleElement,
		position: Vector,
		radius: number,
		style: SVGStyle,
	): void {
		element.setAttribute("r", radius.toFixed(1));

		const pos = position.toAttributes();
		element.setAttribute("cx", pos.x);
		element.setAttribute("cy", pos.y);

		style.updateElement(element);
	}
}
