import type { Vector } from "../Vector";

export interface Collider {
	isInside(point: Vector): boolean;
}
