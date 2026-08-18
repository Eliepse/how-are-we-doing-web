import { Scene } from "../../Engine2D/Animate/Scene/Scene";
import { HTMLScene } from "../../Animations/Scene/HTMLScene";
import { TickableComposition } from "../../Engine2D/Animate/Composition/TickableComposition";
import { FadeDomClip } from "../../Engine2D/Animate/Predefined/FadeDomClip";
import { WaitComposition } from "../../Engine2D/Animate/Composition/WaitComposition";
import { FadeNodeClip } from "../../Engine2D/Animate/Predefined/FadeNodeClip";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";
import { domOrThrow } from "../../helpers";
import { Engine } from "../../Engine2D/Engine";

const READ_SMALL = 3_000;
const READ_BASE = 5_000;
const READ_LONG = 8_500;
const TRANSITION_FAST = 450;
const TRANSITION_BASE = 750;
const TRANSITION_SLOW = 1_500;

export class IntroScene extends Scene {
	constructor() {
		const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
		const determinants = Engine.nodeByUnameOrThrow("group:determinant");
		const facilities = Engine.nodeByUnameOrThrow("group:facility");

		super([
			new HTMLScene(
				(register) => register("main", domOrThrow("#demo-1")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", TRANSITION_SLOW)]]),
					new WaitComposition(READ_BASE),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),
			new HTMLScene(
				(register) => register("main", domOrThrow("#demo-2")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", TRANSITION_BASE)]]),
					new WaitComposition(READ_BASE),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),
			new HTMLScene(
				(register) => {
					register("main", domOrThrow("#demo-3"));
					register("second", domOrThrow("#demo-3-2"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("main"), "in", TRANSITION_BASE)],
						[READ_BASE, new FadeDomClip(n("second"), "in", TRANSITION_BASE)],
					]),
					new WaitComposition(READ_BASE),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),
			new HTMLScene(
				(register) => {
					register("main", domOrThrow("#demo-4"));
					register("second", domOrThrow("#demo-4-2"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("main"), "in", TRANSITION_BASE)],
						[3_000, new FadeDomClip(n("second"), "in", TRANSITION_BASE)],
					]),
					new WaitComposition(READ_BASE),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),
			new HTMLScene(
				(register) => register("main", domOrThrow("#demo-5")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", TRANSITION_BASE)]]),
					new WaitComposition(READ_SMALL),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),
			new HTMLScene(
				(register) => register("main", domOrThrow("#demo-6")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", TRANSITION_BASE)]]),
					new WaitComposition(READ_LONG),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),

			new HTMLScene(
				(register) => {
					register("list", domOrThrow("#demo-7"));
					register("health", domOrThrow("#demo-7-2"));
					register("determinant", domOrThrow("#demo-7-3"));
					register("facility", domOrThrow("#demo-7-4"));
					register("health-details", domOrThrow("#demo-8"));
					register("determinant-details", domOrThrow("#demo-9"));
					register("facility-details", domOrThrow("#demo-10"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("list"), "in", TRANSITION_FAST)],
						[2_000, new FadeDomClip(n("health"), "in", TRANSITION_FAST)],
						[2_000, new FadeNodeClip(pathologies, "in", TRANSITION_FAST, { min: new Opacity(.2) })],
						[2_000, new FadeDomClip(n("health-details"), "in", TRANSITION_FAST)],
					]),
					new WaitComposition(READ_LONG),
					new TickableComposition([
						[0, new FadeDomClip(n("health-details"), "out", TRANSITION_FAST)],
						[0, new FadeNodeClip(pathologies, "out", TRANSITION_FAST, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("determinant"), "in", TRANSITION_FAST)],
						[1_000, new FadeNodeClip(determinants, "in", TRANSITION_FAST, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("determinant-details"), "in", TRANSITION_FAST)],
					]),
					new WaitComposition(READ_LONG),
					new TickableComposition([
						[0, new FadeDomClip(n("determinant-details"), "out", TRANSITION_FAST)],
						[0, new FadeNodeClip(determinants, "out", TRANSITION_FAST, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("facility"), "in", TRANSITION_FAST)],
						[1_000, new FadeNodeClip(facilities, "in", TRANSITION_FAST, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("facility-details"), "in", TRANSITION_FAST)],
					]),
					new WaitComposition(READ_LONG),
					new TickableComposition([
						[0, new FadeDomClip(n("list"), "out", TRANSITION_FAST)],
						[0, new FadeDomClip(n("facility-details"), "out", TRANSITION_FAST)],
						[0, new FadeNodeClip(facilities, "out", TRANSITION_FAST, { min: new Opacity(.2) })],
					]),
				]),
			),

			new HTMLScene(
				(register) => register("main", domOrThrow("#demo-11")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", TRANSITION_BASE)]]),
					new WaitComposition(READ_BASE),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", TRANSITION_BASE)]]),
				]),
			),
		]);
	}
}