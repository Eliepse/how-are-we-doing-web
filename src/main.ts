import { App } from "./App";
import { wait } from "./helpers";

/*
	TODO list:
		- biblio toggle
		- fix SVGRender global <-> local conversion
		- credits
		- language selector + dynamic language
		- context selection
		- context blur when N/A
		- legend
		- image bento wall
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

	const appDom = document.querySelector("#app");
	const diagramDom = document.querySelector("#diagramRoot");
	const bibliographyToggle = document.querySelector<HTMLButtonElement>("#biblioToggle");

	if (null === appDom) {
		throw new Error("App DOM missing");
	}

	if (null === diagramDom) {
		throw new Error("Diagram DOM missing");
	}

	if (null === bibliographyToggle) {
		throw new Error("Bibliography DOM missing");
	}

	const app = new App(appDom, diagramDom);
	const translator = app.getTranslator();
	await app.load((step, total, title) => updateLoader((step / total) * 100, title));
	await wait(500);
	updateLoader(100, "Ready");
	void app.launch();
	await wait(350);
	bibliographyToggle.innerText = translator.t("general.show_bibliography");
	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();

	bibliographyToggle.addEventListener("click", (e) => {
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

void main();
