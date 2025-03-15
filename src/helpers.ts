export function arr(size: number): Array<undefined> {
	return Array(size).fill(undefined);
}

export function interpolate(from: number, to: number, percent: number): number {
	return from + ((to - from) * percent);
}

export function wait(delayMs: number): Promise<void> {
	return new Promise((r) => setTimeout(r, delayMs));
}

export function pickRandom<T>(array: Array<T>): T {
	const index = Math.floor(Math.random() * array.length);
	return array[index];
}

/**
 * @param array
 *
 * @see https://bost.ocks.org/mike/shuffle/
 */
export function shuffle<T>(array: Array<T>): Array<T> {
	var m = array.length, t, i;

	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}