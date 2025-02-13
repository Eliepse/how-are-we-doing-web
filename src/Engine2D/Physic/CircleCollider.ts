import type { Collider } from "./Collider";
import type { Vector } from "../ValueObject/Vector";

export class CircleCollider implements Collider {
	constructor(private _position: Vector, private _radius: number) {}

	isInside(point: Vector): boolean {
		return this._position.distanceSq(point) <= Math.pow(this._radius, 2);
	}
}
