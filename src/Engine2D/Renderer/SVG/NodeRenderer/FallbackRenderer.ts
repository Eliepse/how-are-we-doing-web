import { EngineNode } from "../../../Core/EngineNode";
import { NodeRenderer } from "../../../Core/NodeRenderer";
import { Color } from "../../Color";
import { FillAndStroke } from "../FillAndStroke";
import { CirclePainter } from "../Painter/CirclePainter";
import { Stroke } from "../Painter/Stroke";
import { SVGRenderer } from "../SVGRenderer";

const style = new FillAndStroke(Color.White, new Stroke(1, Color.Red.toHex()));

export class FallbackRenderer extends NodeRenderer<SVGRenderer> {
	render(node: EngineNode): void {
		if (false === this._renderer.isDebug()) {
			return;
		}

		const position = node.node.getGlobalPosition();
		const origin = this._renderer.getDOM(
			node,
			"debug:origin",
			(dom) => CirclePainter.make(),
			true,
		);
		CirclePainter.update(origin, position, 2, style);
	}

	accepts(node: EngineNode): boolean {
		return true;
	}
}
