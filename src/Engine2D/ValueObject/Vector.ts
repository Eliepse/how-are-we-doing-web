import { Config } from "../../config";
import { Angle } from "./Angle";

export class Vector {
	public static Zero = new Vector(0, 0);
	public static One = new Vector(1, 1);
	public static Top = new Vector(0, 1);
	public static Right = new Vector(1, 0);
	public static Bottom = new Vector(0, -1);
	public static Left = new Vector(-1, 0);

	public readonly x: number;
	public readonly y: number;

	constructor(x: number, y?: number) {
		this.x = x;
		this.y = y ?? x;
	}

	add(v: Vector): Vector {
		return new Vector(v.x + this.x, v.y + this.y);
	}

	sub(v: Vector): Vector {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	/**
	 * Rotate with a pivot point of Zero
	 *
	 * @param radian
	 * @returns
	 */
	rot(radian: number | Angle): Vector {
		const value: number = radian instanceof Angle ? radian.rad : radian;

		if (0 === value) {
			return this.clone();
		}

		return new Vector(
			this.x * Math.cos(value) - this.y * Math.sin(value),
			this.x * Math.sin(value) + this.y * Math.cos(value),
		);
	}

	mul(ratio: number | Vector): Vector {
		if (ratio instanceof Vector) {
			return new Vector(this.x * ratio.x, this.y * ratio.y);
		}

		return new Vector(this.x * ratio, this.y * ratio);
	}

	div(ratio: number | Vector): Vector {
		if (ratio instanceof Vector) {
			return new Vector(this.x / ratio.x, this.y / ratio.y);
		}

		return new Vector(this.x / ratio, this.y / ratio);
	}

	magSq(): number {
		return this.x * this.x + this.y * this.y;
	}

	mag(): number {
		return Math.sqrt(this.magSq());
	}

	/**
	 * @param fullCircle When true, base the angle on [0, 2 * PI] instead of [Pi, -Pi]
	 */
	angle(fullCircle = false): Angle {
		const angle = new Angle(Math.atan2(this.y, this.x));

		if (fullCircle && this.y < 0) {
			return angle.add(Angle.PI2);
		}

		return angle;
	}

	angleTo(target: Vector): Angle {
		const dot = this.mul(target);
		return new Angle(Math.atan2(dot.x - dot.y, dot.x + dot.y));
	}

	distanceSq(dest: Vector): number {
		return dest.sub(this).magSq();
	}

	distance(dest: Vector): number {
		return Math.sqrt(this.distanceSq(dest));
	}

	clone(): Vector {
		return new Vector(this.x, this.y);
	}

	isEqual(vector: Vector): boolean {
		return this.x === vector.x && this.y === vector.y;
	}

	toAttributes() {
		return {
			x: this.x.toFixed(Config.Render.precision),
			y: this.y.toFixed(Config.Render.precision),
		} as const;
	}

	toString(withComma = false): string {
		const attr = this.toAttributes();
		return [attr.x, attr.y].join(withComma ? ", " : " ");
	}

	static rand(size: number = 1) {
		return new Vector((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).mul(size);
	}
}
