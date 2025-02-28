export function arr(size: number): Array<undefined> {
	return Array(size).fill(undefined);
}

export function interpolate(from: number, to: number, percent: number): number {
	return from + ((to - from) * percent);
}