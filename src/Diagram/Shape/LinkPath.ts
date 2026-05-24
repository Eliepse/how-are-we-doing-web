import { SVGShape } from "../../SVGRenderer/Shape/SVGShape";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { colors } from "../colors";
import type { Vector } from "../../Engine2D/ValueObject/Vector";
import { Color } from "../../Engine2D/ValueObject/Color";
import { linkGradient } from "./LinkGradient";

export const style = {
	selected: new SVGStyle({ stroke: new Stroke({ width: 2, color: colors.primary.alpha(0.6) }) }),
	selectedDeterminantMode: new SVGStyle({ stroke: new Stroke({ width: 2, color: linkGradient, strokeDash: [6, 3] }) }),
	preview: new SVGStyle({ stroke: new Stroke({ width: 2, color: Color.White.alpha(0.45), strokeDash: [6, 3] }) }),
}

export class LinkPath extends SVGShape {
	private readonly dom: SVGPathElement;

	constructor() {
		super(50);
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.updateStyle(style.selected);
	}

	updateMesh(from: Vector, fromAnchor: Vector, to: Vector, toAnchor: Vector): void {
		this.dom.setAttribute("d", `M ${from} C ${fromAnchor} ${toAnchor} ${to}`);
	}

	updateStyle(style: SVGStyle): void {
		style.updateElement(this.dom);
	}

	get classList() {
		return this.dom.classList;
	}

	override mount(container: Element): void {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}