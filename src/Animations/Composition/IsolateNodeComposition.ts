import { type ClipTuple, TickableComposition } from "../../Engine2D/Animate/Composition/TickableComposition";
import { FadeNodeClip } from "../../Engine2D/Animate/Predefined/FadeNodeClip";
import { Engine } from "../../Engine2D/Engine";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";
import type { SelectableNode } from "../../Diagram/Diagram";
import { Pathology } from "../../Diagram/Items/Pathology/Pathology";
import { Node2D } from "../../Engine2D/Node/Node2D";
import { Facility } from "../../Diagram/Items/Facility/Facility";
import { Determinant } from "../../Diagram/Items/Determinant/Determinant";

const CONFIG = { min: new Opacity(0.1), max: Opacity.Opaque };

export class IsolateNodeComposition extends TickableComposition {
	constructor(node: SelectableNode, direction: "in" | "out", duration: number) {
		const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
		const determinants = Engine.nodeByUnameOrThrow("group:determinant");
		const facilities = Engine.nodeByUnameOrThrow("group:facility");
		let siblings: Node2D[] = [];
		let group: Node2D | undefined = undefined;
		const clips = [] as ClipTuple[];

		if (node instanceof Pathology) {
			group = pathologies;
			siblings = Node2D.filterDescendants(pathologies, (n) => n !== node && n instanceof Pathology);
		} else if (node instanceof Determinant) {
			group = determinants;
			siblings = Node2D.filterDescendants(determinants, (n) => n !== node && n instanceof Determinant);
		} else if (node instanceof Facility) {
			group = facilities;
			siblings = Node2D.filterDescendants(facilities, (n) => n !== node && n instanceof Facility);
		}

		if (undefined === group) {
			super();
			return;
		}

		clips.push(
			...siblings.map(
				(node) =>
					[
						0,
						new FadeNodeClip(node, direction === "in" ? "out" : "in", duration, CONFIG),
					] satisfies ClipTuple,
			),
		);

		if("in" === direction) {
			clips.push([0, new FadeNodeClip(group, direction, duration, CONFIG)]);
		}

		super([...clips, [0, new FadeNodeClip(node, "in", duration, CONFIG)]]);
	}
}
