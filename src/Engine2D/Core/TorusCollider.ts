import type { Collider } from "../Contract/Collider";
import { Angle } from "../Parameters/Angle";
import { Vector } from "../Vector";

export class TorusCollider implements Collider {
	private _torusInnerRadiusSq: number;
	private _torusOuterRadiusSq: number;
	private _torusOffset: Angle = Angle.Zero;
	private _startAngle: Angle = Angle.Zero;
	private _endAngle: Angle = Angle.PI2;

	constructor(
		private _torusCenter: Vector,
		torusRadius: number,
		torusWidth: number,
		arc: Angle = Angle.PI2,
		arcStart: Angle = Angle.Zero,
	) {
		const halfWidth = torusWidth / 2;
		this._torusInnerRadiusSq = Math.pow(torusRadius - halfWidth, 2);
		this._torusOuterRadiusSq = Math.pow(torusRadius + halfWidth, 2);

		if (arcStart.rad < 0) {
			this._torusOffset = arcStart;
			arcStart = Angle.Zero;
		}

		this._startAngle = arcStart;
		this._endAngle = arcStart.add(arc);
	}

	setCenter(point: Vector): void {
		this._torusCenter;
	}

	isInside(point: Vector): boolean {
		const relativePoint = point.sub(this._torusCenter);
		const distance = relativePoint.magSq();

		// Is it inside the torus ?
		if (this._torusInnerRadiusSq > distance || this._torusOuterRadiusSq < distance) {
			return false;
		}

		// Ne need to check the angle
		if (Angle.Zero === this._startAngle && Angle.PI2 === this._endAngle) {
			return true;
		}

		let pointAngle = relativePoint.angle(true);

		// When the start point is negative, we change the base for the 0
		if (Angle.Zero !== this._torusOffset) {
			pointAngle = pointAngle.sub(Angle.PI2.add(this._torusOffset));
		}

		return this._startAngle.rad <= pointAngle.rad && this._endAngle.rad >= pointAngle.rad;
	}
}
