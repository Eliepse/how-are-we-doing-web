import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { Diagram } from "../Diagram";
import { DiagramBlob } from "../Shape/DiagramBlob";

export class DiagramBackgroundRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<Diagram>): void {
		const shapes = this.getShapes(vnode);
		const blob = shapes.get("background", () => new DiagramBlob(260));

		blob.updateMesh(vnode.node.getGlobalPosition(), vnode.node.backgroundBlobClock);
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Diagram;
	}

}