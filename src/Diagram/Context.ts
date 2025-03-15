import type { DeterminantKey } from "./types";
import type { Steps } from "./Items/Determinant/Determinant";

export class Context {
	constructor(
		public readonly id: string,
		public readonly name: string,
		private readonly values: { [key in DeterminantKey]: number | null },
		public readonly isDefault = false,
	) {
	}

	getValue(key: DeterminantKey): Steps | null {
		const value = this.values[key] ?? null;
		return null === value ? null : Math.round(value * 4) as Steps;
	}
}