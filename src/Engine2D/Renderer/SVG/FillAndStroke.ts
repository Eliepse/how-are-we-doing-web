import { Config } from "../../../config";
import type { Color } from "../Color";
import type { Stroke } from "./Painter/Stroke";

export class FillAndStroke {
	constructor(private _fill?: Color, private _stroke?: Stroke) {}

	fill(): Color | undefined {
		return this._fill;
	}

	stroke(): Stroke | undefined {
		return this._stroke;
	}

	updateElement(element: SVGElement): void {
		if (this._fill) {
			element.setAttribute("fill", this._fill.toHexAlpha());
		} else {
			element.setAttribute("fill", "none");
		}

		if (this._stroke) {
			element.setAttribute("stroke", this._stroke.color);
			element.setAttribute("stroke-width", this._stroke.width.toFixed(Config.Render.precision));
		} else {
			element.removeAttribute("stroke");
			element.removeAttribute("stroke-width");
		}
	}
}
