import { Scene } from "../Engine2D/Animator/Scene";
import { Engine } from "../Engine2D/Engine";
import { Sequence } from "../Engine2D/Animator/Sequence";
import type { Diagram } from "../Diagram/Diagram";
import { Opacity } from "../Engine2D/ValueObject/Opacity";
import { Interpolation } from "../Engine2D/Time/interpolations";

export class RevealDiagramScene extends Scene {
	constructor(diagram: Diagram) {
		const facilityGroup = Engine.nodeByUname("group:facility");
		const determinantGroup = Engine.nodeByUname("group:determinant");
		const pathologyGroup = Engine.nodeByUname("group:pathology");

		super(
			"home",
			[
				[1250, new Sequence((r) => diagram.setOpacity(new Opacity(r)), 750, { timingFunction: Interpolation.easeInOutCubic })],
				[1250, new Sequence((r) => pathologyGroup?.setOpacity(new Opacity(r)), 1_000, { timingFunction: Interpolation.easeInOutCubic })],
				[1750, new Sequence((r) => determinantGroup?.setOpacity(new Opacity(r)), 1_000, { timingFunction: Interpolation.easeInOutCubic })],
				[2250, new Sequence((r) => facilityGroup?.setOpacity(new Opacity(r)), 1_000, { timingFunction: Interpolation.easeInOutCubic })],
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