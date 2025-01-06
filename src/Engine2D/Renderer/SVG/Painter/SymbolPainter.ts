import { Config } from "../../../../config";
import type { Symbolic } from "../../../Contract/renderable";
import type { Angle } from "../../../Parameters/Angle";
import type { Vector } from "../../../Vector";
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
		rotation: Angle
	): void {
		const domPosition = symbol.getPivot().sub(position).toAttributes();
		const transformPivot = position.toAttributes();
		const degrees = rotation.add(symbol.getAngle()).deg.toFixed(Config.Render.precision);
		const transformAttr = `rotate(${degrees}, ${transformPivot.x}, ${transformPivot.y})`;

		element.setAttribute("x", domPosition.x);
		element.setAttribute("y", domPosition.y);
		element.setAttribute("transform", transformAttr);
	}
}
