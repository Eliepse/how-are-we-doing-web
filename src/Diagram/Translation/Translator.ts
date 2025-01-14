import { IntlContext } from "./IntlContext";

type Locale = string;

export class Translator {
	private _currentLocale: string;
	private _contextsByLocale = new Map<Locale, Map<string, IntlContext>>();

	constructor(
		private _urlPattern: string,
		public readonly defaultLocale: Locale,
		public readonly supportedLocales: Locale[],
		public readonly contexts: string[],
	) {
		if (false === this.isLocaleSupported(defaultLocale)) {
			throw new Error("Default locale isn't supported");
		}

		this._currentLocale = defaultLocale;
	}

	private makeUrl(context: string, locale: Locale): string {
		return this._urlPattern.replaceAll(/{([a-z]+)}/gi, (match, key) => {
			switch (key) {
				case "context":
					return context;
				case "lang":
					return locale;
				default:
					return match;
			}
		});
	}

	isLocaleSupported(locale: string): boolean {
		return this.supportedLocales.includes(locale);
	}

	async changeLocale(locale: string): Promise<void> {
		if (false === this.isLocaleSupported(locale)) {
			console.warn(`The locale '${locale}' is not supported`);
			return;
		}

		this._currentLocale = locale;
		await this.loadContexts();
	}

	async loadContexts(locale?: Locale): Promise<void> {
		await Promise.allSettled(
			this.contexts.map((context) => this.loadContext(context, locale ?? this._currentLocale)),
		);
	}

	async loadAll(): Promise<void> {
		await Promise.allSettled(this.supportedLocales.map((locale) => this.loadContexts(locale)));
	}

	private getLocaleContexts(locale: Locale): Map<string, IntlContext> {
		let contexts = this._contextsByLocale.get(locale);

		if (undefined === contexts) {
			contexts = new Map();
			this._contextsByLocale.set(locale, contexts);
		}

		return contexts;
	}

	private getContext(key: string, locale: Locale): IntlContext | undefined {
		return this.getLocaleContexts(locale).get(key);
	}

	private async loadContext(key: string, locale: string): Promise<void> {
		const response = await fetch(this.makeUrl(key, locale));
		const content = (await response.json()) as { [key: string]: string };
		const context = new IntlContext(key, new Map<string, string>(Object.entries(content)));
		this.getLocaleContexts(locale).set(key, context);
	}

	translate(key: string, context: string, locale?: string): string {
		if (locale && false === this.isLocaleSupported(locale)) {
			console.warn(`The locale '${locale}' is not supported`);
			return key;
		}

		const _locale = locale ?? this._currentLocale;
		const translation = this.getContext(context, _locale)?.translate(key);
		return translation ?? this.getContext(context, this.defaultLocale)?.translate(key) ?? key;
	}

	t(fullkey: string, locale?: string): string {
		const dotIndex = fullkey.indexOf(".");

		if (-1 === dotIndex) {
			return fullkey;
		}

		const contextKey = fullkey.slice(0, dotIndex);
		const key = fullkey.slice(dotIndex + 1);
		return this.translate(key, contextKey, locale);
	}
}
