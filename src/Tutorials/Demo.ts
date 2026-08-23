import { EssentialDemo } from "./essential/EssentialDemo";
import { Presenter } from "./Presenter";
import { Timeline } from "../Engine2D/Animate/Timeline";
import { Scene } from "../Engine2D/Animate/Scene/Scene";
import { App } from "../App";
import { TickableComposition } from "../Engine2D/Animate/Composition/TickableComposition";
import { makeDiagramFadeClips } from "../Animations/Composition/DiagramFadeComposition";

class Demo {
	private abortController: AbortController|undefined = undefined;

	async start() {
		Presenter.show();

		this.abortController = new AbortController();
		await Timeline.play(new EssentialDemo(), this.abortController.signal);

		this.abortController = undefined;

		Presenter.hide();
		Presenter.clear();
	}

	stop() {
		this.abortController?.abort();
	}
}

export default new Demo();