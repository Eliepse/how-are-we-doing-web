import type { ActionsHandler } from "./ActionsHandler";
import type { Collector } from "../Telemetry/Collector";
import Demo from "../Tutorials/Demo";
import { Presenter } from "../Tutorials/Presenter";
import { Scene } from "../Engine2D/Animate/Scene/Scene";
import { FadeDomClip } from "../Engine2D/Animate/Predefined/FadeDomClip";
import { Timeline } from "../Engine2D/Animate/Timeline";
import { type ClipTuple, TickableComposition } from "../Engine2D/Animate/Composition/TickableComposition";
import { ActionComposition } from "../Engine2D/Animate/Composition/ActionComposition";
import { WaitComposition } from "../Engine2D/Animate/Composition/WaitComposition";
import { Interpolation } from "../Engine2D/Time/interpolations";
import { domOrThrow } from "../helpers";

export class DemoActionsHandler implements ActionsHandler {
	private uiElements: HTMLElement[] = [];
	private closeButtons: HTMLElement[] = [];

	constructor(private readonly collector: Collector) {
		this.uiElements = Array.from(document.querySelectorAll<HTMLElement>("#navigation [data-key='actions-side'] [data-action]"));
		this.closeButtons = Array.from(document.querySelectorAll<HTMLElement>("#navigation [data-action='demo:close']"));
	}

	async open() {
		this.collector.logEvent("demo_opened");

		await Timeline.play(new Scene([
			new WaitComposition(150),
			new TickableComposition([
				...this.uiElements.map((el) => [0, new FadeDomClip(el, "out", 1250, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
				[0, new FadeDomClip(domOrThrow("#modes"), "out", 1250, { timingFunction: Interpolation.easeInOutCubic })],
				[0, new FadeDomClip(domOrThrow("#contextControls"), "out", 1250, { timingFunction: Interpolation.easeInOutCubic })],
			]),
			new ActionComposition(() => this.uiElements.forEach((el) => el.style.display = "demo:close" !== el.dataset.action ? "none" : "")),
			new TickableComposition([
				...this.closeButtons.map((el) => [0, new FadeDomClip(el, "in", 500, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
			]),
		]));

		void Demo.start();
	}

	async close() {
		Demo.stop();
		Presenter.hide();

		this.collector.logEvent("demo_stopped");

		await Timeline.play(new Scene([
			new WaitComposition(150),
			new TickableComposition([
				...this.closeButtons.map((el) => [0, new FadeDomClip(el, "out", 500, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
			]),
			new ActionComposition(() => this.uiElements.forEach((el) => el.style.display = "demo:close" !== el.dataset.action ? "" : "none")),
			new TickableComposition([
				...this.uiElements.map((el) => [0, new FadeDomClip(el, "in", 1250, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
				[0, new FadeDomClip(domOrThrow("#modes"), "in", 1250, { timingFunction: Interpolation.easeInOutCubic })],
				[0, new FadeDomClip(domOrThrow("#contextControls"), "in", 1250, { timingFunction: Interpolation.easeInOutCubic })],
			]),
		]));
	}

	actions(): Record<string, () => void> {
		return {
			"demo:open": () => this.open(),
			"demo:close": () => this.close(),
		};
	}
}