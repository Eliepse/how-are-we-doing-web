import { Opacity } from "../ValueObject/Opacity";

export type Interpolator<T> = (ratio: number, from: T, to: T) => T;

export function interpolateNumber(ratio: number, from: number, to: number): number {
	return from + ((to - from) * ratio);
}

export function interpolateOpacity(ratio: number, from: Opacity, to: Opacity): Opacity {
	return new Opacity(interpolateNumber(ratio, from.ratio, to.ratio));
}

export function linear(x: number) {
	return x;
}

export function easeInCubic(x: number): number {
	return x * x * x;
}

export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(x: number): number {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export const Interpolation = {
	linear,
	easeInCubic,
	easeOutCubic,
	easeInOutCubic,
} as const;