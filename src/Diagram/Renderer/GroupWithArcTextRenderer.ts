import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { ArcText } from "../../SVGRenderer/Shape/ArcText";
import { DeterminantSubFamily } from "../Items/Determinant/DeterminantSubFamily";
import { FacilityFamily } from "../Items/Facility/FacilityFamily";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { App } from "../../App";

export class GroupWithArcTextRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<FacilityFamily | DeterminantSubFamily>): void {
		const translator = App.instance().getTranslator();
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const opacity = node.getGlobalOpacity();
		const angleShift = node.getItemArc().div(2);

		const arcText = shapes.get(
			"arcText",
			() => {
				const arc = new ArcText(node.getName());
				const name = translator.dyn(`nodes.${node.getName()}`, (txt) => arc.updateText(txt));
				arc.updateText(name.toString());
				return arc;
			},
		);

		if (position.hasChanged() || rotation.hasChanged()) {
			const angle = rotation.get();
			const angleCenter = angle.add(node.getArc().div(2));
			const isInverted = angleCenter.sin > 0;

			arcText.invert(isInverted);
			const offset = node instanceof FacilityFamily ? 32 : 44;

			arcText.updateMesh(
				position.get(),
				node.getRadius() + offset + (isInverted ? 12 : 0),
				angle.sub(angleShift),
				angle.sub(angleShift).add(node.getArc()),
			);
		}

		if (opacity.hasChanged() || node.getDecorationOpacity().hasChanged()) {
			arcText.updateOpacity(opacity.get().mul(node.getDecorationOpacity().get()));
		}
	}

	override accepts(node: VirtualNode): boolean {
		return node.node instanceof FacilityFamily || node.node instanceof DeterminantSubFamily;
	}
}
