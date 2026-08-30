import { EssentialDemo } from "./essential/EssentialDemo";
import { Presenter } from "./Presenter";
import { Timeline } from "../Engine2D/Animate/Timeline";
import { App } from "../App";

class Demo {
	private abortController: AbortController | undefined = undefined;

	async start() {
		await App.instance().changeMode("basic", false);
		App.instance().getDiagram().selectNode(undefined);
		App.instance().getDiagram().previewNode(undefined);
		App.instance().resetContext();

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
