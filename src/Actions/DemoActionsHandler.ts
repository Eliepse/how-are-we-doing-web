import type { ActionsHandler } from "./ActionsHandler";
import type { Collector } from "../Telemetry/Collector";
import Demo from "../Tutorials/Demo";
import { Presenter } from "../Tutorials/Presenter";

export class DemoActionsHandler implements ActionsHandler {
	constructor(private readonly collector: Collector) {}

	open() {
		document.querySelectorAll<HTMLElement>("#navigation [data-key='actions-side'] [data-action]")
			.forEach((el) => {
				el.style.display = "demo:close" !== el.dataset.action ? "none" : "";
			});
		Demo.start();
		this.collector.logEvent("presenter_opened");
	}

	close() {
		Presenter.hide();
		document.querySelectorAll<HTMLElement>("#navigation [data-key='actions-side'] [data-action]")
			.forEach((el) => {
				el.style.display = "demo:close" === el.dataset.action ? "none" : "";
			});
		this.collector.logEvent("presenter_closed");
	}

	actions(): Record<string, () => void> {
		return {
			"demo:open": () => this.open(),
			"demo:close": () => this.close(),
		};
	}
}