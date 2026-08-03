import { App } from "./App";
import type { Context } from "./Diagram/Context";
import { wait } from "./helpers";
import { Collector } from "./Telemetry/Collector";

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

	app.onContextChanged = (context: Context) => {
		document.querySelectorAll<HTMLElement>("[data-key='context:name']").forEach((node) => {
			node.textContent = translator
				.translate(context.name.toLowerCase(), "general")
				.toUpperCase();
			node.dataset.tr = context.id;
		});

		diagramChannel.postMessage({ type: "contextChanged", data: { context } });
		collector.logEvent("context_changed", { id: context.id, name: context.name });

		const legendBlurred = document.querySelector<HTMLElement>("figure[data-legend=blurred]");
		if (legendBlurred) {
			legendBlurred.style.display = context.isDefault ? "none" : "";
		}

		const legendDefault = document.querySelector<HTMLElement>("figure[data-legend=default]");
		if (legendDefault) {
			legendDefault.style.display = context.isDefault ? "none" : "";
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
	console.info(`App loaded in: ${Date.now() - loadStartedAt} ms`);

	// @ts-expect-error
	const minLoadtimeMs = import.meta.env.DEV ? 0 : 5_000;
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

	setupLanguageControls(app, collector);
	setupBibliography(app, collector);
	setupCredits(collector);
	setupContextControls(app);
	setupTabs(collector);

	// Toggle the interface visibility
	document.addEventListener("keydown", (e) => {
		const nav = document.querySelector<HTMLElement>("#navigation");
		const legend = document.querySelector<HTMLElement>("#legendRoot");

		if ("i" === e.key && nav && legend) {
			nav.style.display = nav.style.display.trim() ? "" : "none";
			legend.style.display = legend.style.display.trim() ? "" : "none";
			return;
		}

		if ("d" === e.key) {
			app.setDebug(!app.debug);
			return;
		}
	});

	document.querySelectorAll<HTMLElement>("[data-action='mode:change']").forEach((el) => {
		el.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			e.preventDefault();

			const mode = el.dataset.mode as "focus" | "detailled" | "basic";

			if (!el.classList.contains("active")) {
				collector.logEvent("mode_changed", { mode });
			}

			app.changeMode(mode);


			const legendDefault = document.querySelector<HTMLDivElement>("#legendRoot[data-legend=default]");
			const legendFocus = document.querySelector<HTMLDivElement>("#legendRoot[data-legend=focus]");

			if (!legendFocus || !legendDefault) {
				return;
			}

			// @ts-ignore
			if ("focus" === el.dataset.mode) {
				legendDefault.style.display = "none";
				legendFocus.style.display = "";
			} else {
				legendDefault.style.display = "";
				legendFocus.style.display = "none";
			}
		});
	});

	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();
}

function setupLanguageControls(app: App, collector: Collector): void {
	const translator = app.getTranslator();

	function updateLocalDisplay() {
		const currentLocale = translator.currentLocale;

		document.querySelectorAll<HTMLElement>("[data-lang-show]").forEach((element) => {
			element.style.display = element.dataset.langShow === currentLocale ? "" : "none";
		});

		document.querySelectorAll<HTMLElement>("[data-locale-current]").forEach((element) => {
			element.textContent = currentLocale;
		});
	}

	document
		.querySelectorAll<HTMLElement>("button[data-action='locale:change']")
		.forEach((node) => {
			node.addEventListener("mousedown", (e) => {
				e.stopPropagation();

				const locale = node.dataset.locale;

				if (!locale) {
					return;
				}

				collector.logEvent("locale_changed", { locale });
				void translator.changeLocale(locale);
				updateLocalDisplay();
			});
		});

	document
		.querySelectorAll<HTMLElement>("button[data-action='locale:toggle']")
		.forEach((node) => {
			node.addEventListener("mousedown", (e) => {
				e.stopPropagation();

				const currentIndex = translator.supportedLocales.indexOf(translator.currentLocale);
				const newIndex = (currentIndex + 1) % translator.supportedLocales.length;
				const newLocale = translator.supportedLocales[newIndex];

				if (!newLocale) {
					console.error("Unable to toggle the locale");
					return;
				}

				collector.logEvent("locale_changed", { locale: newLocale });
				void translator.changeLocale(newLocale);
				updateLocalDisplay();
			});
		});
}

