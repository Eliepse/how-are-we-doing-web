import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Angle } from "../../Engine2D/ValueObject/Angle";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { Stroke } from "../../SVGRenderer/ValueObject/Stroke";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { colors } from "../colors";
import { Diagram } from "../Diagram";
import type { Determinant } from "../Items/Determinant/Determinant";
import type { Pathology } from "../Items/Pathology/Pathology";
import { determinantAnchorOffset } from "./DeterminantRenderer";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";

const pathStyle = new SVGStyle({ stroke: new Stroke(3, colors.selected.alpha(0.75)) });

export class PathologyLinkRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode): void {
		const node = vnode.node as Diagram;
		const determinants = node.getDeterminants();

		node.getPathologies().forEach((pathology) => {
			const pathologyActive = pathology.isActive();

			pathology.associations.determinants.forEach((detId) => {
				const determinant = determinants.get(detId);
				const linkeActive = pathologyActive && determinant?.isActive();

				if (undefined === determinant) {
					return;
				}

				if (false === linkeActive) {
					this._renderer.removeDOM(vnode, this.makeDomRendererId(pathology, determinant));
					return;
				}

				const path = this.getPath(vnode, pathology, determinant);

				// Create a temporary node to compute the position
				const tempNode = new Node2D();
				tempNode.setParent(determinant);
				tempNode.setPosition(determinantAnchorOffset);

				this.updatePath(path, pathology.getGlobalPosition(), tempNode.getGlobalPosition());
			});
		});
	}

	private makeDomRendererId(pathology: Pathology, determinant: Determinant): string {
		return `link:pathology:${pathology.id}-${determinant.id}`;
	}

	private getPath(
		engineNode: VirtualNode,
		pathology: Pathology,
		determinant: Determinant,
	): SVGPathElement {
		return this._renderer.getDOM(
			engineNode,
			this.makeDomRendererId(pathology, determinant),
			() => {
				const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				pathStyle.updateElement(path);
				return path;
			},
			true,
		);
	}

	private updatePath(path: SVGPathElement, from: Vector, to: Vector): void {
		const center = this._renderer.size.div(2);

		const curveFromAnchor = to.sub(center).mul(0.16).add(from);
		const curveToAnchor = center.sub(to).rot(Angle.fromDeg(32)).mul(0.32).add(to);

		path.setAttribute(
			"d",
			`M ${from.toString()} C ${curveFromAnchor.toString()} ${curveToAnchor.toString()} ${to.toString()}`,
		);
	}

	override accepts(engineNode: VirtualNode): boolean {
		return engineNode.node instanceof Diagram;
	}
}
