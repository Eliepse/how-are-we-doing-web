import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { SVGStyle } from "../ValueObject/SVGStyle";
import { SVGShape } from "./SVGShape";

export class Circle extends SVGShape {
	private readonly dom: SVGCircleElement;

	constructor(private radius: number) {
		super();
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.updateRadius();
	}

	private updateRadius(): void {
		this.dom.setAttribute("r", this.radius.toFixed(1));
	}

	updateMesh(position: Vector, radius?: number): void {
		if (undefined !== radius) {
			this.radius = radius;
			this.updateRadius();
		}

		const pos = position.toAttributes();
		this.dom.setAttribute("cx", pos.x);
		this.dom.setAttribute("cy", pos.y);
	}

	updateStyle(style: SVGStyle): void {
		style.updateElement(this.dom);
	}

	hide(): void {
		this.dom.style.display = "none";
	}

	show(): void {
		this.dom.style.display = "";
	}

	override mount(container: Element): void {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}
