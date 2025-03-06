import { App } from "./App";
import { wait } from "./helpers";

/*
	TODO list:
		- credits
		- pathologies background decorations
		- language selector + dynamic language
		- context selection
		- context blur when N/A
		- legend
		- image bento wall
		- fix ring detection near PI = 0
 */

async function main() {
	function updateLoader(percent: number, title: string): void {
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

	await app.load((step, total, title) => updateLoader((step / total) * 100, title));

	await wait(500);
	updateLoader(100, "Ready");
	void app.launch();
	await wait(350);

	setupBibliography(app);
	setupCredits();

	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();
}

function setupBibliography(app: App): void {
	const translator = app.getTranslator();
	const dom = document.querySelector<HTMLButtonElement>("#biblioToggle");

	if (null === dom) {
		throw new Error("Bibliography DOM missing");
	}

	dom.innerText = translator.t("general.show_bibliography");

	dom.addEventListener("click", (e) => {
		const btn = e.target as HTMLButtonElement;
		e.stopPropagation();

		if ("true" === btn.ariaPressed) {
			app.hideBibliography();
			btn.ariaPressed = "false";
			btn.innerText = translator.t("general.show_bibliography");
			return;
		}

		app.showBibliography();
		btn.ariaPressed = "true";
		btn.innerText = translator.t("general.hide_bibliography");
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

void main();
