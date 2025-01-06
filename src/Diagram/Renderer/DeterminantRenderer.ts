import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Core/NodeRenderer";
import { Node2D } from "../../Engine2D/Node2D";
import { CirclePainter } from "../../Engine2D/Renderer/SVG/Painter/CirclePainter";
import { Stroke } from "../../Engine2D/Renderer/SVG/Painter/Stroke";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "../../Engine2D/Vector";
import { Determinant } from "../Items/Determinant/Determinant";

const defaultStroke = new Stroke(2, "#ffffffaa");

export class DeterminantRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Determinant;
		const circle = this._renderer.getDOM(
			engineNode,
			"anchor:circle",
			() => CirclePainter.make(),
			true
		);

		// Create a temporary node to compute the position
		const tempNode = new Node2D();
		tempNode.setParent(node);
		tempNode.setPosition(new Vector(-128, 0));

		CirclePainter.update(circle, tempNode.getGlobalPosition(), 4, defaultStroke, "none");
	}
	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Determinant;
	}
}
