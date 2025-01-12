import { Config } from "../../../config";
import type { Color } from "../Color";
import type { Stroke } from "./Painter/Stroke";

export class FillAndStroke {
	constructor(
		public readonly fill?: Color,
		public readonly stroke?: Stroke,
		public readonly opacity: number = 1,
	) {}

	updateElement(element: SVGElement): void {
		if (this.fill) {
			element.setAttribute("fill", this.fill.toHexAlpha());
		} else {
			element.setAttribute("fill", "none");
		}

		if (this.stroke) {
			element.setAttribute("stroke", this.stroke.color);
			element.setAttribute("stroke-width", this.stroke.width.toFixed(Config.Render.precision));
		} else {
			element.removeAttribute("stroke");
			element.removeAttribute("stroke-width");
		}

		element.style.opacity = this.opacity.toFixed(2);
	}
}
