import type { Parameter } from "../Contract/Parameter";
import { Vector } from "../Vector";

const radToDegRatio = 180 / Math.PI;
const degToRadRatio = Math.PI / 180;

export class Angle implements Parameter {
	static Zero = new Angle(0);
	static PI = new Angle(Math.PI);
	static PI2 = new Angle(Math.PI * 2);

	constructor(private radian: number = 0) {}

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
			return new Angle(this.radian + angle.rad);
		}

		return new Angle(this.radian + angle);
	}

	sub(angle: number | Angle) {
		if (angle instanceof Angle) {
			return new Angle(this.radian - angle.rad);
		}

		return new Angle(this.radian - angle);
	}

	div(divider: number) {
		return new Angle(this.radian / divider);
	}

	mul(ratio: number) {
		return new Angle(this.radian * ratio);
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
		return parameter instanceof Angle && parameter.rad === this.rad;
	}

	static fromDeg(degrees: number) {
		return new Angle(degToRadRatio * degrees);
	}
}
