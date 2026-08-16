import { App } from "../../App";
import { ActionComposition } from "../../Engine2D/Animate/Composition/ActionComposition";

export class PrepareDemoComposition extends ActionComposition {
	constructor() {
		super(() => {
			document.querySelectorAll<HTMLElement>("#navigation [data-key='actions-side'] [data-action]")
				.forEach((el) => {
					el.style.display = "demo:close" !== el.dataset.action ? "none" : "";
				});
		});
	}

}