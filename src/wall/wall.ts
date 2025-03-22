import { pickRandom, shuffle, wait } from "../helpers";
import { pictures } from "../assets/pictures";
import type { Layout } from "./Layout";
import { layouts } from "./layouts";
import type { Context } from "../Diagram/Context";
import type { BroadcastDetermiant } from "../main";
import { Vector } from "../Engine2D/ValueObject/Vector";

type Picture = (typeof pictures)[number];

let activeLayout = selectRandomLayout();
let activeContext: Context | undefined = undefined;
let activeDeterminants: BroadcastDetermiant[] = [];

const wallDOM = document.querySelector<HTMLDivElement>("#wall");

if (null === wallDOM) {
	throw new Error("Wall not ready");
}

const channel = new BroadcastChannel("diagram");
channel.onmessage = (ev) => {
	const payload = ev.data;

	if ("contextChanged" === payload.type) {
		activeContext = payload.data.context;
	} else if ("selectionChanged" === payload.type) {
		activeDeterminants = payload.data.nodes;
	}

	const isMultiDeterminants = activeDeterminants.length > 1;
	const filteredPictures = findImages(activeContext, activeDeterminants);
	const shouldHandlePriority = false === isMultiDeterminants && filteredPictures.some((p) => p.priority > 0);
	activeLayout = selectRandomLayout(shouldHandlePriority);

	// Remove images
	wallDOM.innerHTML = "";

	const cells = activeLayout.cells.sort((a, b) => b.priority - a.priority); // Descending sort

	filteredPictures
		.sort((a, b) => b.priority - a.priority) // Descending sort
		.slice(0, activeLayout.cells.length)
		.forEach((picture, i) => {
			const cell = cells[i];

			if (undefined === cell) {
				return;
			}

			const startPosition = cell.position.add(Vector.One);
			const endPosition = startPosition.add(cell.size);

			const box = document.createElement("div");
			box.classList.add("box");
			box.style.gridColumnStart = startPosition.x.toFixed();
			box.style.gridColumnEnd = endPosition.x.toFixed();
			box.style.gridRowStart = startPosition.y.toFixed();
			box.style.gridRowEnd = endPosition.y.toFixed();

			const figure = document.createElement("figure");
			const img = document.createElement("img");
			img.src = `/image/wall/${picture.filename}`;
			figure.append(img);

			const legend = document.createElement("div");
			legend.textContent = picture.source;
			legend.classList.add("source");

			box.append(figure, legend);
			wallDOM.append(box);
		});
};

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

	await preloadImages((p) => updateLoader(p * 100, "Preloading images..."));

	updateLoader(100, "Ready");
	loaderDom.root && (loaderDom.root.style.opacity = "0");
	await wait(1000);
	loaderDom.root?.remove();
}

function selectRandomLayout(withPriorityCells = false): Layout {
	if (withPriorityCells) {
		return pickRandom(layouts.filter((layout) => 0 !== layout.withPriority(1).length));
	}

	return pickRandom(layouts);
}

function findImages(context: Context | undefined, determinants: BroadcastDetermiant[]): Picture[] {
	const isMultiDeterminants = determinants.length > 1;

	// To prevent duplicates
	const listedFilenames: string[] = [];

	// Pictures
	const priority: Picture[] = [];
	const other: Picture[] = [];

	for (const picture of pictures) {
		// Only maps has priority
		const isMap = picture.priority > 0;
		const isSelectedContext = picture.context === context?.id;

		// Filter maps when multiple determinants are activated
		if (isMap && isMultiDeterminants) {
			continue;
		}

		// For priority image, ALWAYS allow only context ones
		if (isMap && false === isSelectedContext) {
			continue;
		}

		// Filter out-of-context pictures
		if (false === context?.isDefault && false === isSelectedContext) {
			continue;
		}

		// Filter unconcerned pictures
		if (false === determinants.some((det) => det.label === picture.determinant)) {
			continue;
		}

		// Prevent duplicates
		if (listedFilenames.includes(picture.filename)) {
			continue;
		}

		// Passed all checks
		listedFilenames.push(picture.filename);

		if (picture.priority > 0) {
			priority.push(picture);
		} else {
			other.push(picture);
		}
	}

	// Simple reorder by priority (or if it's default context elements)
	return [...priority.sort((a, b) => a.priority - b.priority), ...shuffle(other)];
}

async function preloadImages(onUpdate: (progress: number) => void): Promise<void> {
	const count = pictures.length;

	for (let i = 0; i < count; i++) {
		const picture = pictures[i];

		if (undefined === picture) {
			continue;
		}

		const src = `/image/wall/${picture.filename}`;
		await preloadImage(src);
		const cursor = (i + 1);
		onUpdate(cursor / count);
		console.debug(`Loaded (${cursor}/${count}): ${src}`);
	}

	async function preloadImage(src: string): Promise<void> {
		const image = document.createElement("img");
		return new Promise((resolve, reject) => {
			image.onload = () => resolve();
			image.onabort = () => reject(src);
			image.onerror = () => reject(src);
			image.src = src;
		});
	}
}


void main().catch(console.debug);