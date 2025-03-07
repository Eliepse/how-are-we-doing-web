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
		const rotation = node.getGlobalRotation();
		const angleShift = node.getItemArc().div(2);

		const arcText = shapes.get(
			"arcText",
			() => new ArcText(this.translator.translate(node.getName(), "nodes")),
		);

		arcText.updateMesh(
			node.getGlobalPosition(),
			node.getRadius() + (node instanceof FacilityFamily ? 32 : 44),
			rotation.sub(angleShift),
			rotation.sub(angleShift).add(node.getArc()),
		);
	}

	override accepts(node: VirtualNode): boolean {
		return node.node instanceof FacilityFamily || node.node instanceof DeterminantSubFamily;
	}
}
