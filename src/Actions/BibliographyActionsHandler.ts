import type { ActionsHandler } from "./ActionsHandler";
import type { App } from "../App";
import type { IntlStr } from "../Diagram/Translation/IntlStr";
import Collector from "../Telemetry/Collector";

export class BibliographyActionsHandler implements ActionsHandler {
	private readonly button: HTMLButtonElement;
	private readonly textShow: IntlStr;
	private readonly textHide: IntlStr;

	constructor(
		private readonly app: App,
	) {
		const _button = document.querySelector<HTMLButtonElement>("#biblioToggle");

		if (!_button) {
			throw new Error("Unable to find #biblioToggle");
		}

		this.button = _button;

		this.textShow = app.getTranslator().dyn(
			"general.show_bibliography",
			(txt) => "true" === this.button.ariaPressed && (this.button.innerText = txt),
		);

		this.textHide = app.getTranslator().dyn(
			"general.hide_bibliography",
			(txt) => "true" !== this.button.ariaPressed && (this.button.innerText = txt),
		);

		this.button.innerText = this.textShow.toString();
	}

	open() {
		this.app.showBibliography();
		Collector.logEvent("biblio_opened");
		this.button.ariaPressed = "true";
		this.button.innerText = this.textHide.toString();
	}

	close() {
		this.app.hideBibliography();
		Collector.logEvent("biblio_closed");
		this.button.ariaPressed = "false";
		this.button.innerText = this.textShow.toString();
	}

	toggle() {
		if ("true" === this.button.ariaPressed) {
			this.close();
			return;
		}

		this.open();
	}

	actions(): Record<string, () => void> {
		return {
			"biblio:toggle": () => this.toggle(),
			"biblio:close": () => this.close(),
		};
	}
}