import { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../ValueObject/SVGStyle";
import { CirclePainter } from "../Painter/CirclePainter";
import { Stroke } from "../ValueObject/Stroke";
import { SVGNodeRenderer } from "./SVGNodeRenderer";

const style = new SVGStyle({ fill: Color.White, stroke: new Stroke(1, Color.Red) });

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
