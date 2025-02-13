import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { ArcTextPainter } from "../../SVGRenderer/Painter/ArcTextPainter";
import { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { DeterminantSubFamily } from "../Items/Determinant/DeterminantSubFamily";
import { FacilityFamily } from "../Items/Facility/FacilityFamily";
import type { Translator } from "../Translation/Translator";
import type { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";

export class GroupWithArcTextRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, engine: Engine, private translator: Translator) {
		super(renderer, engine);
	}

	override render(engineNode: VirtualNode<FacilityFamily | DeterminantSubFamily>): void {
		const node = engineNode.node;
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const angleShift = node.getItemArc().div(2);

		let arc: SVGPathElement;
		let textPath: SVGTextPathElement;
		let text: SVGTextElement;

		if (false === this._renderer.hasDOM(engineNode, "arcText:path")) {
			const freshElements = ArcTextPainter.make();
			arc = freshElements.path;
			textPath = freshElements.textPath;
			text = freshElements.text;
		}

		text = this._renderer.getDOM(engineNode, "arcText:text", () => text, true);
		textPath = this._renderer.getDOM(engineNode, "arcText:textPath", () => textPath);
		arc = this._renderer.getDOM(engineNode, "arcText:path", () => arc, true);

		ArcTextPainter.updateText(textPath, this.translator.translate(node.getName(), "nodes"));
		ArcTextPainter.updateArc(
			arc,
			position,
			node.getRadius() + 32,
			rotation.sub(angleShift),
			rotation.sub(angleShift).add(node.getArc()),
		);
	}

	override accepts(node: VirtualNode): boolean {
		return node.node instanceof FacilityFamily || node.node instanceof DeterminantSubFamily;
	}
}
