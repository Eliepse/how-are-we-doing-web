import { PrepareDemoComposition } from "../common/PrepareDemoComposition";
import { TickableComposition } from "../../Engine2D/Animate/Composition/TickableComposition";
import { Engine } from "../../Engine2D/Engine";
import { Scene } from "../../Engine2D/Animate/Scene/Scene";
import { ActionComposition } from "../../Engine2D/Animate/Composition/ActionComposition";
import { FadeNodeClip } from "../../Engine2D/Animate/Predefined/FadeNodeClip";
import { FadeDomClip } from "../../Engine2D/Animate/Predefined/FadeDomClip";
import { Presenter } from "../Presenter";
import { WaitComposition } from "../../Engine2D/Animate/Composition/WaitComposition";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";
import { App } from "../../App";
import { HTMLScene } from "../../Animations/Scene/HTMLScene";

const domCache = new Map<string, HTMLElement>();

function getDom(key: string): HTMLElement {
	let node: HTMLElement | undefined | null = domCache.get(key);

	if (node) {
		return node;
	}

	node = document.querySelector<HTMLElement>(`#${key}`);

	if (!node) {
		throw new Error(`#${key} not found`);
	}

	domCache.set(key, node);
	return node;
}

export class EssentialDemo extends Scene {

	constructor() {
		const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
		const determinants = Engine.nodeByUnameOrThrow("group:determinant");
		const facilities = Engine.nodeByUnameOrThrow("group:facility");
		const decorations = Engine.nodeByUnameOrThrow("decoration:main:background");

		const presenter = Presenter.presenter;
		// presenter.clear();

		// presenter.getCellDOM("B1").innerHTML = `
		// 	<div id="demo-1" class="tutorial-regular" style="display: none; opacity: 0">
		// 		<p>
		// 			Quand on pense à la santé, on pense d'abord<br/>
		// 			aux médecins, aux médicaments, aux hôpitaux...
		// 		</p>
		// 		<p>
		// 			mais beaucoup moins à l'environnement<br/>
		// 			dans lequel nous vivons
		// 		</p>
		// 	</div>
		//
		// 	<div id="demo-2" class="tutorial-regular" style="display: none; opacity: 0">
		// 		<p>
		// 			<strong>Notre santé est toutefois influencée par de multiples facteurs</strong><br/>
		// 			dont les effets se cumulent tout au long de la vie.
		// 		</p>
		// 	</div>
		//
		// 	<div id="demo-3" class="tutorial-regular" style="display: none; opacity: 0">
		// 		<p>
		// 			Les recherches scientifiques menées sur ces facteurs,<br>
		// 			appelés <strong>les déterminants de santé,</strong><br>
		// 			révèlent une réalitée souvent méconnue :
		// 		</p>
		// 		<p id="demo-3-2" style="opacity: 0">
		// 			Les soins médicaux et la génétique n'expliqueraient<br/>
		// 			qu'environ <strong>30% de notre état de santé.</strong>
		// 		</p>
		// 	</div>
		//
		// 	<div id="demo-4" class="tutorial-regular" style="display: none; opacity: 0">
		// 		<p>
		// 			Les 70 % restants dépendent de notre situation sociale et économique,<br/>
		// 			de nos modes de vie et de notre environnement au quotidien :
		// 		</p>
		// 		<p id="demo-4-2" style="opacity: 0">
		// 			la qualité de nos logements, l'air que nous respirons,<br/>
		// 			notre proximité avec la nature, notre facilité à nous déplacer<br/>
		// 			à pied ou à vélo, le sentiment de sécurité dans notre quartier…
		// 		</p>
		// 	</div>
		// `;

		super([
			new ActionComposition(() => App.instance().setReadonly(true)),
			new PrepareDemoComposition(),
			new TickableComposition([
				[0, new FadeNodeClip(pathologies, "out", 2_000, { min: new Opacity(.2) })],
				[0, new FadeNodeClip(determinants, "out", 2_000, { min: new Opacity(.2) })],
				[0, new FadeNodeClip(facilities, "out", 2_000, { min: new Opacity(.2) })],
				[0, new FadeNodeClip(decorations, "out", 2_000, { min: new Opacity(.2) })],
			]),

			new HTMLScene(
				(register) => register("main", getDom("demo-1")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),
			new HTMLScene(
				(register) => register("main", getDom("demo-2")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),
			new HTMLScene(
				(register) => {
					register("main", getDom("demo-3"));
					register("second", getDom("demo-3-2"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("main"), "in", 1_250)],
						[2_000, new FadeDomClip(n("second"), "in", 1_250)],
					]),
					new WaitComposition(2_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),
			new HTMLScene(
				(register) => {
					register("main", getDom("demo-4"));
					register("second", getDom("demo-4-2"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("main"), "in", 1_250)],
						[2_000, new FadeDomClip(n("second"), "in", 1_250)],
					]),
					new WaitComposition(2_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),
			new HTMLScene(
				(register) => register("main", getDom("demo-5")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),
			new HTMLScene(
				(register) => register("main", getDom("demo-6")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),

			new HTMLScene(
				(register) => {
					register("list", getDom("demo-7"));
					register("health", getDom("demo-7-2"));
					register("determinant", getDom("demo-7-3"));
					register("facility", getDom("demo-7-4"));
					register("health-details", getDom("demo-8"));
					register("determinant-details", getDom("demo-9"));
					register("facility-details", getDom("demo-10"));
				},
				(n) => ([
					new TickableComposition([
						[0, new FadeDomClip(n("list"), "in", 750)],
						[2_000, new FadeDomClip(n("health"), "in", 750)],
						[2_000, new FadeNodeClip(pathologies, "in", 750, { min: new Opacity(.2) })],
						[2_000, new FadeDomClip(n("health-details"), "in", 750)],
					]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("health-details"), "out", 750)],
						[0, new FadeNodeClip(pathologies, "out", 750, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("determinant"), "in", 750)],
						[1_000, new FadeNodeClip(determinants, "in", 750, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("determinant-details"), "in", 750)],
					]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("determinant-details"), "out", 750)],
						[0, new FadeNodeClip(determinants, "out", 750, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("facility"), "in", 750)],
						[1_000, new FadeNodeClip(facilities, "in", 750, { min: new Opacity(.2) })],
						[1_000, new FadeDomClip(n("facility-details"), "in", 750)],
					]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("list"), "out", 750)],
						[0, new FadeDomClip(n("facility-details"), "out", 750)],
						[0, new FadeNodeClip(facilities, "out", 750, { min: new Opacity(.2) })],
					]),
				]),
			),

			new HTMLScene(
				(register) => register("main", getDom("demo-11")),
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("main"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("main"), "out", 1_250)]]),
				]),
			),

			// Select pathology
			new HTMLScene(
				(register) => {
					register("action", getDom("demo-12"))
					register("a", getDom("demo-13"));
					register("b", getDom("demo-14"));
				},
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([[0, new FadeDomClip(n("a"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("a"), "out", 1_250)],
						[1_500, new FadeDomClip(n("b"), "in", 1_250)],
					]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("b"), "out", 1_250)]]),
				]),
			),

			// Select determinant
			new HTMLScene(
				(register) => {
					register("action", getDom("demo-15"))
					register("info-1", getDom("demo-16"));
					register("info-2", getDom("demo-17"));
				},
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([[0, new FadeDomClip(n("info-1"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "out", 1_250)],
						[1_500, new FadeDomClip(n("info-2"), "in", 1_250)],
					]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("info-2"), "out", 1_250)]]),
				]),
			),

			// Select facility
			new HTMLScene(
				(register) => {
					register("action", getDom("demo-18"))
					register("info-1", getDom("demo-19"));
					register("info-2", getDom("demo-20"));
				},
				(n) => ([
					new TickableComposition([[0, new FadeDomClip(n("action"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("action"), "out", 1_250)]]),
					new TickableComposition([[0, new FadeDomClip(n("info-1"), "in", 1_250)]]),
					new WaitComposition(3_000),
					new TickableComposition([
						[0, new FadeDomClip(n("info-1"), "out", 1_250)],
						[1_500, new FadeDomClip(n("info-2"), "in", 1_250)],
					]),
					new WaitComposition(3_000),
					new TickableComposition([[0, new FadeDomClip(n("info-2"), "out", 1_250)]]),
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