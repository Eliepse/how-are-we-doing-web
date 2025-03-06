import type { Translator } from "./Translator";

type UpdateClb = (text: string) => void;

export class IntlStr {
	constructor(
		private readonly key: string,
		private readonly onUpdate: UpdateClb,
	) {
	}

	update(translator: Translator): void {
		this.onUpdate(translator.t(this.key));
	}
}
