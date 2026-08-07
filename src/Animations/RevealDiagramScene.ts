import { Scene } from "../Engine2D/Animator/Scene";
import { Engine } from "../Engine2D/Engine";
import { Sequence } from "../Engine2D/Animator/Sequence";
import type { Diagram } from "../Diagram/Diagram";
import { Opacity } from "../Engine2D/ValueObject/Opacity";
import { Interpolation } from "../Engine2D/Time/interpolations";
import { NodeSequence } from "../Engine2D/Animator/NodeSequence";
import type { Node2D } from "../Engine2D/Node/Node2D";

class FadeInNode extends NodeSequence {
	constructor(node: Node2D, durationMs: number) {
		super(
			node,
			{ 0: { opacity: Opacity.Transparent }, [durationMs]: { opacity: Opacity.Opaque } },
			{ timingFunction: Interpolation.easeInOutCubic },
		);
	}
}

export class RevealDiagramScene extends Scene {
	constructor(diagram: Diagram) {
		const facilityGroup = Engine.nodeByUname("group:facility");
		const determinantGroup = Engine.nodeByUname("group:determinant");
		const pathologyGroup = Engine.nodeByUname("group:pathology");

		if(!facilityGroup || !determinantGroup || !pathologyGroup) {
			return;
		}

		super(
			"home",
			[
				[0, new FadeInNode(diagram, 750)],
				[0, new FadeInNode(pathologyGroup, 1_000)],
				[500, new FadeInNode(determinantGroup, 1_000)],
				[1000, new FadeInNode(facilityGroup, 1_000)],
			],
		);

		this.onstarted = () => {
			diagram.setOpacity(Opacity.Transparent);
			facilityGroup?.setOpacity(Opacity.Transparent);
			determinantGroup?.setOpacity(Opacity.Transparent);
			pathologyGroup?.setOpacity(Opacity.Transparent);
		};

	}
}