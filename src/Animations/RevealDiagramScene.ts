import { Engine } from "../Engine2D/Engine";
import type { Diagram } from "../Diagram/Diagram";
import { Opacity } from "../Engine2D/ValueObject/Opacity";
import { Interpolation } from "../Engine2D/Time/interpolations";
import type { Node2D } from "../Engine2D/Node/Node2D";
import { TickableComposition } from "../Engine2D/Animate/Composition/TickableComposition";
import { NodeClip } from "../Engine2D/Animate/Clip/NodeClip";
import { Scene } from "../Engine2D/Animate/Scene/Scene";
import { App } from "../App";
import { WaitComposition } from "../Engine2D/Animate/Composition/WaitComposition";

class FadeInNode extends NodeClip {
	constructor(node: Node2D, durationMs: number) {
		super(
			node,
			{ 0: { opacity: Opacity.Transparent }, [durationMs]: { opacity: Opacity.Opaque } },
			{ timingFunction: Interpolation.easeInOutCubic },
		);
	}
}

export function makeScene(diagram: Diagram) {
	const facilityGroup = Engine.nodeByUname("group:facility");
	const determinantGroup = Engine.nodeByUname("group:determinant");
	const pathologyGroup = Engine.nodeByUname("group:pathology");

	if (!facilityGroup || !determinantGroup || !pathologyGroup) {
		throw new Error("An node is missing");
	}

	const revealComposition = new TickableComposition(
		"home",
		[
			[0, new FadeInNode(diagram, 750)],
			[0, new FadeInNode(pathologyGroup, 1_000)],
			[500, new FadeInNode(determinantGroup, 1_000)],
			[1000, new FadeInNode(facilityGroup, 1_000)],
		],
	);

	revealComposition.onstarted = () => {
		diagram.setOpacity(Opacity.Transparent);
		facilityGroup?.setOpacity(Opacity.Transparent);
		determinantGroup?.setOpacity(Opacity.Transparent);
		pathologyGroup?.setOpacity(Opacity.Transparent);
	};

	return new Scene([revealComposition]);
}
