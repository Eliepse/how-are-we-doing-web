import { PI2 } from "../math";
import type { Parameter } from "./Parameter";
import { Vector } from "./Vector";

const radToDegRatio = 180 / Math.PI;
const degToRadRatio = Math.PI / 180;

export class Angle implements Parameter {
	static Zero = new Angle(0);
	static PI = new Angle(Math.PI);
	static PI2 = new Angle(PI2);
	static HALF_PI = new Angle(-Math.PI);

	private readonly radian: number;

	constructor(radian: number = 0) {
		this.radian = radian;
	}

	get rad() {
		return this.radian;
	}

	get deg() {
		return radToDegRatio * this.radian;
	}

	get sin() {
		return Math.sin(this.radian);
	}

	get cos() {
		return Math.cos(this.radian);
	}

	get tan() {
		return Math.tan(this.radian);
	}

	add(angle: number | Angle) {
		if (angle instanceof Angle) {
			return new Angle((this.radian + angle.rad) % PI2);
		}

		return new Angle((this.radian + angle) % PI2);
	}

	sub(angle: number | Angle) {
		if (angle instanceof Angle) {
			return new Angle((this.radian - angle.rad) % PI2);
		}

		return new Angle((this.radian - angle) % PI2);
	}

	div(divider: number) {
		return new Angle(this.radian / divider);
	}

	mul(ratio: number) {
		return new Angle((this.radian * ratio) % PI2);
	}

	rotate(point: Vector, origin: Vector): Vector {
		if (0 === this.radian) {
			return point.clone();
		}

		const cos = Math.cos(this.radian);
		const sin = Math.sin(this.radian);

		return new Vector(
			cos * (point.x - origin.x) + sin * (point.y - origin.y) + origin.x,
			cos * (point.y - origin.y) - sin * (point.x - origin.x) + origin.y,
		);
	}

	isEqual(parameter: Parameter): boolean {
		return parameter instanceof Angle && Angle.isEqual(this, parameter);
	}

	static fromDeg(degrees: number) {
		return new Angle(degToRadRatio * (degrees % 360));
	}

	static isEqual(a: Angle, b: Angle) {
		return a.rad === b.rad;
	}

	static isDiff(a: Angle, b: Angle) {
		return !Angle.isEqual(a, b);
	}
}
