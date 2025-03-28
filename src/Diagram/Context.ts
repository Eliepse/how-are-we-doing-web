import type { Steps } from "./Items/Determinant/Determinant";
import type { DeterminantKey } from "./types";

export class Context {
	constructor(
		public readonly id: string,
		public readonly name: string,
		private readonly values: { [key in DeterminantKey]: number | null },
		public readonly isDefault = false,
	) {}

	getValue(key: DeterminantKey): Steps | null {
		const value = this.values[key] ?? null;
		return null === value ? null : (Math.round(value * 4) as Steps);
	}

	normalize() {
		return {
			id: this.id,
			name: this.name,
			isDefault: this.isDefault,
		};
	}
}
