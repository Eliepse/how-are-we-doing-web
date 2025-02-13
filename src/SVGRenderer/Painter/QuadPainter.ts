import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { Painter } from "./Painter";
import type { FillAndStroke } from "../FillAndStroke";

export class QuadPainter implements Painter {
	static make(): SVGPathElement {
		return document.createElementNS("http://www.w3.org/2000/svg", "path");
	}

	static update(
		path: SVGPathElement,
		points: [Vector, Vector, Vector, Vector],
		style: FillAndStroke,
	): void {
		const formattedPoints = [
			points[0].toString(),
			points[1].toString(),
			points[2].toString(),
			points[3].toString(),
		];

		path.setAttribute("d", `M ${formattedPoints.join(" L ")} Z`);
		style.updateElement(path);
	}
}
