import type { Collider } from "../Contract/Collider";
import type { Angle } from "../Parameters/Angle";
import type { Vector } from "../Vector";

export class TorusCollider implements Collider {
	private _torusInnerRadiusSq: number;
	private _torusOuterRadiusSq: number;

	constructor(_torusCenter: Vector, _torusRadius: number, _torusWidth: number);
	constructor(
		private _torusCenter: Vector,
		torusRadius: number,
		torusWidth: number,
		private _arc?: Angle,
		private _arcOffset?: Angle
	) {
		const halfWidth = torusWidth / 2;
		this._torusInnerRadiusSq = Math.pow(torusRadius - halfWidth, 2);
		this._torusOuterRadiusSq = Math.pow(torusRadius + halfWidth, 2);
	}

	isInside(point: Vector): boolean {
		const distance = this._torusCenter.distanceSq(point);

		// Is it inside the torus ?
		if (this._torusInnerRadiusSq > distance || this._torusOuterRadiusSq < distance) {
			return false;
		}

		// No angle check
		if (undefined === this._arc || undefined === this._arcOffset) {
			return true;
		}

		const angleStart = this._arcOffset;
		const angleEnd = this._arcOffset.add(this._arc);
		const pointAngle = point.sub(this._torusCenter).angle();

		return angleStart.rad <= pointAngle && angleEnd.rad >= pointAngle;
	}
}
