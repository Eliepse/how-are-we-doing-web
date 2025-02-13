import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { NodeRenderer } from "../../SVGRenderer/NodeRenderer/NodeRenderer";
import { Color } from "../../Engine2D/ValueObject/Color";
import { FillAndStroke } from "../../SVGRenderer/FillAndStroke";
import { SymbolPainter } from "../../SVGRenderer/Painter/SymbolPainter";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { colors } from "../colors";
import type { Diagram } from "../Diagram";
import { Facility } from "../Items/Facility/Facility";
import type { Engine } from "../../Engine2D/Engine";

const shapeStyle = {
	default: new FillAndStroke({ fill: Color.White }),
	selected: new FillAndStroke({ fill: Color.Red }),
	dimmed: new FillAndStroke({ fill: colors.dimmedWhite }),
} as const;

export class FacilityRenderer extends NodeRenderer<SVGRenderer> {
	constructor(renderer: SVGRenderer, engine: Engine, private diagram: Diagram) {
		super(renderer, engine);
	}

	override render(engineNode: VirtualNode): void {
		const node = engineNode.node as unknown as Facility;
		const isActive = node.isActive();
		const symbol = node.getShape();
		const selectedNode = this.diagram.getSelectedNode();
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const isHovering = this.engine.isHovering(node);

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

	override accepts(engineNode: VirtualNode): boolean {
		return engineNode.node instanceof Facility;
	}
}
