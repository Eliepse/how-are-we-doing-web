import type { ActionsHandler } from "./ActionsHandler";
import { App } from "../App";

export class SystemActionsHandler implements ActionsHandler {
	private nav: HTMLElement;
	private legend: HTMLElement;

	constructor(
		private readonly app: App,
	) {
		const _nav = document.querySelector<HTMLElement>("#navigation");
		const _legend = document.querySelector<HTMLElement>("#legendRoot");

		if (!_nav || !_legend) {
			throw new Error("Unable to find UI elements");
		}

		this.nav = _nav;
		this.legend = _legend;

		document.addEventListener("keydown", (e) => {
			if ("i" === e.key) {
				this.toggleUIVisibility();
				return;
			}

			if ("d" === e.key) {
				this.toggleDebug();
				return;
			}
		});
	}

	toggleUIVisibility() {
		this.nav.style.display = this.nav.style.display.trim() ? "" : "none";
		this.legend.style.display = this.legend.style.display.trim() ? "" : "none";
	}

	toggleDebug() {
		this.app.setDebug(!this.app.debug);
	}

	actions(): Record<string, () => void> {
		return {
			"system:ui:toggle": () => this.toggleUIVisibility(),
			"system:debug:toggle": () => this.toggleDebug(),
		};
	}
}