import { App } from "./App";
import type { Context } from "./Diagram/Context";
import { domOrThrow, wait } from "./helpers";
import { ActionManager } from "./Actions/ActionManager";
import { CreditsActionsHandler } from "./Actions/CreditsActionsHandler";
import { BibliographyActionsHandler } from "./Actions/BibliographyActionsHandler";
import { LanguageActionsHandler } from "./Actions/LanguageActionsHandler";
import { ContextActionsHandler } from "./Actions/ContextActionsHandler";
import { LexiconActionsHandler } from "./Actions/LexiconActionsHandler";
import { ModeActionsHandler } from "./Actions/ModeActionsHandler";
import { SystemActionsHandler } from "./Actions/SystemActionsHandler";

// @ts-ignore
import "/styles/styles.css";
// @ts-ignore
import "/styles/app.css";

import { DemoActionsHandler } from "./Actions/DemoActionsHandler";
import { NodeSelectionEvent } from "./Events/NodeSelectionEvent";
import Collector from "./Telemetry/Collector";
import { IndexedDBStore } from "./Telemetry/IndexedDBStore";
import { DenoBindingsStore } from "./Telemetry/DenoBindingsStore";
import { Pathology } from "./Diagram/Items/Pathology/Pathology";
import { Determinant } from "./Diagram/Items/Determinant/Determinant";
import { Facility } from "./Diagram/Items/Facility/Facility";
import { Color } from "./Engine2D/ValueObject/Color";
import { colors } from "./Diagram/colors";
import { style } from "./Diagram/Shape/LinkPath";
import { SVGStyle } from "./SVGRenderer/ValueObject/SVGStyle";
import { Stroke } from "./SVGRenderer/ValueObject/Stroke";

export type BroadcastDetermiant = { label: string; id: number };
const diagramChannel = new BroadcastChannel("diagram");

