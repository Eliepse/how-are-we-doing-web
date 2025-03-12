import { wait } from "../helpers";

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

	updateLoader(100, "Ready");
	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();
}

void main();
