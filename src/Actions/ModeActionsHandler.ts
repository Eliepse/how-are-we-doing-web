import type { ActionsHandler } from "./ActionsHandler";
import type { Collector } from "../Telemetry/Collector";
import { App } from "../App";

export class ModeActionsHandler implements ActionsHandler {
	constructor(
		private readonly app: App,
		private readonly collector: Collector,
	) {
	}

	change(mode: "focus" | "detailled" | "basic") {
		const isFocus = App.feature("focus-determinant");

		// Already activated, skip
		if ("focus" === mode && isFocus) {
			return;
		}

		// Already activated, skip
		if ("detailled" === mode && !isFocus && App.feature("detailed-relations")) {
			return;
		}

		// Already activated, skip
		if ("basic" === mode && !App.feature("detailed-relations")) {
			return;
		}

		this.app.changeMode(mode);
		this.collector.logEvent("mode_changed", { mode });

		const legendDefault = document.querySelector<HTMLDivElement>("#legendRoot[data-legend=default]");
		const legendFocus = document.querySelector<HTMLDivElement>("#legendRoot[data-legend=focus]");

		if (!legendFocus || !legendDefault) {
			return;
		}

		// @ts-ignore
		if ("focus" === el.dataset.mode) {
			legendDefault.style.display = "none";
			legendFocus.style.display = "";
		} else {
			legendDefault.style.display = "";
			legendFocus.style.display = "none";
		}
	}

	actions(): Record<string, () => void> {
		return {
			"mode:change:basic": () => this.change("basic"),
			"mode:change:detailled": () => this.change("detailled"),
			"mode:change:focus": () => this.change("focus"),
		};
	}
}