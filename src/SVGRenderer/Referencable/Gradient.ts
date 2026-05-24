import type { Referencable } from "./Referencable";
import type { Color } from "../../Engine2D/ValueObject/Color";
import type { Vector } from "../../Engine2D/ValueObject/Vector";

type Stops = { [index: number]: Color };
type Config = {
	type: "radial" | "linear",
	gradientUnits: "userSpaceOnUse" | "objectBoundingBox";
}

export class Gradient implements Referencable {
	private readonly dom: SVGGradientElement | SVGLinearGradientElement;

	constructor(private id: string, stops: Stops, config?: Partial<Config>) {
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "radial" === config?.type ? "radialGradient" : "linearGradient");
		this.dom.id = id;

		this.dom.setAttribute("gradientUnits", config?.gradientUnits ?? "objectBoundingBox");

		Object.entries(stops).forEach(([percent, color]) => {
			const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
			stop.setAttribute("offset", parseFloat(percent).toFixed(2) + "%");
			stop.setAttribute("stop-color", color.toHex());
			stop.setAttribute("stop-opacity", color.a.toFixed(3));
			this.dom.append(stop);
		});
	}

	setCenter(position: Vector) {
		this.dom.setAttribute("cx", position.x.toFixed());
		this.dom.setAttribute("cy", position.y.toFixed());
	}

	getRefID(): string {
		return this.id;
	}

	getRefDOM(): SVGElement {
		return this.dom;
	}
}