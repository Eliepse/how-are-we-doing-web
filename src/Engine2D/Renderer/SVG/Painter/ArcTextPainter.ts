import type { Angle } from "../../../Parameters/Angle";
import { Vector } from "../../../Vector";
import { Painter } from "./Painter";

const arcIndexGenerator = (function* () {
	let i = 0;
	while (true) {
		yield `internal:arc-${i}`;
		i++;
	}
})();

export class ArcTextPainter extends Painter {
	static make(): { path: SVGPathElement; textPath: SVGTextPathElement; text: SVGTextElement } {
		const id = arcIndexGenerator.next().value;

		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.id = id;
		path.setAttribute("stroke", "none");
		path.setAttribute("fill", "none");

		const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
		textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
		textPath.setAttribute("text-anchor", "middle");
		textPath.setAttribute("startOffset", "50%");

		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.append(textPath);

		return { path, text, textPath };
	}

	static updateText(element: SVGTextPathElement, text: string): void {
		element.textContent = text;
	}

	static updateArc(
		path: SVGPathElement,
		center: Vector,
		radius: number,
		startAngle: Angle,
		endAngle: Angle
	): void {
		const largeArc = endAngle.sub(startAngle).rad <= Math.PI ? "0" : "1";
		const start = new Vector(startAngle.cos * radius, startAngle.sin * radius)
			.add(center)
			.toAttributes();
		const end = new Vector(endAngle.cos * radius, endAngle.sin * radius)
			.add(center)
			.toAttributes();

		const attrD = [
			`M ${start.x} ${start.y} A`,
			`${radius} ${radius}`,
			`0 ${largeArc} 1`,
			`${end.x} ${end.y}`,
		].join(" ");

		path.setAttribute("d", attrD);
	}
}
