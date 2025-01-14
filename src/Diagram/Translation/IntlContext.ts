export class IntlContext {
	constructor(public readonly locale: string, private _translations: Map<string, string>) {}

	translate(key: string): string {
		return this._translations.get(key) ?? key;
	}
}
