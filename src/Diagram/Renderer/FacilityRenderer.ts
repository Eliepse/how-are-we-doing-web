import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Renderer/NodeRenderer";
import { Color } from "../../Engine2D/Renderer/Color";
import { FillAndStroke } from "../../Engine2D/Renderer/SVG/FillAndStroke";
import { SymbolPainter } from "../../Engine2D/Renderer/SVG/Painter/SymbolPainter";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Facility } from "../Items/Facility/Facility";

const shapeStyle = {
	default: new FillAndStroke(Color.White),
	selected: new FillAndStroke(Color.Red),
	dimmed: new FillAndStroke(colors.dimmedWhite),
} as const;

export class FacilityRenderer extends NodeRenderer<SVGRenderer> {
	constructor(renderer: SVGRenderer, private diagram: Diagram) {
		super(renderer);
	}

	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as Facility;
		const isActive = node.isActive();
		const symbol = node.getShape();
		const selectedNode = this.diagram.getSelectedNode();
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const isHovering = this._renderer.getEngine().isHovering(node);

		const element = this._renderer.getDOM(
			engineNode,
			"virtualShape",
			() => SymbolPainter.make(symbol),
			true,
		);

		if (isActive) {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.selected);
		} else if (undefined !== selectedNode && node !== selectedNode && false === isHovering) {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.dimmed);
		} else {
			SymbolPainter.update(element, symbol, position, rotation, shapeStyle.default);
		}
	}

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Facility;
	}
}
