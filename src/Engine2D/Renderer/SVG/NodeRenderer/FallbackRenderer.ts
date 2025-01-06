import { EngineNode } from "../../../Core/EngineNode";
import { NodeRenderer } from "../../../Core/NodeRenderer";
import { CirclePainter } from "../Painter/CirclePainter";
import { Stroke } from "../Painter/Stroke";
import { SVGRenderer } from "../SVGRenderer";

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
			true
		);
		CirclePainter.update(origin, position, 2, new Stroke(1, "#ff0000"), "#ffffff");
	}

	accepts(node: EngineNode): boolean {
		return true;
	}
}
