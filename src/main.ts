import { App } from "./App";
import { wait } from "./helpers";

const appDom = document.querySelector("#app");

if (null === appDom) {
	throw new Error("App DOM missing");
}

const loaderDom = {
	root: document.querySelector<HTMLDivElement>("#loader"),
	loadingBar: document.querySelector<HTMLDivElement>(".loader__progressBar div"),
	loadingCounter: document.querySelector<HTMLDivElement>(".loader__progressCounter"),
	loadingTitle: document.querySelector<HTMLDivElement>(".loader__title"),
};

function updateLoader(percent: number, title: string): void {
	if (!loaderDom.loadingBar || !loaderDom.loadingCounter || !loaderDom.loadingTitle) {
		return;
	}

	loaderDom.loadingBar.style.width = `${percent.toFixed(2)}%`;
	loaderDom.loadingCounter.innerText = `${Math.round(percent)} %`;
	loaderDom.loadingTitle.innerText = title;
}

const app = new App(appDom);

await app.load((step, total, title) => updateLoader((step / total) * 100, title));

await wait(500);
updateLoader(100, "Ready");

void app.launch();

await wait(350);

loaderDom.root && (loaderDom.root.style.opacity = "0");

await wait(1000);

loaderDom.root?.remove();


