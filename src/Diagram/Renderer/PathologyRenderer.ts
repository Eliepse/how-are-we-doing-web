import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Core/NodeRenderer";
import { Color } from "../../Engine2D/Renderer/Color";
import { FillAndStroke } from "../../Engine2D/Renderer/SVG/FillAndStroke";
import { CirclePainter } from "../../Engine2D/Renderer/SVG/Painter/CirclePainter";
import { Stroke } from "../../Engine2D/Renderer/SVG/Painter/Stroke";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Pathology } from "../Items/Pathology/Pathology";

const defaultStyle = new FillAndStroke(undefined, new Stroke(3, "#ffffffaa"));
const hoveredStyle = new FillAndStroke(undefined, new Stroke(3, Color.White.toHex()));
const activeStyle = new FillAndStroke(undefined, new Stroke(3, Color.Red.toHex()));

export class PathologyRenderer extends NodeRenderer<SVGRenderer> {
	private radius = 7;

	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Pathology;

		const circle = this._renderer.getDOM(
			engineNode,
			"circle",
			() => CirclePainter.make(),
			true,
		);

		let style = node.isHovered() ? hoveredStyle : defaultStyle;
		style = node.active ? activeStyle : style;

		CirclePainter.update(circle, node.getGlobalPosition(), this.radius, style);
	}

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Pathology;
	}
}
