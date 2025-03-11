import { SVGShape } from "../../SVGRenderer/Shape/SVGShape";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { colors } from "../colors";
import type { Vector } from "../../Engine2D/ValueObject/Vector";

const pathStyle = new SVGStyle({ stroke: new Stroke(2, colors.selected.alpha(0.6)) });

export class LinkPath extends SVGShape {
	private readonly dom: SVGPathElement;

	constructor() {
		super(50);
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.updateStyle(pathStyle);
	}

	updateMesh(from: Vector, fromAnchor: Vector, to: Vector, toAnchor: Vector): void {
		this.dom.setAttribute("d", `M ${from} C ${fromAnchor} ${toAnchor} ${to}`);
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