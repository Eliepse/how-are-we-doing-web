import type { Vector } from "../../../Vector";
import { Painter } from "./Painter";

export class LinePainter extends Painter {
	static make(): SVGLineElement {
		return document.createElementNS("http://www.w3.org/2000/svg", "line");
	}

	static update(
		line: SVGLineElement,
		from: Vector,
		to: Vector,
		color: string = "currentColor",
		width: number = 1
	): void {
		const a = from.toAttributes();
		const b = to.toAttributes();

		line.setAttribute("x1", a.x);
		line.setAttribute("y1", a.y);
		line.setAttribute("x2", b.x);
		line.setAttribute("y2", b.y);

		line.setAttribute("stroke", color);
		line.setAttribute("stroke-width", width.toFixed());
	}
}
