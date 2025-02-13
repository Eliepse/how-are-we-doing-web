import type { Symbolic } from "../../Contract/renderable";
import { Angle } from "../Angle";
import { Vector } from "../Vector";

export class SymbolShape implements Symbolic {
	private readonly dom: SVGSymbolElement;

	constructor(
		id: string,
		shape: Element[],
		viewBox: Vector,
		size: Vector,
		private pivot: Vector = Vector.Zero,
		private angle: Angle = Angle.Zero
	) {
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
		this.dom.id = id;
		this.dom.setAttribute("viewBox", `0 0 ${viewBox.x.toFixed()} ${viewBox.y.toFixed()}`);
		this.dom.setAttribute("width", size.x.toFixed());
		this.dom.setAttribute("height", size.y.toFixed());

		shape.forEach((el) => this.dom.append(el));
	}

	getHref(): string {
		return `#${this.dom.id}`;
	}

	getDOM(): Element {
		return this.dom;
	}

	getPivot(): Vector {
		return this.pivot;
	}

	getAngle(): Angle {
		return this.angle;
	}
}
