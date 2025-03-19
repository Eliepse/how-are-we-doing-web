import { App } from "./App";
import { wait } from "./helpers";
import type { Context } from "./Diagram/Context";

/*
	TODO list:
		- legend
		- image bento wall
 */

export type BroadcastDetermiant = { label: string, id: number };
const diagramChannel = new BroadcastChannel("diagram");

async function main(withLoader = true) {
	function updateLoader(percent: number, title: string): void {
		if (false === withLoader) {
			return;
		}

		if (!loaderDom.loadingBar || !loaderDom.loadingCounter || !loaderDom.loadingTitle) {
			return;
		}

		loaderDom.loadingBar.style.width = `${percent.toFixed(2)}%`;
		loaderDom.loadingCounter.innerText = `${Math.round(percent)} %`;
		loaderDom.loadingTitle.innerText = title;
	}

	const loaderDom = {
		root: document.querySelector<HTMLDivElement>("#loader"),
		loadingBar: document.querySelector<HTMLDivElement>(".loader__progressBar div"),
		loadingCounter: document.querySelector<HTMLDivElement>(".loader__progressCounter"),
		loadingTitle: document.querySelector<HTMLDivElement>(".loader__title"),
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

	const app = new App(appDom, diagramDom);
	const translator = app.getTranslator();

	translator.translateDOM(document.querySelector<HTMLElement>("#navigation"));
	translator.translateDOM(document.querySelector<HTMLElement>("#credits"));
	translator.translateDOM(document.querySelector<HTMLElement>(".legend"));

	app.onContextChanged = (context: Context) => {
		document.querySelectorAll<HTMLElement>("[data-key='context:name']").forEach((node) => {
			node.textContent = translator.translate(context.name.toLowerCase(), "general").toUpperCase();
			node.dataset.tr = context.id;
		});

		diagramChannel.postMessage({ type: "contextChanged", data: { context } });
	};

	app.onSelectionChanged = (node) => {
		if (undefined === node) {
			diagramChannel.postMessage({ type: "selectionChanged", data: { nodes: [] } });
			return;
		}

		const broadcastNodes: BroadcastDetermiant[] = app.getDiagram().getActiveNodes().determinants.map((det) => {
			return { label: det.label, id: det.id };
		});

		diagramChannel.postMessage({ type: "selectionChanged", data: { nodes: broadcastNodes } });
	};

	translator.dyn("general.no context", (txt) => {
		document.querySelectorAll<HTMLElement>("[data-tr='no-context']").forEach((el) => el.innerHTML = txt);
	});

	await app.load((step, total, title) => updateLoader((step / total) * 100, title));

	withLoader && await wait(500);
	updateLoader(100, "Ready");
	void app.launch();
	withLoader && await wait(350);

	setupLanguageControls(app);
	setupBibliography(app);
	setupCredits();
	setupContextControls(app);

	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();
}

function setupLanguageControls(app: App): void {
	const translator = app.getTranslator();
	document.querySelectorAll<HTMLElement>("button[data-action='locale:change']").forEach((node) => {
		node.addEventListener("click", (e) => {
			e.stopPropagation();
			node.dataset.locale && translator.changeLocale(node.dataset.locale);
		});
	});
}

function setupBibliography(app: App): void {
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

	dom.addEventListener("click", (e) => {
		e.stopPropagation();

		if ("true" === dom.ariaPressed) {
			app.hideBibliography();
			dom.ariaPressed = "false";
			dom.innerText = textShow.toString();
			return;
		}

		app.showBibliography();
		dom.ariaPressed = "true";
		dom.innerText = textHide.toString();
	});
}

function setupCredits(): void {
	const dom = document.querySelector("#credits");

	if (null === dom) {
		return;
	}

	dom.addEventListener("click", (e) => {
		dom.ariaHidden = "true";
		e.stopPropagation();
	});
	dom.addEventListener("mousemove", (e) => e.stopPropagation());

	dom.querySelector(".credit-modal")?.addEventListener("click", (e) => e.stopPropagation());

	document.querySelectorAll("button[data-action='credits:open']").forEach((btn) => {
		btn.addEventListener("click", () => dom.ariaHidden = "false");
	});

	document.querySelectorAll("button[data-action='credits:close']").forEach((btn) => {
		btn.addEventListener("click", () => dom.ariaHidden = "true");
	});
}

function setupContextControls(app: App): void {
	const translator = app.getTranslator();

	document.addEventListener("keydown", (e) => {
		if ("ArrowLeft" === e.key) {
			app.previousContext();
		} else if ("ArrowRight" === e.key) {
			app.nextContext();
		}
	});

	document.querySelectorAll("[data-action='context:prev']")?.forEach((n) => {
		n.addEventListener("click", () => app.previousContext());
	});

	document.querySelectorAll("[data-action='context:next']")?.forEach((n) => {
		n.addEventListener("click", () => app.nextContext());
	});
}

void main();