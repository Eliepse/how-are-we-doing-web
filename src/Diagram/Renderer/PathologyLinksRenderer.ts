import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { NodeRenderer } from "../../SVGRenderer/NodeRenderer/NodeRenderer";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Angle } from "../../Engine2D/ValueObject/Angle";
import { FillAndStroke } from "../../SVGRenderer/FillAndStroke";
import { Stroke } from "../../SVGRenderer/Painter/Stroke";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { colors } from "../colors";
import { Diagram } from "../Diagram";
import type { Determinant } from "../Items/Determinant/Determinant";
import type { Pathology } from "../Items/Pathology/Pathology";
import { determinantAnchorOffset } from "./DeterminantRenderer";

const pathStyle = new FillAndStroke({ stroke: new Stroke(3, colors.selected.alpha(0.75)) });

export class PathologyLinkRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: VirtualNode): void {
		const node = engineNode.node as Diagram;
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
					this._renderer.removeDOM(engineNode, this.makeDomRendererId(pathology, determinant));
					return;
				}

				const path = this.getPath(engineNode, pathology, determinant);

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
