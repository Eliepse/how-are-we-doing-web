import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import type { Engine } from "../../Engine2D/Engine";
import { BgDecoration } from "../Decoration/BgDecoration";
import { SVGImage } from "../Shape/SVGImage";

export class BgDecorationsRenderer extends SVGNodeRenderer {
	private shapes = { pathology: [] };

	constructor(renderer: SVGRenderer) {
		super(renderer);
	}

	override render(vnode: VirtualNode<BgDecoration>): void {
		const shapes = this.getShapes(vnode);
		const node = vnode.node;
		const sprite = shapes.get("sprite", () => new SVGImage(node.symbol, -1));
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();

		if (position || rotation) {
			sprite.updateMesh(position.get(), node.scale, rotation.get());
		}
		// blob.updateStyle(new SVGStyle({ fill: genRef }));
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof BgDecoration;
	}
}