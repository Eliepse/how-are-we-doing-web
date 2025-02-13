import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Circle } from "../../SVGRenderer/Shape/Circle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { SymbolPainter } from "../../SVGRenderer/Painter/SymbolPainter";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Determinant } from "../Items/Determinant/Determinant";
import type { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";

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

export class DeterminantRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, engine: Engine, private diagram: Diagram) {
		super(renderer, engine);
	}

	override render(vnode: VirtualNode<Determinant>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
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

		const circle = shapes.get("anchor", () => new Circle(5));
		const circleCore = shapes.get("anchor:core", () => new Circle(3));

		const element = this._renderer.getDOM(
			vnode,
			"virtualShape",
			() => SymbolPainter.make(symbol),
			true,
		);

		circle.updateMesh(anchorPosition);
		circleCore.hide();

		if (isActive) {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.selected);
			circle.updateStyle(anchorStyle.selected);
			circleCore.updateMesh(anchorPosition);
			circleCore.updateStyle(anchorCoreStyle);
			circleCore.show();
		} else if (undefined !== selectedNode && node !== selectedNode && false === isHovering) {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.dimmed);
			circle.updateStyle(anchorStyle.dimmed);
		} else {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.default);
			circle.updateStyle(anchorStyle.default);
		}
	}

	override accepts(engineNode: VirtualNode): boolean {
		return engineNode.node instanceof Determinant;
	}
}
