import type { EngineNode } from "../../../Core/EngineNode";
import { NodeRenderer } from "../../NodeRenderer";
import { VirtualShape } from "../../../Node/VirtualShape";
import { SymbolPainter } from "../Painter/SymbolPainter";
import type { SVGRenderer } from "../SVGRenderer";

export class VirtualShapeRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as VirtualShape;
		const symbol = node.getShape();

		const element = this._renderer.getDOM(
			engineNode,
			"virtualShape:use",
			() => SymbolPainter.make(symbol),
			true,
		);

		SymbolPainter.update(element, symbol, node.getGlobalPosition(), node.getGlobalRotation());
	}

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof VirtualShape;
	}
}
