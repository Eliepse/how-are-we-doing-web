import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Angle } from "../../Engine2D/ValueObject/Angle";
import { Diagram } from "../Diagram";
import { determinantAnchorOffset } from "./DeterminantRenderer";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { LinkPath, style } from "../Shape/LinkPath";

export class PathologyLinkRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode): void {
		const node = vnode.node as Diagram;
		const determinants = node.getDeterminants();
		const shapes = this.getShapes(vnode);

		node.getPathologies().forEach((pathology) => {
			const pathologyActive = "selected" === pathology.active || "preview" === pathology.active;

			pathology.associations.determinants.forEach((detId) => {
				const determinant = determinants.get(detId);

				if (undefined === determinant) {
					return;
				}

				const determinantActive = "selected" === determinant.active || "preview" === determinant.active;
				const shapeKey = `link:pathology:${pathology.id}-${determinant.id}`;

				if (false === pathologyActive || false === determinantActive) {
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

				const fromAnchor = to.get().sub(center).mul(0.16).add(from.get());
				const toAnchor = center.sub(to.get()).rot(Angle.fromDeg(32)).mul(0.32).add(to.get());

				path.updateMesh(from.get(), fromAnchor, to.get(), toAnchor);
				path.updateStyle("selected" === determinant.active ? style.selected : style.preview);
			});
		});
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Diagram;
	}
}
