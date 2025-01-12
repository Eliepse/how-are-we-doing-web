import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Core/NodeRenderer";
import { Node2D } from "../../Engine2D/Node2D";
import { Angle } from "../../Engine2D/Parameters/Angle";
import { Color } from "../../Engine2D/Renderer/Color";
import { FillAndStroke } from "../../Engine2D/Renderer/SVG/FillAndStroke";
import { Stroke } from "../../Engine2D/Renderer/SVG/Painter/Stroke";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "../../Engine2D/Vector";
import { Diagram } from "../Diagram";
import type { Determinant } from "../Items/Determinant/Determinant";
import type { Pathology } from "../Items/Pathology/Pathology";
import { determinantAnchorOffset } from "./DeterminantRenderer";

const pathStyle = new FillAndStroke(
	undefined,
	new Stroke(3, new Color(255, 0, 0, 0.75).toHexAlpha()),
);

export class PathologyLinkRenderer extends NodeRenderer<SVGRenderer> {
	override render(engineNode: EngineNode): void {
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
		engineNode: EngineNode,
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

	override accepts(engineNode: EngineNode): boolean {
		return engineNode.node instanceof Diagram;
	}
}
