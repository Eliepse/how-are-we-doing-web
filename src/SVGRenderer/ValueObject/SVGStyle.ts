import { Config } from "../../config";
import type { Color } from "../../Engine2D/ValueObject/Color";
import type { Stroke } from "./Stroke";

export class SVGStyle {
	public readonly fill?: Color;
	public readonly stroke?: Stroke;
	public readonly opacity: number = 1;

	constructor(config: { fill?: Color, stroke?: Stroke, opacity?: number }) {
		this.fill = config.fill;
		this.stroke = config.stroke;
		this.opacity = config.opacity ?? 1;
	}

	updateElement(element: SVGElement): void {
		if (this.fill) {
			element.setAttribute("fill", this.fill.toHexAlpha());
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
