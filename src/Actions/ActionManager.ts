import type { ActionsHandler } from "./ActionsHandler";

export class ActionManager {
	private static actions = new Map<string, () => void>();

	static register(...handlers: ActionsHandler[]) {
		handlers.forEach((handler) => ActionManager.registerHandler(handler));
	}

	private static registerHandler(handler: ActionsHandler): void {
		Object.entries(handler.actions()).forEach(([key, clb]) => {
			if (ActionManager.actions.has(key)) {
				console.warn(`Action '${key}' has already been registered. (class: ${handler.constructor.name})`);
				return;
			}

			ActionManager.actions.set(key, clb as (() => void));
		});
	}

	static init() {
		document.querySelectorAll<HTMLElement>("[data-action]").forEach((el) => {
			el.addEventListener("mousedown", (e) => {
				e.preventDefault();
				e.stopPropagation();

				const action = el.dataset.action?.trim();

				if (!action) {
					console.warn("Trying to trigger an empty action", el);
					return;
				}

				ActionManager.act(action);
			});
		});
	}

	static act(key: string) {
		const action = ActionManager.actions.get(key);

		if (!action) {
			console.warn(`Action '${key}' not found`);
			return;
		}

		action();
	}
}