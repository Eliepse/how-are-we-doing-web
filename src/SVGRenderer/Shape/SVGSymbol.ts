import { Config } from "../../config";
import type { Symbolic } from "../../Engine2D/Contract/renderable";
import type { Angle } from "../../Engine2D/ValueObject/Angle";
import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { SVGStyle } from "../ValueObject/SVGStyle";
import { SVGShape } from "./SVGShape";
import type { ClipPath } from "../../Engine2D/ValueObject/Clip";

export class SVGSymbol extends SVGShape {
	protected readonly dom: SVGUseElement;

	constructor(private readonly symbol: Symbolic, layer: number = 1) {
		super(layer);

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

	updateStyle(style: SVGStyle, clipPath?: ClipPath): void {
		style.updateElement(this.dom);

		if (clipPath) {
			this.dom.setAttribute("clip-path", clipPath.toString());
		}
	}

	blur(amount: number): void {
		if (0 >= amount) {
			this.dom.style.filter = "";
			return;
		}

		this.dom.style.filter = `blur(${amount}px)`;
	}

	get DOM() {
		return this.dom;
	}

	override mount(container: Element): void {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}
