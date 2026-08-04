import type { DeterminantKey } from "./types";
import type { Steps } from "./Items/Determinant/Determinant";

export type Details = {
	story: string;
	health_stake: string;
	image_main: string;
	images_glance: string[];
}

export class Context {
	constructor(
		public readonly id: string,
		public readonly name: string,
		private readonly values: { [key in DeterminantKey]: number | null },
		public readonly isDefault = false,
		public readonly details?: Details,
	) {
	}

	getValue(key: DeterminantKey): Steps | null {
		const value = this.values[key] ?? null;
		return null === value ? null : Math.round(value * 4) as Steps;
	}
}