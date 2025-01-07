import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Core/NodeRenderer";
import { CirclePainter } from "../../Engine2D/Renderer/SVG/Painter/CirclePainter";
import { Stroke } from "../../Engine2D/Renderer/SVG/Painter/Stroke";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Pathology } from "../Items/Pathology/Pathology";

const defaultStroke = new Stroke(3, "#ffffffaa");
const hoveredStroke = new Stroke(3, "#ffffffff");

export class PathologyRenderer extends NodeRenderer<SVGRenderer> {
	private radius = 7;

	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Pathology;

		const circle = this._renderer.getDOM(
			engineNode,
			"circle",
			() => CirclePainter.make(),
			true
		);
		const stroke = node.isHovered() ? hoveredStroke : defaultStroke;
		CirclePainter.update(circle, node.getGlobalPosition(), this.radius, stroke, "none");
	}

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Pathology;
	}
}
