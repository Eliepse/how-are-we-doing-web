import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { PathologyFamily } from "../Items/Pathology/PathologyFamily";
import { PathologyBlob } from "../Shape/PathologyBlob";

const min = 100;
const max = 170;

function blobSize(percent: number): number {
	return min + ((max - min) * percent);
}

export class PathologyFamilyRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<PathologyFamily>): void {
		const shapes = this.getShapes(vnode);
		const size = vnode.node.getChildren().length;

		const blob = shapes.get("blob", () => new PathologyBlob(blobSize(size / 25)));

		blob.updateMesh(0, vnode.node.getGlobalPosition());
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof PathologyFamily;
	}
}