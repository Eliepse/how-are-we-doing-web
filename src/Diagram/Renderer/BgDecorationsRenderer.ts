import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { BgDecoration } from "../Decoration/BgDecoration";
import { SVGImage } from "../Shape/SVGImage";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";

export class BgDecorationsRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer) {
		super(renderer);
	}

	override render(vnode: VirtualNode<BgDecoration>): void {
		const shapes = this.getShapes(vnode);
		const node = vnode.node;
		const sprite = shapes.get("sprite", () => new SVGImage(node.symbol, -1));
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const opacity = node.getGlobalOpacity();

		if (position.hasChanged() || rotation.hasChanged()) {
			sprite.updateMesh(position.get(), node.scale, rotation.get());
		}

		if(opacity.hasChanged()) {
			sprite.updateStyle(new SVGStyle({ opacity: opacity.get().ratio }));
		}
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof BgDecoration;
	}
}