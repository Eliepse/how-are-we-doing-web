import type { Angle } from "../../Engine2D/ValueObject/Angle";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { SVGShape } from "./SVGShape";
import type { Opacity } from "../../Engine2D/ValueObject/Opacity";

const arcIndexGenerator = (function* () {
	let i = 0;
	while (true) {
		yield `internal:arc-${i}`;
		i++;
	}
})();

export class ArcText extends SVGShape {
	private readonly pathDom: SVGPathElement;
	private readonly textPathDom: SVGTextPathElement;
	private readonly textDom: SVGTextElement;

	constructor(private text: string) {
		super(1);

		const id = arcIndexGenerator.next().value;

		this.pathDom = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.pathDom.id = id;
		this.pathDom.setAttribute("stroke", "none");
		this.pathDom.setAttribute("fill", "none");

		this.textPathDom = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
		this.textPathDom.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
		this.textPathDom.setAttribute("text-anchor", "middle");
		this.textPathDom.setAttribute("startOffset", "50%");

		this.textDom = document.createElementNS("http://www.w3.org/2000/svg", "text");
		this.textDom.append(this.textPathDom);

		this.updateText(text);
	}

	updateText(text: string): void {
		this.text = text;
		this.textPathDom.textContent = this.text;
	}

	updateMesh(center: Vector, radius: number, startAngle: Angle, endAngle: Angle): void {
		const largeArc = endAngle.sub(startAngle).rad <= Math.PI ? "0" : "1";
		const start = new Vector(startAngle.cos * radius, startAngle.sin * radius).add(center);
		const end = new Vector(endAngle.cos * radius, endAngle.sin * radius).add(center);

		this.pathDom.setAttribute("d", `M ${start} A ${radius} ${radius} 0 ${largeArc} 1 ${end}`);
	}

	updateOpacity(value: Opacity) {
		this.textDom.style.opacity = value.ratio.toFixed(2);
	}

	override mount(container: Element): void {
		container.append(this.pathDom);
		container.append(this.textDom);
	}

	override unmount(): void {
		this.pathDom.remove();
		this.textDom.remove();
	}
}
