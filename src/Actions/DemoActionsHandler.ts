import type { ActionsHandler } from "./ActionsHandler";
import Collector from "../Telemetry/Collector";
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
import { ActionManager } from "./ActionManager";

const CLIP_CONF = {
	timingFunction: Interpolation.easeInOutCubic,
} as const;

export class DemoActionsHandler implements ActionsHandler {
	private readonly uiElements: HTMLButtonElement[] = [];
	private readonly closeButtons: HTMLElement[] = [];
	private readonly selector: HTMLElement;
	private canSelectDemo = false;

	constructor() {
		this.closeButtons = Array.from(
			document.querySelectorAll<HTMLButtonElement>("#navigation [data-action='demo:close']"),
		);
		this.uiElements = Array.from(
			document.querySelectorAll<HTMLButtonElement>("#navigation [data-key='actions-side'] [data-action]"),
		).filter((el) => !this.closeButtons.includes(el));
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
		Collector.logEvent("demo_selector_opened");

		ActionManager.act("biblio:close");
		App.instance().setReadonly(true);

		await Timeline.play(
			new Scene([
				new WaitComposition(150),
				new TickableComposition([
					...this.uiElements.map((el) => [0, new FadeDomClip(el, "out", 750, CLIP_CONF)] satisfies ClipTuple),
					[0, new FadeDomClip(domOrThrow("#modes"), "out", 750, CLIP_CONF)],
					[0, new FadeDomClip(domOrThrow("#legendRoot"), "out", 750, CLIP_CONF)],
					[0, new FadeDomClip(domOrThrow("#contextControls"), "out", 750, CLIP_CONF)],
				]),
				new ActionComposition(() => {
					this.uiElements.forEach((el) => (el.disabled = "demo:close" !== el.dataset.action));
					this.uiElements.forEach((el) => (el.style.opacity = "demo:close" !== el.dataset.action ? "0" : ""));
					this.closeButtons.forEach((el) => (el.style.display = ""));
					this.selector.style.opacity = "0";
					this.selector.style.display = "";
				}),
				new TickableComposition([
					...makeDiagramFadeClips("out", 1_000),
					...this.closeButtons.map(
						(el) => [500, new FadeDomClip(el, "in", 750, CLIP_CONF)] satisfies ClipTuple,
					),
					[500, new FadeDomClip(this.selector, "in", 750, CLIP_CONF)],
				]),
			]),
		);

		this.canSelectDemo = true;
	}

	private async startDemo(name: "essential" | "complete" | "advanced") {
		if (!this.canSelectDemo) {
			return;
		}

		this.canSelectDemo = false;

		await Timeline.play(
			new Scene([
				new TickableComposition([[0, new FadeDomClip(this.selector, "out", 750, CLIP_CONF)]]),
				new ActionComposition(() => (this.selector.style.display = "none")),
				new WaitComposition(500),
			]),
		);

		await Demo.start();
		await this.restoreView();
	}

	async close() {
		Collector.logEvent("demo_stopped");
		this.canSelectDemo = false;
		await this.restoreView();
	}

	private async restoreView() {
		Demo.stop();
		Presenter.hide();

		await Timeline.play(
			new Scene([
				new WaitComposition(150),
				new TickableComposition([
					...this.closeButtons.map(
						(el) => [0, new FadeDomClip(el, "out", 750, CLIP_CONF)] satisfies ClipTuple,
					),
					[0, new FadeDomClip(this.selector, "out", 750, CLIP_CONF)],
				]),
				new ActionComposition(() => {
					this.uiElements.forEach((el) => (el.disabled = "demo:close" === el.dataset.action));
					this.uiElements.forEach((el) => (el.style.opacity = "demo:close" !== el.dataset.action ? "" : "0"));
					this.selector.style.display = "none";
					this.closeButtons.forEach((el) => (el.style.display = "none"));
				}),
				new TickableComposition([
					...this.uiElements.map((el) => [0, new FadeDomClip(el, "in", 750, CLIP_CONF)] satisfies ClipTuple),
					[0, new FadeDomClip(domOrThrow("#modes"), "in", 750, CLIP_CONF)],
					[0, new FadeDomClip(domOrThrow("#legendRoot"), "in", 750, CLIP_CONF)],
					[0, new FadeDomClip(domOrThrow("#contextControls"), "in", 750, CLIP_CONF)],
					...makeDiagramFadeClips("in", 1_000),
				]),
			]),
		);

		App.feature("hover:determinant", true);
		App.feature("hover:facility", true);
		App.feature("hover:pathology", true);
		App.feature("select:determinant", true);
		App.feature("select:facility", true);
		App.feature("select:pathology", true);
		App.instance().setReadonly(false);
	}

	actions(): Record<string, () => void> {
		return {
			"demo:open": () => this.open(),
			"demo:close": () => this.close(),
		};
	}
}
