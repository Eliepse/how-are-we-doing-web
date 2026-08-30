import { Scene } from "../../Engine2D/Animate/Scene/Scene";
import { ActionComposition } from "../../Engine2D/Animate/Composition/ActionComposition";
import { App } from "../../App";
import { AwaitNodeSelectionComposition } from "../Composition/AwaitNodeSelectionComposition";
import type { SelectableNode } from "../../Diagram/Diagram";
import { IsolateNodeComposition } from "../Composition/IsolateNodeComposition";
import { Determinant } from "../../Diagram/Items/Determinant/Determinant";
import { Facility } from "../../Diagram/Items/Facility/Facility";
import { Pathology } from "../../Diagram/Items/Pathology/Pathology";

export class SelectNodeActionScene extends Scene {
	constructor(target: SelectableNode) {
		super([
			new IsolateNodeComposition(target, "in", 750),
			new ActionComposition(() => {
				App.feature("hover:determinant", false);
				App.feature("hover:facility", false);
				App.feature("hover:pathology", false);
				App.feature("select:determinant", target instanceof Determinant);
				App.feature("select:facility", target instanceof Facility);
				App.feature("select:pathology", target instanceof Pathology);
				App.instance().setReadonly(false);
			}),
			new AwaitNodeSelectionComposition((node) => node === target),
			// Clear any "hover" node
			new ActionComposition(() => App.instance().getDiagram().previewNode(undefined)),
			new IsolateNodeComposition(target, "out", 750),
			new ActionComposition(() => App.instance().setReadonly(true)),
		]);
	}
}