import type { ActionsHandler } from "./ActionsHandler";
import Collector from "../Telemetry/Collector";

export class LexiconActionsHandler implements ActionsHandler {
	private readonly dom: HTMLElement;

	constructor() {
		const _dom = document.querySelector<HTMLElement>("#lexicon");

		if (!_dom) {
			throw new Error("Unable to find #lexicon");
		}

		this.dom = _dom;

		const tabsMap = new Map<string, Map<string, HTMLElement>>();
		const tabsButtons = new Set<HTMLElement>(document.querySelectorAll<HTMLElement>("[data-toggle-tab]"));

		document.querySelectorAll<HTMLElement>("[data-tab]").forEach((el) => {
			const key = el.dataset.tab ?? "";
			const prefix = key.split(":")[0];

			if (!key || !prefix) {
				return;
			}

			const map = tabsMap.get(prefix) ?? new Map<string, HTMLElement>();
			map.set(key, el);
			tabsMap.set(prefix, map);
		});

		for (const button of tabsButtons) {
			button.addEventListener("mousedown", (e) => {
				e.stopPropagation();
				e.preventDefault();

				const key = button.dataset.toggleTab;
				const prefix = key?.split(":")[0];

				if (!key || !prefix) {
					return;
				}

				for (const item of tabsButtons) {
					item.dataset.tabActive = button === item ? "true" : "false";
				}

				const map = tabsMap.get(prefix) ?? new Map<string, HTMLElement>();
				for (const [targetKey, target] of map.entries()) {
					target.style.display = key === targetKey ? "" : "none";
				}
			});
		}
	}

	open() {
		Collector.logEvent("lexicon_closed");
		this.dom.ariaHidden = "false";
		this.dom.style.display = "";
	}

	close() {
		Collector.logEvent("lexicon_closed");
		this.dom.ariaHidden = "true";
		this.dom.style.display = "none";
	}

	actions(): Record<string, () => void> {
		return {
			"lexicon:open": () => this.open(),
			"lexicon:close": () => this.close(),
		};
	}
}