async function main(withLoader = true) {
	let loaderPercent = 0;

	function updateLoader(percent: number, _title: string): void {
		if (false === withLoader) {
			return;
		}

		if (!loaderDom.loadingBar) {
			return;
		}

		loaderPercent = percent;
		loaderDom.loadingBar.style.width = `${percent.toFixed(2)}%`;
	}

	const loaderDom = {
		root: document.querySelector<HTMLDivElement>("#splash"),
		loadingBar: document.querySelector<HTMLDivElement>(".loader__progressBar"),
	};

	if (false === withLoader) {
		loaderDom.root?.remove();
	}

	const appDom = document.querySelector<HTMLElement>("#app");
	const diagramDom = document.querySelector("#diagramRoot");

	if (null === appDom) {
		throw new Error("App DOM missing");
	}

	if (null === diagramDom) {
		throw new Error("Diagram DOM missing");
	}

	const app = App.init(appDom, diagramDom);
	app.setReadonly(true);

	Collector.register([new IndexedDBStore(), new DenoBindingsStore()]);

	await Collector.init();

	// @ts-ignore
	window.app = app;
	const translator = app.getTranslator();

	translator.translateDOM(document.querySelector<HTMLElement>("#navigation"));
	translator.translateDOM(document.querySelector<HTMLElement>("#credits"));
	translator.translateDOM(document.querySelector<HTMLElement>("#legendRoot"));

	const ctxDetailsModal = document.querySelector<HTMLElement>("#context-details");
	const openCtxActionBtns = document.querySelectorAll<HTMLButtonElement>("button[data-action='context:open']");

	document.querySelectorAll<HTMLButtonElement>("button[data-action='context:close']").forEach((btn) =>
		btn.addEventListener("mousedown", () => {
			if (btn.disabled || !ctxDetailsModal) {
				return;
			}

			ctxDetailsModal.ariaHidden = "true";
			ctxDetailsModal.style.display = "none";
		}),
	);
	openCtxActionBtns.forEach((btn) =>
		btn.addEventListener("mousedown", () => {
			if (btn.disabled || !ctxDetailsModal) {
				return;
			}

			ctxDetailsModal.ariaHidden = "false";
			ctxDetailsModal.style.display = "";
		}),
	);

	app.onContextChanged = (context: Context) => {
		// Update display
		document.querySelectorAll<HTMLElement>("[data-key='context:name']").forEach((node) => {
			node.textContent = translator.translate(context.name.toLowerCase(), "general").toUpperCase();
			node.dataset.tr = context.id;
		});

		// Telemetry
		diagramChannel.postMessage({ type: "contextChanged", data: { context } });
		Collector.logEvent("context_changed", { id: context.id, name: context.name });

		// Update legend

		const legendBlurred = document.querySelector<HTMLElement>("figure[data-legend=blurred]");
		if (legendBlurred) {
			legendBlurred.style.display = context.isDefault ? "none" : "";
		}

		const legendDefault = document.querySelector<HTMLElement>("figure[data-legend=default]");
		if (legendDefault) {
			legendDefault.style.display = context.isDefault ? "none" : "";
		}

		// Update button and modal
		const details = context.details;
		openCtxActionBtns.forEach((btn) => (btn.disabled = !details));

		if (!details && ctxDetailsModal) {
			ctxDetailsModal.ariaHidden = "true";
			ctxDetailsModal.style.display = "none";
		}

		if (details) {
			document
				.querySelectorAll<HTMLElement | HTMLImageElement>("#context-details [data-key^='context:']")
				.forEach((el) => {
					switch (el.dataset.key) {
						case "context:title":
							el.textContent = context.name;
							return;
						case "context:history:content":
							el.textContent = details.story;
							return;
						case "context:stake:content":
							el.textContent = details.health_stake;
							return;
						case "context:img:main":
							"src" in el && (el.src = details.image_main);
							return;
						case "context:img:glance":
							el.innerHTML = "";
							el.innerHTML = details.images_glance
								.map((src) => {
									return `<li><img src="${src}"/></li>`;
								})
								.join("");
							return;
					}
				});
		}
	};

	app.addEventListener("selection:changed", (e) => {
		if (!(e instanceof NodeSelectionEvent)) {
			return;
		}

		const node = e.selection;
		let className = "Node2D";

		if (node instanceof Pathology) {
			className = "Pathology";
		} else if (node instanceof Determinant) {
			className = "Determinant";
		} else if (node instanceof Facility) {
			className = "Facility";
		}

		if (node) {
			Collector.logEvent("selection_changed", { id: node.id, class: className });
		}

		if (undefined === node) {
			diagramChannel.postMessage({ type: "selectionChanged", data: { nodes: [] } });
			return;
		}

		const broadcastNodes: BroadcastDetermiant[] = app
			.getDiagram()
			.getActiveNodes()
			.determinants.map((det) => {
				return { label: det.label, id: det.id };
			});

		diagramChannel.postMessage({
			type: "selectionChanged",
			data: { nodes: broadcastNodes },
		});
	});

	app.onFeatureChanged = () => {
		const legendPrimary = document.querySelector<HTMLElement>("figure[data-legend=primary]");
		if (legendPrimary) {
			legendPrimary.style.display = App.feature("detailed-relations") ? "" : "none";
		}

		const legendSecondary = document.querySelector<HTMLElement>("figure[data-legend=secondary]");
		if (legendSecondary) {
			legendSecondary.style.display = App.feature("detailed-relations") ? "" : "none";
		}
	};

	app.onPreviewChanged = (node) => {
		if (!node) {
			return;
		}

		// Collector.logEvent("preview_changed", { id: node.id, class: node.constructor.name });
	};

	translator.dyn("general.no context", (txt) => {
		document.querySelectorAll<HTMLElement>("[data-tr='no-context']").forEach((el) => (el.innerHTML = txt));
	});

	const loadStartedAt = Date.now();

	await app.load((step, total, title) => updateLoader((step / total) * 100, title));

	ActionManager.register(
		new LanguageActionsHandler(app.getTranslator()),
		new BibliographyActionsHandler(app),
		new CreditsActionsHandler(),
		new ContextActionsHandler(app),
		new LexiconActionsHandler(),
		new ModeActionsHandler(app),
		new DemoActionsHandler(),
		new SystemActionsHandler(app),
	);

	ActionManager.init();

	console.info(`App loaded in: ${Date.now() - loadStartedAt} ms`);

	// @ts-expect-error
	const minLoadtimeMs = import.meta.env.DEV ? 0 : 3_000;
	const alreadyLoadedPercent = loaderPercent;
	const leftToLoadPercent = 100 - loaderPercent;

	// Fake loading to make sure it lasts at least a minimum amount of time
	// If the real loading takes more time more time than the minium, no fake
	// loading time is added
	while (Date.now() - loadStartedAt < minLoadtimeMs) {
		const loadTimeMs = Date.now() - loadStartedAt;
		const forceWaitMs = minLoadtimeMs - loadTimeMs;
		const delay = Math.min(Math.max(Math.random() * forceWaitMs, 350), 850);
		await wait(delay);
		updateLoader(Math.min(100, alreadyLoadedPercent + leftToLoadPercent * (loadTimeMs / minLoadtimeMs)), "");
	}

	updateLoader(100, "Ready");

	void app.launch();
	withLoader && (await wait(350));

	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();

	const colInPrim = domOrThrow<HTMLInputElement>("#colInPrim");
	const colInSec = domOrThrow<HTMLInputElement>("#colInSec");

	const evToCol = (e: Event) => {
		const target = e.target;
		if (!(target instanceof HTMLInputElement)) {
			throw new Error("Wrong element type");
		}

		const color = Color.fromHex(target.value);

		if (!color) {
			throw new Error("Invalid color");
		}

		return color;
	};

	colInPrim.value = colors.primary.toHex();
	colInPrim.addEventListener("click", (e) => e.stopPropagation())
	colInPrim.addEventListener("change", (e) => {
		e.stopPropagation();
		colors.upd("primary", evToCol(e));

		style.selected = new SVGStyle({ stroke: new Stroke({ width: 2, color: colors.primary }), opacity: 0.6 });
	});
	colInSec.value = colors.secondary.toHex();
	colInSec.addEventListener("click", (e) => e.stopPropagation())
	colInSec.addEventListener("change", (e) => {
		e.stopPropagation();
		colors.upd("secondary", evToCol(e));

		style.secondary = new SVGStyle({ stroke: new Stroke({ width: 2, color: colors.secondary }), opacity: 0.45 });
		style.selectedDeterminantMode = new SVGStyle({ stroke: new Stroke({ width: 2, color: colors.secondary, strokeDash: [6, 3] }) });
	});
}

void main();
