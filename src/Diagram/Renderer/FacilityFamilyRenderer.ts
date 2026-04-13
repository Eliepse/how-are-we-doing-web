import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Line } from "../../SVGRenderer/Shape/Line";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { FacilityFamily } from "../Items/Facility/FacilityFamily";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { colors } from "../colors";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";

export class FacilityFamilyRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<FacilityFamily>): void {
		const node = vnode.node;
		const separator = this.getShapes(vnode).get("separator", () => new Line());

		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const opacity = node.getGlobalOpacity();

		if (position.hasChanged() || rotation.hasChanged()) {
			const angleShift = node.getItemArc().div(2);
			const endAngle = rotation.get().add(node.getArc()).sub(angleShift);
			const start = position.get().add(Vector.Right.mul(node.getRadius() - 12).rot(endAngle));
			const end = position.get().add(Vector.Right.mul(node.getRadius() + 48).rot(endAngle));
			separator.updateMesh(start, end);
		}

		if (opacity.hasChanged()) {
			separator.updateStyle(new SVGStyle({ stroke: new Stroke({ color: colors.defaultWhite.alpha(opacity.get()) }) }));
		}
	}

	override accepts(node: VirtualNode): boolean {
		return node.node instanceof FacilityFamily;
	}
}
