import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Circle } from "../../SVGRenderer/Shape/Circle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Pathology } from "../Items/Pathology/Pathology";
import type { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";

const defaultStyle = new SVGStyle({ stroke: new Stroke(3, colors.defaultWhite) });
const hoveredStyle = new SVGStyle({ stroke: new Stroke(3, colors.defaultWhite) });
const activeStyle = new SVGStyle({ stroke: new Stroke(3, colors.selected) });
const dimmedStyle = new SVGStyle({ stroke: new Stroke(3, colors.dimmedWhite) });
const coreStyle = new SVGStyle({ fill: colors.selected });

export class PathologyRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, engine: Engine, private diagram: Diagram) {
		super(renderer, engine);
	}

	override render(vnode: VirtualNode<Pathology>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const isActive = node.isActive();
		const selectedNode = this.diagram.getSelectedNode();
		const position = node.getGlobalPosition();
		const isHovered = this.engine.isHovering(node);

		const edge = shapes.get("edge", () => new Circle(8));
		const core = shapes.get("core", () => new Circle(5));

		edge.updateMesh(position);
		core.updateMesh(position);

		if (isActive) {
			edge.updateStyle(activeStyle);
		} else if (isHovered) {
			edge.updateStyle(hoveredStyle);
		} else if (undefined !== selectedNode && node !== selectedNode) {
			edge.updateStyle(dimmedStyle);
		} else {
			edge.updateStyle(defaultStyle);
		}

		if (isActive) {
			core.updateStyle(coreStyle);
			core.show();
		} else {
			core.hide();
		}
	}

	override accepts(engineNode: VirtualNode): boolean {
		return engineNode.node instanceof Pathology;
	}
}
