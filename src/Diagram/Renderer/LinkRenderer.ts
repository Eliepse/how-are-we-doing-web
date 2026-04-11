import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Angle } from "../../Engine2D/ValueObject/Angle";
import { determinantAnchorOffset } from "./DeterminantRenderer";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { LinkPath, style } from "../Shape/LinkPath";
import { Link } from "../Items/Link/Link";
import { Determinant } from "../Items/Determinant/Determinant";
import { Pathology } from "../Items/Pathology/Pathology";

export class LinkRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode): void {
		const link = vnode.node as Link;
		const shapes = this.getShapes(vnode);

		if (link.hidden) {
			shapes.remove(link.key);
			return;
		}

		const center = this.renderer.size.div(2);
		const path = shapes.get(link.key, () => {
			const p = new LinkPath();
			p.updateStyle("selected" === link.status.get() ? style.selected : style.preview);
			return p;
		});

		if (link.status.hasChanged()) {
			path.updateStyle("selected" === link.status.get() ? style.selected : style.preview);
		}

		if (link.from instanceof Determinant && link.to instanceof Determinant) {
			// Create a temporary node to compute the position
			const tempNode = new Node2D();
			tempNode.setPosition(determinantAnchorOffset);

			tempNode.setParent(link.from);
			const to = tempNode.getGlobalPosition().get();

			tempNode.setParent(link.to);
			const from = tempNode.getGlobalPosition().get();

			const factor = to.sub(from).mag() * .58;
			const fromAnchor = center.sub(from).normalize().mul(factor);
			const toAnchor = center.sub(to).normalize().mul(factor);

			path.updateMesh(from, from.add(fromAnchor), to, to.add(toAnchor));
			return;
		}

		if (link.from instanceof Determinant && link.to instanceof Pathology) {
			const from = link.to.getGlobalPosition();

			// Create a temporary node to compute the position
			const tempNode = new Node2D();
			tempNode.setParent(link.from);
			tempNode.setPosition(determinantAnchorOffset);
			const to = tempNode.getGlobalPosition();

			const fromAnchor = to.get().sub(center).mul(0.16).add(from.get());
			const toAnchor = center.sub(to.get()).rot(Angle.fromDeg(32)).mul(0.32).add(to.get());

			path.updateMesh(from.get(), fromAnchor, to.get(), toAnchor);
		}
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Link;
	}
}
