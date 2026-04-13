import type { Color } from "../../Engine2D/ValueObject/Color";

export class Stroke {
	public width: number;
	public color: Color;
	public strokeDash?: number[];

	constructor(
		config: {
			width?: number,
			color: Color,
			strokeDash?: number[],
		},
	) {
		this.width = config.width ?? 1;
		this.color = config.color;
		this.strokeDash = config.strokeDash;
	}
}
