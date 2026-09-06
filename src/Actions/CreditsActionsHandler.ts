import type { ActionsHandler } from "./ActionsHandler";
import Collector from "../Telemetry/Collector";

export class CreditsActionsHandler implements ActionsHandler {
	private readonly dom: HTMLElement;

	constructor() {
		const _dom = document.querySelector<HTMLElement>("#credits");

		if(!_dom) {
			throw new Error("Unable to find #credits");
		}

		this.dom = _dom;
		this.dom.addEventListener("mousedown", (e) => e.stopPropagation());
		this.dom.addEventListener("mousemove", (e) => e.stopPropagation());
	}

	open() {
		Collector.logEvent("credits_opened");
		this.dom.ariaHidden = "false";
		this.dom.style.display = "";
	}

	close() {
		Collector.logEvent("credits_closed");
		this.dom.ariaHidden = "true";
		this.dom.style.display = "none";
	}

	actions(): Record<string, () => void> {
		return {
			"credits:open": () => this.open(),
			"credits:close": () => this.close(),
		};
	}
}