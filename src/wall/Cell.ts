import { Vector } from "../Engine2D/ValueObject/Vector";

export class Cell {
	constructor(public readonly position: Vector, public readonly size: Vector, public readonly priority = 0) {
	}
}