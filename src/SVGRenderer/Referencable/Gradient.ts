import type { Referencable } from "./Referencable";
import type { Color } from "../../Engine2D/ValueObject/Color";

type Stops = { [index: number]: Color };

export class Gradient implements Referencable {
	private readonly dom: SVGGradientElement | SVGLinearGradientElement;

	constructor(private id: string, type: "radial" | "linear", stops: Stops) {
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "radial" === type ? "radialGradient" : "linearGradient");
		this.dom.id = id;

		Object.entries(stops).forEach(([percent, color]) => {
			const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			stop.setAttribute("offset", parseFloat(percent).toFixed(2) + "%");
			stop.setAttribute("stop-color", color.toHex());
			stop.setAttribute("stop-opacity", color.a.toFixed(3));
			this.dom.append(stop);
		});
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