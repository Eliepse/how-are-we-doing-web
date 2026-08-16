import { EssentialDemo } from "./essential/EssentialDemo";
import { Presenter } from "./Presenter";
import { Timeline } from "../Engine2D/Animate/Timeline";

class Demo {
	async start() {
		Presenter.show();
		await Timeline.play(new EssentialDemo());
		Presenter.hide();
	}
}

export default new Demo();