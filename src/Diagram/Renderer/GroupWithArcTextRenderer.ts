import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { ArcText } from "../../SVGRenderer/Shape/ArcText";
import { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { DeterminantSubFamily } from "../Items/Determinant/DeterminantSubFamily";
import { FacilityFamily } from "../Items/Facility/FacilityFamily";
import type { Translator } from "../Translation/Translator";
import type { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";

export class GroupWithArcTextRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, engine: Engine, private translator: Translator) {
		super(renderer, engine);
	}

	override render(vnode: VirtualNode<FacilityFamily | DeterminantSubFamily>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const angleShift = node.getItemArc().div(2);

		const arcText = shapes.get(
			"arcText",
			() => {
				const arc = new ArcText(node.getName());
				const name = this.translator.dyn(`nodes.${node.getName()}`, (txt) => arc.updateText(txt));
				arc.updateText(name.toString());
				return arc;
			},
		);

		if (position.hasChanged() || rotation.hasChanged()) {
			arcText.updateMesh(
				position.get(),
				node.getRadius() + (node instanceof FacilityFamily ? 32 : 44),
				rotation.get().sub(angleShift),
				rotation.get().sub(angleShift).add(node.getArc()),
			);
		}
	}

	override accepts(node: VirtualNode): boolean {
		return node.node instanceof FacilityFamily || node.node instanceof DeterminantSubFamily;
	}
}
