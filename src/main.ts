import { App } from "./App";
import type { Context } from "./Diagram/Context";
import { wait } from "./helpers";
import { Collector } from "./Telemetry/Collector";
import { ActionManager } from "./Actions/ActionManager";
import { CreditsActionsHandler } from "./Actions/CreditsActionsHandler";
import { BibliographyActionsHandler } from "./Actions/BibliographyActionsHandler";
import { LanguageActionsHandler } from "./Actions/LanguageActionsHandler";
import { ContextActionsHandler } from "./Actions/ContextActionsHandler";
import { LexiconActionsHandler } from "./Actions/LexiconActionsHandler";
import { ModeActionsHandler } from "./Actions/ModeActionsHandler";
import { SystemActionsHandler } from "./Actions/SystemActionsHandler";

// @ts-expect-error
import "/styles/styles.css";
// @ts-expect-error
import "/styles/app.css";

export type BroadcastDetermiant = { label: string, id: number };
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
	const collector = new Collector();
	await collector.init();

	// @ts-ignore
	window.app = app;
	const translator = app.getTranslator();

	translator.translateDOM(document.querySelector<HTMLElement>("#navigation"));
	translator.translateDOM(document.querySelector<HTMLElement>("#credits"));
	translator.translateDOM(document.querySelector<HTMLElement>("#legendRoot"));

	const ctxDetailsModal = document.querySelector<HTMLElement>("#context-details");
	const openCtxActionBtns = document.querySelectorAll<HTMLButtonElement>("button[data-action='context:open']");

	document.querySelectorAll<HTMLButtonElement>("button[data-action='context:close']")
		.forEach((btn) => btn.addEventListener("mousedown", () => {
			if (btn.disabled || !ctxDetailsModal) {
				return;
			}

			ctxDetailsModal.ariaHidden = "true";
			ctxDetailsModal.style.display = "none";
		}));
	openCtxActionBtns.forEach((btn) => btn.addEventListener("mousedown", () => {
		if (btn.disabled || !ctxDetailsModal) {
			return;
		}

		ctxDetailsModal.ariaHidden = "false";
		ctxDetailsModal.style.display = "";
	}));

	app.onContextChanged = (context: Context) => {
		// Update display
		document.querySelectorAll<HTMLElement>("[data-key='context:name']").forEach((node) => {
			node.textContent = translator
				.translate(context.name.toLowerCase(), "general")
				.toUpperCase();
			node.dataset.tr = context.id;
		});

		// Telemetry
		diagramChannel.postMessage({ type: "contextChanged", data: { context } });
		collector.logEvent("context_changed", { id: context.id, name: context.name });

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
		openCtxActionBtns.forEach((btn) => btn.disabled = !details);

		if (!details && ctxDetailsModal) {
			ctxDetailsModal.ariaHidden = "true";
			ctxDetailsModal.style.display = "none";
		}

		if (details) {
			document.querySelectorAll<HTMLElement | HTMLImageElement>("#context-details [data-key^='context:']")
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
							el.innerHTML = details.images_glance.map((src) => {
								return `<li><img src="${src}"/></li>`;
							}).join("");
							return;
					}
				});
		}
	};

	app.onSelectionChanged = (node) => {
		if (node) {
			collector.logEvent("selection_changed", { id: node.id, class: node.constructor.name });
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
	};

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

		// collector.logEvent("preview_changed", { id: node.id, class: node.constructor.name });
	};

	translator.dyn("general.no context", (txt) => {
		document
			.querySelectorAll<HTMLElement>("[data-tr='no-context']")
			.forEach((el) => (el.innerHTML = txt));
	});

	const loadStartedAt = Date.now();

	await app.load((step, total, title) => updateLoader((step / total) * 100, title));

	ActionManager.register(
		new LanguageActionsHandler(app.getTranslator(), collector),
		new BibliographyActionsHandler(app, collector),
		new CreditsActionsHandler(collector),
		new ContextActionsHandler(app),
		new LexiconActionsHandler(collector),
		new ModeActionsHandler(app, collector),
		new SystemActionsHandler(app),
	);

	ActionManager.init();

	console.info(`App loaded in: ${Date.now() - loadStartedAt} ms`);

	// @ts-expect-error
	const minLoadtimeMs = import.meta.env.DEV ? 0 : 3_000;
	const alreadyLoadedPercent = loaderPercent;
	const leftToLoadPercent = 100 - loaderPercent;

	while (Date.now() - loadStartedAt < minLoadtimeMs) {
		const loadTimeMs = Date.now() - loadStartedAt;
		const forceWaitMs = minLoadtimeMs - loadTimeMs;
		const delay = Math.min(Math.max(Math.random() * forceWaitMs, 350), 850);
		await wait(delay);
		updateLoader(Math.min(100, alreadyLoadedPercent + (leftToLoadPercent * (loadTimeMs / minLoadtimeMs))), "");
	}

	updateLoader(100, "Ready");

	void app.launch();
	withLoader && (await wait(350));

	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();
}

void main();
