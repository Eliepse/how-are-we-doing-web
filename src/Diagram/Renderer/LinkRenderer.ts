import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Angle } from "../../Engine2D/ValueObject/Angle";
import { determinantAnchorOffset } from "./DeterminantRenderer";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import { LinkPath, style } from "../Shape/LinkPath";
import { Link } from "../Items/Link/Link";
import { Determinant } from "../Items/Determinant/Determinant";
import { Pathology } from "../Items/Pathology/Pathology";
import { Dir } from "../AssociationManager";
import { SVGSymbol } from "../../SVGRenderer/Shape/SVGSymbol";
import { linkArrow } from "../Shape/LinkArrow";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { colors } from "../colors";
import { Color } from "../../Engine2D/ValueObject/Color";
import { App } from "../../App";

export class LinkRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode): void {
		const link = vnode.node as Link;
		const shapes = this.getShapes(vnode);
		const selected = App.instance().getDiagram().getSelectedNode();

		if (link.hidden) {
			shapes.remove(link.key);
			shapes.remove(`${link.key}-arrow`);
			return;
		}

		const center = this.renderer.size.div(2);
		const path = shapes.get(link.key, () => {
			const p = new LinkPath();
			p.updateStyle(this.getLinkStyle(link));
			return p;
		});

		if (link.status.hasChanged()) {
			path.updateStyle(this.getLinkStyle(link));
		}

		if (link.from instanceof Determinant && link.to instanceof Determinant) {
			const destination = link.getDestination();

			// Create a temporary node to compute the position
			const tempNode = new Node2D();
			tempNode.setPosition(determinantAnchorOffset);

			tempNode.setParent(link.getSource());
			const source = tempNode.getGlobalPosition().get();

			tempNode.setParent(destination);
			const dest = tempNode.getGlobalPosition().get();

			const factor = dest.sub(source).mag() * .54;
			const destToCenter = center.sub(dest).normalize();
			const sourceToCenter = center.sub(source).normalize();
			const offsetDest = dest.add(destToCenter.mul(32));

			path.updateMesh(
				source,
				source.add(sourceToCenter.mul(factor)), // Source anchor
				Dir.Bidirectional !== link.direction ? dest.add(destToCenter.mul(32)) : dest,
				offsetDest.add(destToCenter.mul(factor)), // Dest anchor
			);

			if (Dir.Bidirectional !== link.direction) {
				const arrow = shapes.get(`${link.key}-arrow`, () => new SVGSymbol(linkArrow, 60));
				arrow.updateMesh(dest.add(destToCenter.mul(20)), destination.getGlobalRotation().get().add(Angle.HALF_PI));
				const selectedColor = destination === selected ? colors.primary : colors.secondary;
				arrow.updateStyle(new SVGStyle({ fill: "selected" === link.status.get() ? selectedColor : Color.White }));
			}

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

	private getLinkStyle(link: Link) {
		if (link.from instanceof Determinant && link.to instanceof Determinant) {
			if(Dir.Bidirectional === link.direction) {
				return "selected" === link.status.get() ? style.selectedDeterminantModeBidir : style.previewDeterminantModeBidir;
			}

			return "selected" === link.status.get() ? style.selectedDeterminantMode : style.previewDeterminantMode;
		}

		if("n+1" === link.status.get()) {
			return style.secondary;
		}

		return "selected" === link.status.get() ? style.selected : style.preview;
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Link;
	}
}
