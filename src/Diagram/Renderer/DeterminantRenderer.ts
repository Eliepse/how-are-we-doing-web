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
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Determinant } from "../Items/Determinant/Determinant";

const shapeStyle = {
	default: new FillAndStroke(colors.defaultWhite),
	selected: new FillAndStroke(colors.selected),
	dimmed: new FillAndStroke(colors.dimmedWhite),
} as const;

const anchorStyle = {
	default: new FillAndStroke(undefined, new Stroke(2, Color.White.alpha(0.67))),
	selected: new FillAndStroke(undefined, new Stroke(2, colors.selected)),
	dimmed: new FillAndStroke(undefined, new Stroke(2, colors.dimmedWhite)),
} as const;

const anchorCoreStyle = new FillAndStroke(colors.selected);

export const determinantAnchorOffset = new Vector(-128, 0);

export class DeterminantRenderer extends NodeRenderer<SVGRenderer> {
	constructor(renderer: SVGRenderer, private diagram: Diagram) {
		super(renderer);
	}

	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Determinant;
		const symbol = node.getShape();
		const isActive = node.isActive();
		const selectedNode = this.diagram.getSelectedNode();
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		// Create a temporary node to compute the position
		const anchor = new Node2D();
		anchor.setParent(node);
		anchor.setPosition(determinantAnchorOffset);
		const anchorPosition = anchor.getGlobalPosition();
		const isHovering = this._renderer.getEngine().isHovering(node);

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
		} else if (undefined !== selectedNode && node !== selectedNode && false === isHovering) {
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
