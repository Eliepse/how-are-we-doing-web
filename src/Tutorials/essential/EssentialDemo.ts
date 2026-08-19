import { PrepareDemoComposition } from "../common/PrepareDemoComposition";
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
import { Pathology } from "../../Diagram/Items/Pathology/Pathology";
import { SelectNodeActionScene } from "../../Animations/Scene/SelectNodeActionScene";
import { Facility } from "../../Diagram/Items/Facility/Facility";
import { Determinant } from "../../Diagram/Items/Determinant/Determinant";
import { domOrThrow } from "../../helpers";
import { IntroScene } from "../common/IntroScene";

export class EssentialDemo extends Scene {
	constructor() {
		const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
		const determinants = Engine.nodeByUnameOrThrow("group:determinant");
		const facilities = Engine.nodeByUnameOrThrow("group:facility");
		const decorations = Engine.nodeByUnameOrThrow("decoration:main:background");

		super([
			new ActionComposition(() => App.instance().setReadonly(true)),
			new PrepareDemoComposition(),
			new TickableComposition([
				[0, new FadeNodeClip(pathologies, "out", 2_000, { min: new Opacity(.1) })],
				[0, new FadeNodeClip(determinants, "out", 2_000, { min: new Opacity(.1) })],
				[0, new FadeNodeClip(facilities, "out", 2_000, { min: new Opacity(.1) })],
				[0, new FadeNodeClip(decorations, "out", 2_000, { min: new Opacity(.1) })],
			]),

			new WaitComposition(1_000),

			new IntroScene(),

			// Select pathology
			new HTMLScene(
				(register) => {
					register("action", domOrThrow("#demo-12"));
					register("a", domOrThrow("#demo-13"));
					register("b", domOrThrow("#demo-14"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("action"), "in", 1_250)],
						[0, new FadeNodeClip(pathologies, "in", 1_250, { min: new Opacity(.1) })],
					]),
					new SelectNodeActionScene((node) => node instanceof Pathology && 113 === node.id),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([
						[0, new FadeDomClip(n("a"), "in", 1_250)],
						[0, new FadeNodeClip(determinants, "in", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(facilities, "in", 1_250, { min: new Opacity(.1) })],
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
						[0, new FadeNodeClip(pathologies, "out", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(facilities, "out", 1_250, { min: new Opacity(.1) })],
					]),
				]),
			),

			// Select determinant
			new HTMLScene(
				(register) => {
					register("action", domOrThrow("#demo-15"));
					register("info-1", domOrThrow("#demo-16"));
					register("info-2", domOrThrow("#demo-17"));
				},
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new SelectNodeActionScene((node) => node instanceof Determinant && 17 === node.id),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "in", 1_250)],
						[0, new FadeNodeClip(pathologies, "in", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(facilities, "in", 1_250, { min: new Opacity(.1) })],
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
						[0, new FadeNodeClip(pathologies, "out", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(determinants, "out", 1_250, { min: new Opacity(.1) })],
					]),
				]),
			),

			// Select facility
			new HTMLScene(
				(register) => {
					register("action", domOrThrow("#demo-18"));
					register("info-1", domOrThrow("#demo-19"));
					register("info-2", domOrThrow("#demo-20"));
				},
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new SelectNodeActionScene((node) => node instanceof Facility && 29 === node.id),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "in", 1_250)],
						[0, new FadeNodeClip(determinants, "in", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(pathologies, "in", 1_250, { min: new Opacity(.1) })],
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
						[0, new FadeNodeClip(pathologies, "out", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(determinants, "out", 1_250, { min: new Opacity(.1) })],
						[0, new FadeNodeClip(facilities, "out", 1_250, { min: new Opacity(.1) })],
					]),
				]),
			),

			new WaitComposition(1_000),
			new TickableComposition([
				[0, new FadeNodeClip(pathologies, "in", 2_000, { min: new Opacity(.2) })],
				[0, new FadeNodeClip(determinants, "in", 2_000, { min: new Opacity(.2) })],
				[0, new FadeNodeClip(facilities, "in", 2_000, { min: new Opacity(.2) })],
				[0, new FadeNodeClip(decorations, "in", 2_000, { min: new Opacity(.2) })],
			]),
			new ActionComposition(() => App.instance().setReadonly(false)),
		]);
	}
}