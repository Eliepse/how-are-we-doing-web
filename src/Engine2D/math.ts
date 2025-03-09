export const PI2 = Math.PI * 2;

export function clamp(min: number, value: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function rand(max: number): number;
export function rand(min: number, max?: number): number;
export function rand(a: number, b?: number): number {
	const factor = Math.random();
	return undefined !== b ? a + (factor * (b - a)) : factor * a;
}