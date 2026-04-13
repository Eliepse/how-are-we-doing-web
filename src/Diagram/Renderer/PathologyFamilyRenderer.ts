import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { PathologyFamily } from "../Items/Pathology/PathologyFamily";
import { PathologyBlob } from "../Shape/PathologyBlob";

const min = 64;
const max = 148;

function blobSize(percent: number): number {
	return min + ((max - min) * percent);
}

export class PathologyFamilyRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<PathologyFamily>): void {
		const shapes = this.getShapes(vnode);
		const size = vnode.node.getChildren().length;
		const position = vnode.node.getGlobalPosition();
		const opacity = vnode.node.getGlobalOpacity();

		const blob = shapes.get("blob", () => new PathologyBlob(blobSize(size / 25)));

		if (position.hasChanged()) {
			// TODO: add time
			blob.updateMesh(0, position.get());
		}

		if (opacity.hasChanged()) {
			blob.updateOpacity(opacity.get());
		}
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof PathologyFamily;
	}
}