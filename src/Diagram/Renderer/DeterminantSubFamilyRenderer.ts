import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Line } from "../../SVGRenderer/Painter/Line";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { DeterminantSubFamily } from "../Items/Determinant/DeterminantSubFamily";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { FillAndStroke } from "../../SVGRenderer/FillAndStroke";
import { Stroke } from "../../SVGRenderer/Painter/Stroke";
import { colors } from "../colors";

export class DeterminantSubFamilyRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<DeterminantSubFamily>): void {
		const node = vnode.node;
		const separator = this.getShapes(vnode).get("separator", () => new Line());

		const position = node.getGlobalPosition();
		const angleShift = node.getItemArc().div(2);
		const endAngle = node.getGlobalRotation().add(node.getArc()).sub(angleShift);
		const start = position.add(Vector.Right.mul(node.getRadius() - 136).rot(endAngle));
		const end = position.add(Vector.Right.mul(node.getRadius() + 48).rot(endAngle));

		separator.updateMesh(start, end);
		separator.updateStyle(new FillAndStroke({ stroke: new Stroke(1, colors.defaultWhite) }));
	}

	override accepts(node: VirtualNode): boolean {
		return node.node instanceof DeterminantSubFamily;
	}
}
