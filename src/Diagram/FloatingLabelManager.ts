import { Vector } from "../Engine2D/ValueObject/Vector";
import type { Translator } from "./Translation/Translator";
import type { IntlStr } from "./Translation/IntlStr";

export class FloatingLabelManager {
	private _labels = new Map<string, HTMLElement>();
	private _labelsTranslations = new Map<string, IntlStr>();

	constructor(
		private container: HTMLElement,
		private translator: Translator,
	) {
	}

	show(
		key: string,
		text: string,
		position: Vector,
		placement: "top" | "right" | "bottom" | "left" = "top",
		margin = 8,
		color: "white" | "secondary" = "white",
	): void {
		let dom = this._labels.get(key);
		let dynText = this._labelsTranslations.get(key);

		if (undefined === dom) {
			dom = document.createElement("div");
			dom.classList.add("floatingLabel");
			dom.dataset.id = key;
			this._labels.set(key, dom);
			this.container.append(dom);
		}

		dynText?.disconnect();
		dynText = this.translator.dyn(`nodes.${text}`, (txt) => dom.textContent = txt);
		this._labelsTranslations.set(key, dynText);

		dom.textContent = dynText.toString();
		dom.style.display = "";
		const bbox = dom.getBoundingClientRect();
		const boxSize = new Vector(bbox.width, bbox.height);
		let offset = boxSize.mul(new Vector(-0.5, -1)).add(new Vector(0, -margin));

		switch (placement) {
			case "bottom":
				offset = boxSize.mul(new Vector(-0.5, 0)).add(new Vector(0, margin));
				break;
			case "left":
				offset = boxSize.mul(new Vector(-1, -0.5)).add(new Vector(-margin, 0));
				break;
			case "right":
				offset = boxSize.mul(new Vector(0, -0.5)).add(new Vector(margin, 0));
		}

		const containerBBox = this.container.getBoundingClientRect();
		const centerAsAbsolute = new Vector(containerBBox.width, containerBBox.height)
			.div(2)
			.add(new Vector(containerBBox.x, containerBBox.y));

		const relativeToCenter = position
			.sub(centerAsAbsolute)
			.add(offset)
			.toAttributes();

		// Relative to center, to prevent shift with diagram on bibliography show/hide
		dom.style.left = "50%";
		dom.style.top = "50%";
		dom.style.transform = `translate(${relativeToCenter.x}px, ${relativeToCenter.y}px)`;

		dom.classList.remove("white", "secondary");
		dom.classList.add(color);
	}

	hide(key: string): void {
		const dom = this._labels.get(key);

		if (undefined === dom) {
			return;
		}

		dom.style.display = "none";
	}
}
