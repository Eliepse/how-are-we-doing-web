import { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../ValueObject/SVGStyle";
import { Stroke } from "../ValueObject/Stroke";
import { SVGNodeRenderer } from "./SVGNodeRenderer";

const style = new SVGStyle({ fill: Color.White, stroke: new Stroke({ color: Color.Red }) });

export class FallbackRenderer extends SVGNodeRenderer {
	render(vnode: VirtualNode): void {
		if (false === this.renderer.debug) {
			return;
		}

		// const node = vnode.node;
		// const position = node.getGlobalPosition();
		// const shapes = this.getShapes(vnode);
		// const origin = shapes.get("debug:origin", () => {
		// 	const c = new Circle(2);
		// 	c.updateStyle(style);
		// 	return c;
		// });
		//
		// origin.updateMesh(position.get());
	}

	accepts(node: VirtualNode): boolean {
		return this.renderer.debug;
	}
}
