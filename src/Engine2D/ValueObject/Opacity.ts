import type { Parameter } from "./Parameter";
import { clamp } from "../math";

export class Opacity implements Parameter {
	static Opaque = new Opacity(1);
	static Transparent = new Opacity(0);

	private readonly value: number;

	constructor(value: number = 1) {
		this.value = clamp(0, value, 1);
	}

	get ratio(): number {
		return this.value;
	}

	mul(factor: number | Opacity) {
		return new Opacity(this.value * (factor instanceof Opacity ? factor.value : clamp(0, factor, 1)));
	}

	isEqual(parameter: Parameter): boolean {
		return parameter instanceof Opacity && Opacity.isEqual(this, parameter);
	}

	static isEqual(a: Opacity, b: Opacity): boolean {
		return a.value === b.value;
	}

	static isDiff(a: Opacity, b: Opacity): boolean {
		return false === Opacity.isEqual(a, b);
	}
}
