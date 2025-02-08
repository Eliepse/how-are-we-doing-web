import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Renderer/NodeRenderer";
import { LinePainter } from "../../Engine2D/Renderer/SVG/Painter/LinePainter";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "../../Engine2D/Vector";
import { DeterminantSubFamily } from "../Items/Determinant/DeterminantSubFamily";

export class DeterminantSubFamilyRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as DeterminantSubFamily;
		const separator = this._renderer.getDOM(
			engineNode,
			"separator",
			() => LinePainter.make(),
			true
		);

		const position = node.getGlobalPosition();
		const angleShift = node.getItemArc().div(2);
		const endAngle = node.getGlobalRotation().add(node.getArc()).sub(angleShift);
		const start = position.add(Vector.Right.mul(node.getRadius() - 136).rot(endAngle));
		const end = position.add(Vector.Right.mul(node.getRadius() + 48).rot(endAngle));

		LinePainter.update(separator, start, end, "#fff");
	}

	override accepts(node: EngineNode): boolean {
		return node.node instanceof DeterminantSubFamily;
	}
}
