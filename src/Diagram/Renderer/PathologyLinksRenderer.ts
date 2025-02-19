import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Angle } from "../../Engine2D/ValueObject/Angle";
import { Diagram } from "../Diagram";
import { determinantAnchorOffset } from "./DeterminantRenderer";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { LinkPath } from "../Shape/LinkPath";

export class PathologyLinkRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode): void {
		const node = vnode.node as Diagram;
		const determinants = node.getDeterminants();
		const shapes = this.getShapes(vnode);

		node.getPathologies().forEach((pathology) => {
			const pathologyActive = pathology.isActive();

			pathology.associations.determinants.forEach((detId) => {
				const determinant = determinants.get(detId);
				const linkActive = pathologyActive && determinant?.isActive();

				if (undefined === determinant) {
					return;
				}

				const shapeKey = `link:pathology:${pathology.id}-${determinant.id}`;

				if (false === linkActive) {
					shapes.remove(shapeKey);
					return;
				}

				const path = shapes.get(shapeKey, () => new LinkPath());

				const center = this.renderer.size.div(2);
				const from = pathology.getGlobalPosition();

				// Create a temporary node to compute the position
				const tempNode = new Node2D();
				tempNode.setParent(determinant);
				tempNode.setPosition(determinantAnchorOffset);
				const to = tempNode.getGlobalPosition();

				const fromAnchor = to.sub(center).mul(0.16).add(from);
				const toAnchor = center.sub(to).rot(Angle.fromDeg(32)).mul(0.32).add(to);

				path.updateMesh(from, fromAnchor, to, toAnchor);
			});
		});
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Diagram;
	}
}
