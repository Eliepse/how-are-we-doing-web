import { TickableComposition } from "../../Engine2D/Animate/Composition/TickableComposition";
import { Engine } from "../../Engine2D/Engine";
import { Scene } from "../../Engine2D/Animate/Scene/Scene";
import { ActionComposition } from "../../Engine2D/Animate/Composition/ActionComposition";
import { FadeNodeClip } from "../../Engine2D/Animate/Predefined/FadeNodeClip";
import { FadeDomClip } from "../../Engine2D/Animate/Predefined/FadeDomClip";
import { WaitComposition } from "../../Engine2D/Animate/Composition/WaitComposition";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";
import { App } from "../../App";
import { HTMLScene } from "../../Animations/Scene/HTMLScene";
import { SelectNodeActionScene } from "../../Animations/Scene/SelectNodeActionScene";
import { domOrThrow } from "../../helpers";
import { makeDiagramFadeClips } from "../../Animations/Composition/DiagramFadeComposition";
import type { Pathology } from "../../Diagram/Items/Pathology/Pathology";
import type { Determinant } from "../../Diagram/Items/Determinant/Determinant";
import type { Facility } from "../../Diagram/Items/Facility/Facility";
import { IntroScene } from "../common/IntroScene";

export class EssentialDemo extends Scene {
	constructor() {
		const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
		const determinants = Engine.nodeByUnameOrThrow("group:determinant");
		const facilities = Engine.nodeByUnameOrThrow("group:facility");
		const decorations = Engine.nodeByUnameOrThrow("decoration:main:background");
		const links = Engine.nodeByUnameOrThrow("link:manager");
		const selectTargets = {
			pathology: Engine.nodeByUnameOrThrow("pathology:113") as Pathology,
			determinant: Engine.nodeByUnameOrThrow("determinant:17") as Determinant,
			facility: Engine.nodeByUnameOrThrow("facility:29") as Facility,
		} as const;

		super([
			new ActionComposition(() => {
				App.instance().setReadonly(true);
				pathologies.setOpacity(new Opacity(0.1));
				determinants.setOpacity(new Opacity(0.1));
				facilities.setOpacity(new Opacity(0.1));
				decorations.setOpacity(new Opacity(0.1));
				links.setOpacity(new Opacity(0.3));
			}),

			new IntroScene(),

			// Select pathology
			new HTMLScene(
				(register) => {
					register("action", domOrThrow("#demo-12"));
					register("a", domOrThrow("#demo-13"));
					register("b", domOrThrow("#demo-14"));
				},
				(n) => [
					new TickableComposition([
						[0, new FadeDomClip(n("action"), "in", 1_250)],
						[0, new FadeNodeClip(pathologies, "in", 1_250, { min: new Opacity(0.1) })],
					]),
					new SelectNodeActionScene(selectTargets.pathology),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([
						[0, new FadeDomClip(n("a"), "in", 1_250)],
						[0, new FadeNodeClip(links, "in", 1_250, { min: new Opacity(.3) })],
						[0, new FadeNodeClip(determinants, "in", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(facilities, "in", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(decorations, "in", 1_250, { min: new Opacity(0.1) })],
					]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("a"), "out", 1_250)],
						[1_500, new FadeDomClip(n("b"), "in", 1_250)],
					]),
					new WaitComposition(3_000),
					new ActionComposition(() => App.instance().clearSelection()),
					new TickableComposition([
						[0, new FadeDomClip(n("b"), "out", 1_250)],
						[0, new FadeNodeClip(pathologies, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(facilities, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(links, "out", 1_250, { min: new Opacity(.3) })],
						[0, new FadeNodeClip(decorations, "out", 1_250, { min: new Opacity(.3) })],
					]),
				],
			),

			// Select determinant
			new HTMLScene(
				(register) => {
					register("action", domOrThrow("#demo-15"));
					register("info-1", domOrThrow("#demo-16"));
					register("info-2", domOrThrow("#demo-17"));
				},
				(n) => [
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new SelectNodeActionScene(selectTargets.determinant),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "in", 1_250)],
						[0, new FadeNodeClip(links, "in", 1_250, { min: new Opacity(.3) })],
						[0, new FadeNodeClip(pathologies, "in", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(facilities, "in", 1_250, { min: new Opacity(0.1) })],
					]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "out", 1_250)],
						[1_500, new FadeDomClip(n("info-2"), "in", 1_250)],
					]),
					new WaitComposition(3_000),
					new ActionComposition(() => App.instance().clearSelection()),
					new TickableComposition([
						[0, new FadeDomClip(n("info-2"), "out", 1_250)],
						[0, new FadeNodeClip(pathologies, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(determinants, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(links, "out", 1_250, { min: new Opacity(.3) })],
					]),
				],
			),

			// Select facility
			new HTMLScene(
				(register) => {
					register("action", domOrThrow("#demo-18"));
					register("info-1", domOrThrow("#demo-19"));
					register("info-2", domOrThrow("#demo-20"));
				},
				(n) => [
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new SelectNodeActionScene(selectTargets.facility),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "in", 1_250)],
						[0, new FadeNodeClip(determinants, "in", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(pathologies, "in", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(links, "in", 1_250, { min: new Opacity(.3) })],
					]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "out", 1_250)],
						[1_500, new FadeDomClip(n("info-2"), "in", 1_250)],
					]),
					new WaitComposition(3_000),
					new ActionComposition(() => App.instance().clearSelection()),
					new TickableComposition([
						[0, new FadeDomClip(n("info-2"), "out", 1_250)],
						[0, new FadeNodeClip(pathologies, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(determinants, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(facilities, "out", 1_250, { min: new Opacity(0.1) })],
						[0, new FadeNodeClip(links, "out", 1_250, { min: new Opacity(.3) })],
					]),
				],
			),

			new HTMLScene(
				(register) => {
					register("lexique", domOrThrow("#demo-21"));
					register("your-call", domOrThrow("#demo-22"));
					register("your-call", domOrThrow("#demo-22"));
					register("lexicon-btn", domOrThrow('#navigation [data-action="lexicon:open"]'));
				},
				(n) => [
					new ActionComposition(() => {
						n("lexicon-btn").style.background = "white";
						n("lexicon-btn").style.color = "var(--dark-blue)";
					}),
					new TickableComposition([
						[0, new FadeDomClip(n("lexique"), "in", 1_250)],
						...makeDiagramFadeClips("out", 750),
						[750, new FadeDomClip(n("lexicon-btn"), "in", 750)],
					]),
					new WaitComposition(4_000),
					new TickableComposition([
						[0, new FadeDomClip(n("lexique"), "out", 1_250)],
						[0, new FadeDomClip(n("lexicon-btn"), "out", 1_250)],
					]),
					new ActionComposition(() => {
						n("lexicon-btn").style.background = "";
						n("lexicon-btn").style.color = "";
					}),
					new WaitComposition(500),
					new TickableComposition([[0, new FadeDomClip(n("your-call"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("your-call"), "out", 1_250)]]),
				],
			),
		]);
	}
}
