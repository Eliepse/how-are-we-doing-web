import type { ActionsHandler } from "./ActionsHandler";
import type { Collector } from "../Telemetry/Collector";
import type { Translator } from "../Diagram/Translation/Translator";

export class LanguageActionsHandler implements ActionsHandler {
	constructor(
		private readonly translator: Translator,
		private readonly collector: Collector,
	) {
	}

	private updateLocalDisplay() {
		const currentLocale = this.translator.currentLocale;

		document.querySelectorAll<HTMLElement>("[data-lang-show]").forEach((element) => {
			element.style.display = element.dataset.langShow === currentLocale ? "" : "none";
		});

		document.querySelectorAll<HTMLElement>("[data-locale-current]").forEach((element) => {
			element.textContent = currentLocale;
		});
	}

	toggle() {
		const currentIndex = this.translator.supportedLocales.indexOf(this.translator.currentLocale);
		const newIndex = (currentIndex + 1) % this.translator.supportedLocales.length;
		const newLocale = this.translator.supportedLocales[newIndex];

		if (!newLocale) {
			console.error("Unable to toggle the locale");
			return;
		}

		this.collector.logEvent("locale_changed", { locale: newLocale });
		void this.translator.changeLocale(newLocale);
		this.updateLocalDisplay();
	}

	actions(): Record<string, () => void> {
		return {
			"locale:toggle": () => this.toggle(),
		};
	}
}