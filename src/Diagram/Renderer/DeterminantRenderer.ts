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
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { ClipPath } from "../../Engine2D/ValueObject/Clip";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";
import type { ActiveStatus } from "../types";

const anchorOpacity = new Opacity(.67);
export const determinantAnchorOffset = new Vector(-128, 0);
const stepClipsOptimized: { [k in Steps]: ClipPath } = {
	1: ClipPath.rect("0", "100%", "25%", "0"),
	2: ClipPath.rect("0", "100%", "50%", "0"),
	3: ClipPath.rect("0", "100%", "75%", "0"),
	4: ClipPath.rect("0", "100%", "100%", "0"),
};

export class DeterminantRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<Determinant>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const circle = shapes.get("anchor", () => new Circle(3));
		const element = shapes.get("virtualShape", () => new SVGSymbol(node.getShape()));
		const circleCore = shapes.get("anchor:core", () => {
			const shape = new Circle(3);
			shape.updateStyle(new SVGStyle({ fill: colors.primary }));
			shape.hide();
			return shape;
		});

		const status = node.status;
		const step = node.getStep();
		const opacity = node.getGlobalOpacity();
		const nodePosition = node.getGlobalPosition();
		const nodeRotation = node.getGlobalRotation();

		if (nodePosition.hasChanged() || nodeRotation.hasChanged()) {
			element.updateMesh(nodePosition.get(), nodeRotation.get());

			// Create a temporary node to compute the position
			const anchor = new Node2D();
			anchor.setParent(node);
			anchor.setPosition(determinantAnchorOffset);
			const anchorPosition = anchor.getGlobalPosition();

			circle.updateMesh(anchorPosition.get());
			circleCore.updateMesh(anchorPosition.get());
		}

		if (node.isApplicable().hasChanged()) {
			element.blur(node.isApplicable().get() ? 0 : 4);
		}

		// Pattern and anchor rim
		if (status.hasChanged() || step.hasChanged() || opacity.hasChanged()) {
			const color = this.getStatusColor(status.get());
			element.updateStyle(new SVGStyle({ fill: color, opacity: opacity.get() }), stepClipsOptimized[step.get()]);
			circle.updateStyle(new SVGStyle({ stroke: new Stroke({ width: 2, color: color.alpha(anchorOpacity) }) }));
			circleCore.updateStyle(new SVGStyle({ fill: color }));

			if ("selected" === status.get() || "preview" === status.get() || "n+1" === status.get()) {
				circleCore.show();
			} else {
				circleCore.hide();
			}
		}
	}

	private getStatusColor(status: ActiveStatus | false): Color {
		if ("selected" === status) {
			return Color.Red;
		}

		if ("preview" === status) {
			return Color.White;
		}

		if ("n+1" === status) {
			return colors.secondary;
		}

		return Color.White;
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Determinant;
	}
}
