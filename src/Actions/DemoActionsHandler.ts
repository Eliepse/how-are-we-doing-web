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
import { makeDiagramFadeClips } from "../Animations/Composition/DiagramFadeComposition";
import { App } from "../App";

export class DemoActionsHandler implements ActionsHandler {
	private readonly uiElements: HTMLElement[] = [];
	private readonly closeButtons: HTMLElement[] = [];
	private readonly selector: HTMLElement;
	private canSelectDemo = false;

	constructor(private readonly collector: Collector) {
		this.uiElements = Array.from(document.querySelectorAll<HTMLElement>("#navigation [data-key='actions-side'] [data-action]"));
		this.closeButtons = Array.from(document.querySelectorAll<HTMLElement>("#navigation [data-action='demo:close']"));
		this.selector = domOrThrow(".demo-selector");

		this.selector.querySelectorAll<HTMLButtonElement>("button[data-demo]").forEach((btn) => {
			const name = btn.dataset.demo;

			if ("essential" !== name && "complete" !== name && "advanced" !== name) {
				return;
			}

			btn.addEventListener("mousedown", () => {
				void this.startDemo(name);
			});
		});
	}

	async open() {
		this.collector.logEvent("demo_selector_opened");

		App.instance().setReadonly(true);

		await Timeline.play(new Scene([
			new WaitComposition(150),
			new TickableComposition([
				...this.uiElements.map((el) => [0, new FadeDomClip(el, "out", 750, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
				[0, new FadeDomClip(domOrThrow("#modes"), "out", 750, { timingFunction: Interpolation.easeInOutCubic })],
				[0, new FadeDomClip(domOrThrow("#contextControls"), "out", 750, { timingFunction: Interpolation.easeInOutCubic })],
			]),
			new ActionComposition(() => {
				this.uiElements.forEach((el) => el.style.display = "demo:close" !== el.dataset.action ? "none" : "");
				this.selector.style.opacity = "0";
				this.selector.style.display = "";
			}),
			new TickableComposition([
				...makeDiagramFadeClips("out", 1_000),
				...this.closeButtons.map((el) => [500, new FadeDomClip(el, "in", 750, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
				[500, new FadeDomClip(this.selector, "in", 750, { timingFunction: Interpolation.easeInOutCubic })],
			]),
		]));

		this.canSelectDemo = true;
	}

	private async startDemo(name: "essential" | "complete" | "advanced") {
		if (!this.canSelectDemo) {
			return;
		}

		this.canSelectDemo = false;

		await Timeline.play(new Scene([
			new TickableComposition([
				[0, new FadeDomClip(this.selector, "out", 750, { timingFunction: Interpolation.easeInOutCubic })],
			]),
			new ActionComposition(() => this.selector.style.display = "none"),
			new WaitComposition(500),
		]));

		await Demo.start();
		await this.restoreView();
	}

	async close() {
		this.collector.logEvent("demo_stopped");
		this.canSelectDemo = false;
		await this.restoreView()
	}

	private async restoreView() {
		Demo.stop();
		Presenter.hide();


		await Timeline.play(new Scene([
			new WaitComposition(150),
			new TickableComposition([
				...this.closeButtons.map((el) => [0, new FadeDomClip(el, "out", 750, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
				[0, new FadeDomClip(this.selector, "out", 750, { timingFunction: Interpolation.easeInOutCubic })],
			]),
			new ActionComposition(() => {
				this.uiElements.forEach((el) => el.style.display = "demo:close" !== el.dataset.action ? "" : "none");
				this.selector.style.display = "none";
			}),
			new TickableComposition([
				...this.uiElements.map((el) => [0, new FadeDomClip(el, "in", 750, { timingFunction: Interpolation.easeInOutCubic })] satisfies ClipTuple),
				[0, new FadeDomClip(domOrThrow("#modes"), "in", 750, { timingFunction: Interpolation.easeInOutCubic })],
				[0, new FadeDomClip(domOrThrow("#contextControls"), "in", 750, { timingFunction: Interpolation.easeInOutCubic })],
				...makeDiagramFadeClips("in", 1_000),
			]),
		]));

		App.instance().setReadonly(false);
	}

	actions(): Record<string, () => void> {
		return {
			"demo:open": () => this.open(),
			"demo:close": () => this.close(),
		};
	}
}