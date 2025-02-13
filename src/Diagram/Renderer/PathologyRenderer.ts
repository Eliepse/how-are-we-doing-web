import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { NodeRenderer } from "../../SVGRenderer/NodeRenderer/NodeRenderer";
import { FillAndStroke } from "../../SVGRenderer/FillAndStroke";
import { CirclePainter } from "../../SVGRenderer/Painter/CirclePainter";
import { Stroke } from "../../SVGRenderer/Painter/Stroke";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Pathology } from "../Items/Pathology/Pathology";
import type { Engine } from "../../Engine2D/Engine";

const defaultStyle = new FillAndStroke({ stroke: new Stroke(3, colors.defaultWhite) });
const hoveredStyle = new FillAndStroke({ stroke: new Stroke(3, colors.defaultWhite) });
const activeStyle = new FillAndStroke({ stroke: new Stroke(3, colors.selected) });
const dimmedStyle = new FillAndStroke({ stroke: new Stroke(3, colors.dimmedWhite) });
const coreStyle = new FillAndStroke({ fill: colors.selected });

export class PathologyRenderer extends NodeRenderer<SVGRenderer> {
	private radius = 8;

	constructor(renderer: SVGRenderer, engine: Engine, private diagram: Diagram) {
		super(renderer, engine);
	}

	override render(engineNode: VirtualNode<Pathology>): void {
		const node = engineNode.node;
		const isActive = node.isActive();
		const selectedNode = this.diagram.getSelectedNode();
		const position = node.getGlobalPosition();
		const isHovered = this.engine.isHovering(node);

		const edge = this._renderer.getDOM(
			engineNode,
			"circle:edge",
			() => CirclePainter.make(),
			true,
		);

		const core = this._renderer.getDOM(
			engineNode,
			"circle:core",
			() => CirclePainter.make(),
			true,
		);

		if (isActive) {
			CirclePainter.update(edge, position, this.radius, activeStyle);
		} else if (isHovered) {
			CirclePainter.update(edge, position, this.radius, hoveredStyle);
		} else if (undefined !== selectedNode && node !== selectedNode) {
			CirclePainter.update(edge, position, this.radius, dimmedStyle);
		} else {
			CirclePainter.update(edge, position, this.radius, defaultStyle);
		}

		if (isActive) {
			core.style.display = "";
			CirclePainter.update(core, position, this.radius - 3, coreStyle);
		} else {
			core.style.display = "none";
		}
	}

	override accepts(engineNode: VirtualNode): boolean {
		return engineNode.node instanceof Pathology;
	}
}