function setupBibliography(app: App, collector: Collector): void {
	const translator = app.getTranslator();
	const dom = document.querySelector<HTMLButtonElement>("#biblioToggle");

	if (null === dom) {
		throw new Error("Bibliography DOM missing");
	}

	const textShow = translator.dyn(
		"general.show_bibliography",
		(txt) => "true" === dom.ariaPressed && (dom.innerText = txt),
	);

	const textHide = translator.dyn(
		"general.hide_bibliography",
		(txt) => "true" !== dom.ariaPressed && (dom.innerText = txt),
	);

	dom.innerText = textShow.toString();

	dom.addEventListener("mousedown", (e) => {
		e.stopPropagation();

		if ("true" === dom.ariaPressed) {
			app.hideBibliography();
			collector.logEvent("biblio_opened");

			dom.ariaPressed = "false";
			dom.innerText = textShow.toString();
			return;
		}

		app.showBibliography();
		collector.logEvent("biblio_closed");
		dom.ariaPressed = "true";
		dom.innerText = textHide.toString();
	});
}

function setupCredits(collector: Collector): void {
	const dom = document.querySelector<HTMLElement>("#credits");

	if (null === dom) {
		return;
	}

	dom.addEventListener("mousedown", (e) => {
		dom.ariaHidden = "true";
		e.stopPropagation();
	});
	dom.addEventListener("mousemove", (e) => e.stopPropagation());

	dom.querySelector(".credit-modal")?.addEventListener("mousedown", (e) => e.stopPropagation());

	document.querySelectorAll("button[data-action='credits:open']").forEach((btn) => {
		btn.addEventListener("mousedown", (e) => {
			collector.logEvent("credits_opened");
			e.stopPropagation();
			dom.ariaHidden = "false";
			dom.style.display = "";
		});
	});

	document.querySelectorAll("button[data-action='credits:close']").forEach((btn) => {
		btn.addEventListener("mousedown", (e) => {
			collector.logEvent("credits_closed");
			e.stopPropagation();
			dom.ariaHidden = "true";
			dom.style.display = "none";
		});
	});
}

function setupContextControls(app: App): void {
	document.addEventListener("keydown", (e) => {
		if ("ArrowLeft" === e.key) {
			app.previousContext();
		} else if ("ArrowRight" === e.key) {
			app.nextContext();
		}
	});

	document.querySelectorAll("[data-action='context:prev']")?.forEach((n) => {
		n.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			app.previousContext();
		});
	});

	document.querySelectorAll("[data-action='context:next']")?.forEach((n) => {
		n.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			app.nextContext();
		});
	});
}

function setupTabs(collector: Collector): void {
	const lexiconDom = document.querySelector<HTMLElement>("#lexicon");

	if (!lexiconDom) {
		return;
	}

	document.querySelectorAll("button[data-action='lexicon:open']").forEach((btn) => {
		btn.addEventListener("mousedown", (e) => {
			collector.logEvent("lexicon_closed");
			e.stopPropagation();
			lexiconDom.ariaHidden = "false";
			lexiconDom.style.display = "";
		});
	});

	document.querySelectorAll("button[data-action='lexicon:close']").forEach((btn) => {
		btn.addEventListener("mousedown", (e) => {
			collector.logEvent("lexicon_closed");
			e.stopPropagation();
			lexiconDom.ariaHidden = "true";
			lexiconDom.style.display = "none";
		});
	});

	const tabsMap = new Map<string, Map<string, HTMLElement>>();
	const tabsButtons = new Set<HTMLElement>(document.querySelectorAll<HTMLElement>("[data-toggle-tab]"));

	document.querySelectorAll<HTMLElement>("[data-tab]").forEach((el) => {
		const key = el.dataset.tab ?? "";
		const prefix = key.split(":")[0];

		if (!key || !prefix) {
			return;
		}

		const map = tabsMap.get(prefix) ?? new Map<string, HTMLElement>();
		map.set(key, el);
		tabsMap.set(prefix, map);
	});

	for (const button of tabsButtons) {
		button.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			e.preventDefault();

			const key = button.dataset.toggleTab;
			const prefix = key?.split(":")[0];

			if (!key || !prefix) {
				return;
			}


			for (const item of tabsButtons) {
				item.dataset.tabActive = button === item ? "true" : "false";
			}

			const map = tabsMap.get(prefix) ?? new Map<string, HTMLElement>();
			for (const [targetKey, target] of map.entries()) {
				target.style.display = key === targetKey ? "" : "none";
			}
		});
	}
}

void main();
