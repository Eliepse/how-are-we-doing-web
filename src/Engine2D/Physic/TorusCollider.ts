import type { Collider } from "./Collider";
import { Angle } from "../ValueObject/Angle";
import { Vector } from "../ValueObject/Vector";
import { isInRange } from "../math";

export class TorusCollider implements Collider {
	private readonly torusInnerRadiusSq: number;
	private readonly torusOuterRadiusSq: number;
	private readonly torusOffset: Angle = Angle.Zero;
	private readonly angleSize: Angle = Angle.PI2;

	constructor(
		private _torusCenter: Vector,
		torusRadius: number,
		torusWidth: number,
		arc: Angle = Angle.PI2,
		arcStart: Angle = Angle.Zero,
	) {
		const halfWidth = torusWidth / 2;
		this.torusInnerRadiusSq = Math.pow(torusRadius - halfWidth, 2);
		this.torusOuterRadiusSq = Math.pow(torusRadius + halfWidth, 2);

		// Keep the difference to later check the angle as if it started from Zero
		this.torusOffset = arcStart.mul(-1);
		this.angleSize = arc;
	}

	setCenter(point: Vector): void {
		this._torusCenter = point;
	}

	isInside(point: Vector): boolean {
		const centerToPoint = point.sub(this._torusCenter);
		const distance = centerToPoint.magSq();

		// Is it inside the torus ?
		if (this.torusInnerRadiusSq >= distance || this.torusOuterRadiusSq <= distance) {
			return false;
		}

		// Ne need to check the angle in a full circle
		if (Angle.PI2 === this.angleSize) {
			return true;
		}

		// Get the angle and rotate to check the Angle from Zero
		const angle = centerToPoint.angle(true).add(this.torusOffset);
		return isInRange(0, angle.rad, this.angleSize.rad);
	}
}
