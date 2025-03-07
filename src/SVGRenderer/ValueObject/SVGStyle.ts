import { Config } from "../../config";
import { Color } from "../../Engine2D/ValueObject/Color";
import type { Stroke } from "./Stroke";
import type { Referencable } from "../Referencable/Referencable";

export class SVGStyle {
	public readonly fill?: Color | Referencable | string;
	public readonly stroke?: Stroke;
	public readonly opacity: number = 1;

	constructor(config: { fill?: Color | Referencable | string, stroke?: Stroke, opacity?: number }) {
		this.fill = config.fill;
		this.stroke = config.stroke;
		this.opacity = config.opacity ?? 1;
	}

	updateElement(element: SVGElement): void {
		if (this.fill instanceof Color) {
			element.setAttribute("fill", this.fill.toHexAlpha());
		} else if (typeof this.fill === "string") {
			element.setAttribute("fill", this.fill);
		} else if (this.fill && "getRefID" in this.fill) {
			element.setAttribute("fill", `url(#${this.fill.getRefID()})`);
		} else {
			element.setAttribute("fill", "none");
		}

		if (this.stroke) {
			element.setAttribute("stroke", this.stroke.color.toHexAlpha());
			element.setAttribute("stroke-width", this.stroke.width.toFixed(Config.Render.precision));
		} else {
			element.removeAttribute("stroke");
			element.removeAttribute("stroke-width");
		}

		element.style.opacity = this.opacity.toFixed(2);
	}
}
