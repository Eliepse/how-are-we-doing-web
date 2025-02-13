import type { Vector } from "../../Engine2D/ValueObject/Vector";
import { SVGShape } from "../Shape/SVGShape";
import type { FillAndStroke } from "../FillAndStroke";

export class Line extends SVGShape {
	private dom: SVGLineElement;

	constructor() {
		super();
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "line");
	}

	updateMesh(from: Vector, to: Vector): void {
		const a = from.toAttributes();
		const b = to.toAttributes();

		this.dom.setAttribute("x1", a.x);
		this.dom.setAttribute("y1", a.y);
		this.dom.setAttribute("x2", b.x);
		this.dom.setAttribute("y2", b.y);
	}

	updateStyle(style: FillAndStroke): void {
		style.updateElement(this.dom);
	}

	override mount(container: SVGElement): void {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}
