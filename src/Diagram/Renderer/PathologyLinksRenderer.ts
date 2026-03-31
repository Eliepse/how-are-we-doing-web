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
		const selectedNode = node.getSelectedNode();

		determinants.forEach((determinant) => {
			determinant.associations.determinants.forEach((assoDetId) => {
				const shapeKey = `link:determinant:${determinant.id}-${assoDetId}`;
				const assoDet = determinants.get(assoDetId);

				if (undefined === assoDet) {
					return;
				}

				if ("determinants" !== node.links) {
					shapes.remove(shapeKey);
					return;
				}

				if (selectedNode !== determinant && selectedNode !== assoDet) {
					shapes.remove(shapeKey);
					return;
				}

				const path = shapes.get(shapeKey, () => new LinkPath());

				const center = this.renderer.size.div(2);

				// Create a temporary node to compute the position
				const tempNode = new Node2D();
				tempNode.setPosition(determinantAnchorOffset);

				tempNode.setParent(determinant);
				const to = tempNode.getGlobalPosition().get();

				tempNode.setParent(assoDet);
				const from = tempNode.getGlobalPosition().get();

				const fromAnchor = center.sub(from).rot(Angle.fromDeg(32)).mul(0.32).add(from);
				const toAnchor = center.sub(to).rot(Angle.fromDeg(32)).mul(0.32).add(to);

				path.updateMesh(from, fromAnchor, to, toAnchor);
			});
		});

		node.getPathologies().forEach((pathology) => {
			const pathologyActive = "selected" === pathology.status.get() || "preview" === pathology.status.get();

			pathology.associations.determinants.forEach((detId) => {
				const determinant = determinants.get(detId);
				const shapeKey = `link:pathology:${pathology.id}-${detId}`;

				if (undefined === determinant) {
					return;
				}

				if ("pathologies" !== node.links) {
					shapes.remove(shapeKey);
					return;
				}

				const determinantActive = "selected" === determinant.status.get() || "preview" === determinant.status.get();

				if (false === pathologyActive || false === determinantActive || "pathologies" !== node.links) {
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

				if (determinant.status.hasChanged()) {
					path.updateStyle("selected" === determinant.status.get() ? style.selected : style.preview);
				}
			});
		});
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Diagram;
	}
}
