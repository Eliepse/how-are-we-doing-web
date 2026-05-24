import type { Color } from "../../Engine2D/ValueObject/Color";
import type { Referencable } from "../Referencable/Referencable";

export class Stroke {
	public width: number;
	public color: Color | Referencable;
	public strokeDash?: number[];

	constructor(
		config: {
			width?: number,
			color: Color | Referencable,
			strokeDash?: number[],
		},
	) {
		this.width = config.width ?? 1;
		this.color = config.color;
		this.strokeDash = config.strokeDash;
	}
}
