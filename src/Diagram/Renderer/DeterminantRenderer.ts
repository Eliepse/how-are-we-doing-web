import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Core/NodeRenderer";
import { Node2D } from "../../Engine2D/Node2D";
import { Color } from "../../Engine2D/Renderer/Color";
import { FillAndStroke } from "../../Engine2D/Renderer/SVG/FillAndStroke";
import { CirclePainter } from "../../Engine2D/Renderer/SVG/Painter/CirclePainter";
import { Stroke } from "../../Engine2D/Renderer/SVG/Painter/Stroke";
import { SymbolPainter } from "../../Engine2D/Renderer/SVG/Painter/SymbolPainter";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "../../Engine2D/Vector";
import { Determinant } from "../Items/Determinant/Determinant";

const shapeStyle = {
	default: new FillAndStroke(Color.White),
	selected: new FillAndStroke(Color.Red),
} as const;

const anchorStyle = {
	default: new FillAndStroke(undefined, new Stroke(2, "#ffffffaa")),
	selected: new FillAndStroke(undefined, new Stroke(2, Color.Red.toHex())),
} as const;

export class DeterminantRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Determinant;
		const symbol = node.getShape();

		const circle = this._renderer.getDOM(
			engineNode,
			"anchor:circle",
			() => CirclePainter.make(),
			true,
		);

		const element = this._renderer.getDOM(
			engineNode,
			"virtualShape",
			() => SymbolPainter.make(symbol),
			true,
		);

		SymbolPainter.update(
			element,
			symbol,
			node.getGlobalPosition(),
			node.getGlobalRotation(),
			node.isActive() ? shapeStyle.selected : shapeStyle.default,
		);

		// Create a temporary node to compute the position
		const tempNode = new Node2D();
		tempNode.setParent(node);
		tempNode.setPosition(new Vector(-128, 0));

		CirclePainter.update(
			circle,
			tempNode.getGlobalPosition(),
			4,
			node.isActive() ? anchorStyle.selected : anchorStyle.default,
		);
	}
	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Determinant;
	}
}
