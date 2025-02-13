import { Config } from "../../config";
import type { Symbolic } from "../../Engine2D/Contract/renderable";
import type { Angle } from "../../Engine2D/ValueObject/Angle";
import type { Vector } from "../../Engine2D/ValueObject/Vector";
import type { FillAndStroke } from "../FillAndStroke";
import { Painter } from "./Painter";

export class SymbolPainter extends Painter {
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
		style: FillAndStroke,
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
