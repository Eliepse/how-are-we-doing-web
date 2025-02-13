import type { Vector } from "../ValueObject/Vector";

export interface Collider {
	isInside(point: Vector): boolean;
}
