import type { EngineNode } from "../../Engine2D/Core/EngineNode";
import { NodeRenderer } from "../../Engine2D/Renderer/NodeRenderer";
import { ArcTextPainter } from "../../Engine2D/Renderer/SVG/Painter/ArcTextPainter";
import type { SVGRenderer } from "../../Engine2D/Renderer/SVG/SVGRenderer";
import { DeterminantSubFamily } from "../Items/Determinant/DeterminantSubFamily";
import { FacilityFamily } from "../Items/Facility/FacilityFamily";
import type { Translator } from "../Translation/Translator";

export class GroupWithArcTextRenderer extends NodeRenderer<SVGRenderer> {
	constructor(renderer: SVGRenderer, private translator: Translator) {
		super(renderer);
	}

	override render(engineNode: EngineNode): void {
		const node = engineNode.node as unknown as FacilityFamily | DeterminantSubFamily;
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

	override accepts(node: EngineNode): boolean {
		return node.node instanceof FacilityFamily || node.node instanceof DeterminantSubFamily;
	}
}
