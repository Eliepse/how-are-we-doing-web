import type { Translator } from "./Translator";

type UpdateClb = (text: string) => void;

export class IntlStr {
	constructor(
		private readonly key: string,
		private readonly onUpdate: UpdateClb,
		private readonly onRequest: (key: string) => string,
		private readonly onDisconnect: (intlStr: IntlStr) => void,
	) {
	}

	update(translator: Translator): void {
		this.onUpdate(translator.t(this.key));
	}

	disconnect(): void {
		this.onDisconnect(this);
	}

	toString() {
		return this.onRequest(this.key);
	}
}
