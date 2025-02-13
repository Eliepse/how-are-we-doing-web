import { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Color } from "../../Engine2D/ValueObject/Color";
import { FillAndStroke } from "../FillAndStroke";
import { CirclePainter } from "../Painter/CirclePainter";
import { Stroke } from "../Painter/Stroke";
import { SVGNodeRenderer } from "./SVGNodeRenderer";

const style = new FillAndStroke({ fill: Color.White, stroke: new Stroke(1, Color.Red) });

export class FallbackRenderer extends SVGNodeRenderer {
	render(node: VirtualNode): void {
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

	accepts(node: VirtualNode): boolean {
		return true;
	}
}
