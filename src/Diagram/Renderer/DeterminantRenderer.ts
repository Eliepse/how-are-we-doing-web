import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { NodeRenderer } from "../../SVGRenderer/NodeRenderer/NodeRenderer";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { CirclePainter } from "../../SVGRenderer/Painter/CirclePainter";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { SymbolPainter } from "../../SVGRenderer/Painter/SymbolPainter";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Determinant } from "../Items/Determinant/Determinant";
import type { Engine } from "../../Engine2D/Engine";

const shapeStyle = {
	default: new SVGStyle({ fill: colors.defaultWhite }),
	selected: new SVGStyle({ fill: colors.selected }),
	dimmed: new SVGStyle({ fill: colors.dimmedWhite }),
} as const;

const anchorStyle = {
	default: new SVGStyle({ stroke: new Stroke(2, Color.White.alpha(0.67)) }),
	selected: new SVGStyle({ stroke: new Stroke(2, colors.selected) }),
	dimmed: new SVGStyle({ stroke: new Stroke(2, colors.dimmedWhite) }),
} as const;

const anchorCoreStyle = new SVGStyle({ fill: colors.selected });

export const determinantAnchorOffset = new Vector(-128, 0);

export class DeterminantRenderer extends NodeRenderer<SVGRenderer> {
	constructor(renderer: SVGRenderer, engine: Engine, private diagram: Diagram) {
		super(renderer, engine);
	}

	override render(engineNode: VirtualNode): void {
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
		const isHovering = this.engine.isHovering(node);

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

	override accepts(engineNode: VirtualNode): boolean {
		return engineNode.node instanceof Determinant;
	}
}
