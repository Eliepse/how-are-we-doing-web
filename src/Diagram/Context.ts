import type { DeterminantKey } from "./types";
import type { Steps } from "./Items/Determinant/Determinant";

export class Context {
	constructor(
		public readonly id: string,
		public readonly name: string,
		private readonly values: { [key in DeterminantKey]: number },
	) {
	}

	getValue(key: DeterminantKey): Steps | null {
		if (key in this.values) {
			return Math.round(this.values[key] * 4) as Steps;
		}

		return null;
	}
}