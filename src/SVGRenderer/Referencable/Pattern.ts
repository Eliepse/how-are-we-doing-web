import type { Referencable } from "./Referencable";
import { Vector } from "../../Engine2D/ValueObject/Vector";

export class Pattern implements Referencable {
	private readonly dom: SVGPatternElement;

	constructor(private id: string, size: Vector, viewBox: Vector, content: SVGElement[] = []) {
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
		this.dom.id = id;
		this.updateTiling(size, viewBox);
		this.updatePattern(content);
	}

	updateTiling(size: Vector, viewBox: Vector = Vector.Zero): void {
		this.dom.setAttribute("width", size.x.toFixed());
		this.dom.setAttribute("height", size.y.toFixed());
		this.dom.setAttribute("patternUnits", "userSpaceOnUse");
		this.dom.setAttribute("viewBox", `0 0 ${viewBox.x.toFixed()} ${viewBox.y.toFixed()}`);
	}

	updatePattern(content: SVGElement[]): void {
		this.dom.textContent = "";
		this.dom.append(...content);
	}

	getRefID(): string {
		return this.id;
	}

	getRefDOM(): SVGElement {
		return this.dom;
	}
}