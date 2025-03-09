import { App } from "./App";
import { wait } from "./helpers";
import type { Context } from "./Diagram/Context";

/*
	TODO list:
		- language selector + dynamic language
		- legend
		- image bento wall
		- optimize rendering (limit useless renders, opacity = 0, no movements)
 */

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

	app.onContextChanged = (context: Context) => {
		document.querySelectorAll("[data-key='context:name']").forEach((node) => {
			node.textContent = context.name;
		});
	};

	await app.load((step, total, title) => updateLoader((step / total) * 100, title));

	withLoader && await wait(500);
	updateLoader(100, "Ready");
	void app.launch();
	withLoader && await wait(350);

	setupBibliography(app);
	setupCredits();

	document.addEventListener("keydown", (e) => {
		if("ArrowLeft" === e.key) {
			app.previousContext();
		} else if("ArrowRight" === e.key) {
			app.nextContext();
		}
	});

	document.querySelectorAll("[data-action='context:prev']")?.forEach((n) => {
		n.addEventListener("click", () => app.previousContext());
	});

	document.querySelectorAll("[data-action='context:next']")?.forEach((n) => {
		n.addEventListener("click", () => app.nextContext());
	});

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

void main(false);
