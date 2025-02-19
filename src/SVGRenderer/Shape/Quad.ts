import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { SVGStyle } from "../ValueObject/SVGStyle";
import { SVGShape } from "./SVGShape";

export class Quad extends SVGShape {
	private readonly dom: SVGPathElement;

	constructor() {
		super(1);
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "path");
	}

	updateMesh(points: [Vector, Vector, Vector, Vector]): void {
		this.dom.setAttribute("d", `M ${points.join(" L ")} Z`);
	}

	updateStyle(style: SVGStyle): void {
		style.updateElement(this.dom);
	}

	override mount(container: Element): void {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}
