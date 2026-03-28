import { Opacity } from "../ValueObject/Opacity";

export type Interpolator<T> = (ratio: number, from: T, to: T) => T;

export function interpolateNumber(ratio: number, from: number, to: number): number {
	return from + ((to - from) * ratio);
}

export function interpolateOpacity(ratio: number, from: Opacity, to: Opacity): Opacity {
	return new Opacity(interpolateNumber(ratio, from.ratio, to.ratio));
}