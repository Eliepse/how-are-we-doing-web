import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Circle } from "../../SVGRenderer/Shape/Circle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { colors } from "../colors";
import { Pathology } from "../Items/Pathology/Pathology";
import { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import type { App } from "../../App";
import { Color } from "../../Engine2D/ValueObject/Color";
import type { ActiveStatus } from "../types";

export class PathologyRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, private app: App) {
		super(renderer);
	}

	override render(vnode: VirtualNode<Pathology>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const selectedNode = this.app.getDiagram().getSelectedNode();
		const position = node.getGlobalPosition();
		const opacity = node.getGlobalOpacity();
		const status = node.status;
		const isHovered = Engine.isHovering(node);
		const isActive = "selected" === node.status.get() || "preview" === node.status.get();

		const edge = shapes.get("edge", () => new Circle(8));
		const core = shapes.get("core", () => {
			const shape = new Circle(5);
			shape.updateStyle(new SVGStyle({ fill: colors.selected }));
			shape.hide();
			return shape;
		});


		if (position.hasChanged() || status.hasChanged()) {
			core.updateMesh(position.get());
			edge.updateMesh(position.get(), isActive ? Pathology.maxRadius : node.getRadius());
		}

		if (status.hasChanged() || opacity.hasChanged()) {
			const color = this.getStatusColor(status.get()).alpha(opacity.get());
			edge.updateStyle(new SVGStyle({ stroke: new Stroke(3, color) }));

			if ("selected" === status.get()) {
				core.show();
			} else {
				core.hide();
			}
		}

		// if (isHovered) {
		// 	edge.updateStyle(hoveredStyle);
		// } else if (undefined !== selectedNode && node !== selectedNode) {
		// 	edge.updateStyle(dimmedStyle);
		// }
	}

	private getStatusColor(status: ActiveStatus | false): Color {
		if ("selected" === status) {
			return Color.Red;
		}

		if ("preview" === status) {
			return colors.secondary;
		}

		return new Color(158, 185, 200);
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Pathology;
	}
}
