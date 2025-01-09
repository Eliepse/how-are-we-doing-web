import type { Collider } from "../Contract/Collider";
import type { Vector } from "../Vector";

export class ConstantCollider implements Collider {
	static collide = new ConstantCollider(true);
	static miss = new ConstantCollider(false);

	constructor(private _value: boolean) {}

	isInside(point: Vector): boolean {
		return this._value;
	}
}
