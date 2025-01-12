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
	dimmed: new FillAndStroke(Color.White, undefined, 0.47),
} as const;

const anchorStyle = {
	default: new FillAndStroke(undefined, new Stroke(2, "#ffffffaa")),
	selected: new FillAndStroke(undefined, new Stroke(2, Color.Red.toHex())),
	dimmed: new FillAndStroke(undefined, new Stroke(2, "#ffffff77")),
} as const;

const anchorCoreStyle = new FillAndStroke(Color.Red);

export const determinantAnchorOffset = new Vector(-128, 0);

export class DeterminantRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Determinant;
		const symbol = node.getShape();
		const isActive = node.isActive();
		const selectedNode = node.getDiagram()?.getSelectedNode();
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		// Create a temporary node to compute the position
		const anchor = new Node2D();
		anchor.setParent(node);
		anchor.setPosition(determinantAnchorOffset);
		const anchorPosition = anchor.getGlobalPosition();

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

		if (isActive) {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.selected);
			CirclePainter.update(circle, anchorPosition, 5, anchorStyle.selected);
			circleCore.style.display = "";
			CirclePainter.update(circleCore, anchorPosition, 3, anchorCoreStyle);
		} else if (undefined !== selectedNode && node !== selectedNode) {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.dimmed);
			CirclePainter.update(circle, anchorPosition, 5, anchorStyle.dimmed);
			circleCore.style.display = "none";
		} else {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.default);
			CirclePainter.update(circle, anchorPosition, 5, anchorStyle.default);
			circleCore.style.display = "none";
		}
	}
	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Determinant;
	}
}
