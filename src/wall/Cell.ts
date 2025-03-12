import { Vector } from "../Engine2D/ValueObject/Vector";

export class Cells {
	constructor(public readonly position: Vector, public readonly size: Vector, public readonly priority = 0) {
	}
}