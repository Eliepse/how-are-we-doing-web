import { Config } from "../../config";
import type { Symbolic } from "../../Engine2D/Contract/renderable";
import type { Angle } from "../../Engine2D/ValueObject/Angle";
import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { SVGStyle } from "../ValueObject/SVGStyle";
import { SVGShape } from "./SVGShape";

export class SVGSymbol extends SVGShape {
	private readonly dom: SVGUseElement;

	constructor(private readonly symbol: Symbolic) {
		super(1);

		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "use");
		this.dom.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", symbol.getHref());
	}

	updateMesh(position: Vector, rotation: Angle): void {
		const domPosition = position.sub(this.symbol.getPivot()).toAttributes();
		const degrees = rotation.add(this.symbol.getAngle()).deg.toFixed(Config.Render.precision);

		this.dom.setAttribute("x", domPosition.x);
		this.dom.setAttribute("y", domPosition.y);
		this.dom.setAttribute("transform", `rotate(${degrees}, ${position.toString(true)})`);

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

	static make(shape: Symbolic): SVGUseElement {
		const element = document.createElementNS("http://www.w3.org/2000/svg", "use");
		element.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", shape.getHref());
		return element;
	}

	static update(
		element: SVGUseElement,
		symbol: Symbolic,
		position: Vector,
		rotation: Angle,
		style: SVGStyle,
	): void {
		const domPosition = position.sub(symbol.getPivot()).toAttributes();
		const transformPivot = position.toAttributes();
		const degrees = rotation.add(symbol.getAngle()).deg.toFixed(Config.Render.precision);
		const transformAttr = `rotate(${degrees}, ${transformPivot.x}, ${transformPivot.y})`;

		element.setAttribute("x", domPosition.x);
		element.setAttribute("y", domPosition.y);
		element.setAttribute("transform", transformAttr);

		style.updateElement(element);
	}
}
