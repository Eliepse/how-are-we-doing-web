import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Circle } from "../../SVGRenderer/Shape/Circle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { SVGSymbol } from "../../SVGRenderer/Shape/SVGSymbol";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { colors } from "../colors";
import { Determinant, type Steps } from "../Items/Determinant/Determinant";
import type { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { ClipPath } from "../../Engine2D/ValueObject/Clip";
import type { App } from "../../App";

const shapeStyle = {
	default: new SVGStyle({ fill: colors.defaultWhite }),
	selected: new SVGStyle({ fill: colors.selected }),
	dimmed: new SVGStyle({ fill: colors.dimmedWhite }),
	secondary: new SVGStyle({ fill: colors.secondary }),
} as const;

const anchorStyle = {
	default: new SVGStyle({ stroke: new Stroke(2, Color.White.alpha(0.67)) }),
	selected: new SVGStyle({ stroke: new Stroke(2, colors.selected) }),
	dimmed: new SVGStyle({ stroke: new Stroke(2, colors.dimmedWhite) }),
} as const;

const anchorCoreStyle = new SVGStyle({ fill: colors.selected });

export const determinantAnchorOffset = new Vector(-128, 0);

const stepClipsOptimized: { [k in Steps]: ClipPath } = {
	1: ClipPath.rect("0", "100%", "25%", "0"),
	2: ClipPath.rect("0", "100%", "50%", "0"),
	3: ClipPath.rect("0", "100%", "75%", "0"),
	4: ClipPath.rect("0", "100%", "100%", "0"),
};

export class DeterminantRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, engine: Engine, private app: App) {
		super(renderer, engine);
	}

	override render(vnode: VirtualNode<Determinant>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);

		const nodePosition = node.getGlobalPosition();
		const nodeRotation = node.getGlobalRotation();

		// Create a temporary node to compute the position
		const anchor = new Node2D();
		anchor.setParent(node);
		anchor.setPosition(determinantAnchorOffset);
		const anchorPosition = anchor.getGlobalPosition();

		const circle = shapes.get("anchor", () => new Circle(5));
		const circleCore = shapes.get("anchor:core", () => new Circle(3));
		const element = shapes.get("virtualShape", () => new SVGSymbol(node.getShape()));

		if(nodePosition.hasChanged() || nodeRotation.hasChanged()) {
			element.updateMesh(nodePosition.get(), nodeRotation.get());
		}

		if(anchorPosition.hasChanged()) {
			circle.updateMesh(anchorPosition.get());
		}

		circleCore.hide();

		if(node.isApplicable().hasChanged()) {
			element.blur(node.isApplicable().get() ? 4 : 0);
		}

		const active = node.active;
		const step = node.getStep();

		if ("selected" === active.get()) {
			element.updateStyle(shapeStyle.selected, stepClipsOptimized[step.get()]);
			circle.updateStyle(anchorStyle.selected);
			circleCore.updateStyle(anchorCoreStyle);
			circleCore.show();
		} else if ("preview" === active.get()) {
			element.updateStyle(shapeStyle.secondary, stepClipsOptimized[step.get()]);
			circle.updateStyle(anchorStyle.dimmed);
		} else if ("dimmed" === active.get()) {
			element.updateStyle(shapeStyle.dimmed, stepClipsOptimized[step.get()]);
			circle.updateStyle(anchorStyle.dimmed);
		} else {
			element.updateStyle(shapeStyle.default, stepClipsOptimized[step.get()]);
			circle.updateStyle(anchorStyle.default);
		}
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Determinant;
	}
}
