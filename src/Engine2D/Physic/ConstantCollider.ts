import type { Collider } from "./Collider";
import type { Vector } from "../ValueObject/Vector";

export class ConstantCollider implements Collider {
	static collide = new ConstantCollider(true);
	static miss = new ConstantCollider(false);

	constructor(private _value: boolean) {}

	isInside(_point: Vector): boolean {
		return this._value;
	}
}
