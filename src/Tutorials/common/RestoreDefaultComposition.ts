import { ActionComposition } from "../../../Engine2D/Animate/Composition/ActionComposition";
import type { Node2D } from "../../../Engine2D/Node/Node2D";
import { App } from "../../../App";

export class RestoreDefaultComposition extends ActionComposition {
	constructor() {
		super(() => {
			App.instance().setReadonly(false);

			document.querySelectorAll<HTMLElement>("#navigation [data-key='actions-side'] [data-action]")
				.forEach((el) => {
					el.style.display = "demo:close" !== el.dataset.action ? "none" : "";
				});
		});
	}
}