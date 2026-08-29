import { Scene } from "../../Engine2D/Animate/Scene/Scene";
import { ActionComposition } from "../../Engine2D/Animate/Composition/ActionComposition";
import { App } from "../../App";
import { AwaitNodeSelectionComposition } from "../Composition/AwaitNodeSelectionComposition";
import type { SelectableNode } from "../../Diagram/Diagram";

export class SelectNodeActionScene extends Scene {
	constructor(validator: (node: SelectableNode | undefined) => boolean) {
		super([
			new ActionComposition(() => App.instance().setReadonly(false)),
			new AwaitNodeSelectionComposition(validator),
			new ActionComposition(() => {
				App.instance().getDiagram().previewNode(undefined);
				App.instance().setReadonly(true);
			}),
		]);
	}
}