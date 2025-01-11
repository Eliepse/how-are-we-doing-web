import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Core/NodeRenderer";
import { Color } from "../../Engine2D/Renderer/Color";
import { FillAndStroke } from "../../Engine2D/Renderer/SVG/FillAndStroke";
import { SymbolPainter } from "../../Engine2D/Renderer/SVG/Painter/SymbolPainter";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Facility } from "../Items/Facility/Facility";

const shapeStyle = {
	default: new FillAndStroke(Color.White),
	selected: new FillAndStroke(Color.Red),
} as const;

export class FacilityRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Facility;
		const symbol = node.getShape();

		const element = this._renderer.getDOM(
			engineNode,
			"virtualShape",
			() => SymbolPainter.make(symbol),
			true,
		);

		SymbolPainter.update(
			element,
			symbol,
			node.getGlobalPosition(),
			node.getGlobalRotation(),
			node.isActive() ? shapeStyle.selected : shapeStyle.default,
		);
	}

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Facility;
	}
}
