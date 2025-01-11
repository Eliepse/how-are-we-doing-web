import type { Vector } from "../../../Vector";
import type { Painter } from "./Painter";
import type { Stroke } from "./Stroke";

export class QuadPainter implements Painter {
	static make(): SVGPathElement {
		return document.createElementNS("http://www.w3.org/2000/svg", "path");
	}

	private static vectorToString(point: Vector): string {
		const attr = point.toAttributes();
		return `${attr.x} ${attr.y}`;
	}

	static update(
		path: SVGPathElement,
		points: [Vector, Vector, Vector, Vector],
		fill: string,
		stroke: Stroke
	): void {
		const formattedPoints = [
			QuadPainter.vectorToString(points[0]),
			QuadPainter.vectorToString(points[1]),
			QuadPainter.vectorToString(points[2]),
			QuadPainter.vectorToString(points[3]),
		];

		path.setAttribute("d", `M ${formattedPoints.join(" L ")} Z`);
		path.setAttribute("fill", fill);
		path.setAttribute("stroke", stroke.color);
		path.setAttribute("stroke-width", stroke.width.toFixed());
	}
}
