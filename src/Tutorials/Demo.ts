import { EssentialDemo } from "./essential/EssentialDemo";
import { Presenter } from "./Presenter";
import { Timeline } from "../Engine2D/Animate/Timeline";
import { Scene } from "../Engine2D/Animate/Scene/Scene";
import { TickableComposition } from "../Engine2D/Animate/Composition/TickableComposition";
import { FadeNodeClip } from "../Engine2D/Animate/Predefined/FadeNodeClip";
import { Engine } from "../Engine2D/Engine";
import { App } from "../App";

class Demo {
	private abortController: AbortController|undefined = undefined;

	async start() {
		Presenter.show();

		const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
		const determinants = Engine.nodeByUnameOrThrow("group:determinant");
		const facilities = Engine.nodeByUnameOrThrow("group:facility");
		const decorations = Engine.nodeByUnameOrThrow("decoration:main:background");

		this.abortController = new AbortController();
		await Timeline.play(new EssentialDemo(), this.abortController.signal);

		this.abortController = undefined;

		Presenter.clear();

		await Timeline.play(new Scene([
			new TickableComposition([
				[0, new FadeNodeClip(pathologies, "in", 300, { min: pathologies.getOpacity().get() })],
				[0, new FadeNodeClip(determinants, "in", 300, { min: determinants.getOpacity().get() })],
				[0, new FadeNodeClip(facilities, "in", 300, { min: facilities.getOpacity().get() })],
				[0, new FadeNodeClip(decorations, "in", 300, { min: decorations.getOpacity().get() })],
			]),
		]));
		App.instance().setReadonly(false);
		Presenter.hide();
	}

	stop() {
		this.abortController?.abort();
	}
}

export default new Demo();