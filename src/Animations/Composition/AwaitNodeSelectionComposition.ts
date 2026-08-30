import { YieldComposition } from "../../Engine2D/Animate/Composition/YieldComposition";
import type { SelectableNode } from "../../Diagram/Diagram";
import { App } from "../../App";
import { NodeSelectionEvent } from "../../Events/NodeSelectionEvent";

export class AwaitNodeSelectionComposition extends YieldComposition {
	constructor(validator: (node: SelectableNode | undefined) => boolean) {
		super(() => new Promise<void>((next) => {
			const gate = (e: Event) => {
				if (e instanceof NodeSelectionEvent && validator(e.selection)) {
					App.instance().removeEventListener("selection:changed", gate);
					next();
				}
			};

			App.instance().addEventListener("selection:changed", gate);
		}));
	}
}