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
const coreStyle = new FillAndStroke(Color.Red);

export class PathologyRenderer extends NodeRenderer<SVGRenderer> {
	private radius = 8;

	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Pathology;
		const isActive = node.isActive();

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

		const position = node.getGlobalPosition();
		let style = isActive ? activeStyle : node.isHovered() ? hoveredStyle : defaultStyle;

		CirclePainter.update(edge, position, this.radius, style);

		if (isActive) {
			core.style.display = "";
			CirclePainter.update(core, position, this.radius - 3, coreStyle);
		} else {
			core.style.display = "none";
		}
	}

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Pathology;
	}
}
