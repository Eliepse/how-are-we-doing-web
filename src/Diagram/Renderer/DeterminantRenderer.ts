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

const anchorCoreStyle = new FillAndStroke(Color.Red);

export const determinantAnchorOffset = new Vector(-128, 0);

export class DeterminantRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Determinant;
		const symbol = node.getShape();
		const isActive = node.isActive();

		const circle = this._renderer.getDOM(
			engineNode,
			"anchor:circle",
			() => CirclePainter.make(),
			true,
		);

		const circleCore = this._renderer.getDOM(
			engineNode,
			"anchor:circle:core",
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
			isActive ? shapeStyle.selected : shapeStyle.default,
		);

		// Create a temporary node to compute the position
		const anchorPosition = new Node2D();
		anchorPosition.setParent(node);
		anchorPosition.setPosition(determinantAnchorOffset);

		CirclePainter.update(
			circle,
			anchorPosition.getGlobalPosition(),
			5,
			isActive ? anchorStyle.selected : anchorStyle.default,
		);

		if (isActive) {
			circleCore.style.display = "";
			CirclePainter.update(circleCore, anchorPosition.getGlobalPosition(), 3, anchorCoreStyle);
		} else {
			circleCore.style.display = "none";
		}
	}
	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Determinant;
	}
}
