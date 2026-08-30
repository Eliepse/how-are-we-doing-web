import type { ActionsHandler } from "./ActionsHandler";
import type { App } from "../App";

export class ContextActionsHandler implements ActionsHandler {
	constructor(
		private readonly app: App,
	) {
		document.addEventListener("keydown", (e) => {
			if ("ArrowLeft" === e.key) {
				this.previous();
			} else if ("ArrowRight" === e.key) {
				this.next();
			}
		});
	}

	previous() {
		this.app.previousContext();
	}

	next() {
		this.app.nextContext();
	}

	actions(): Record<string, () => void> {
		return {
			"context:prev": () => this.previous(),
			"context:next": () => this.next(),
		};
	}
}