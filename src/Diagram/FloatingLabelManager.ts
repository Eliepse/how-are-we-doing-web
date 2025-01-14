import { Vector } from "../Engine2D/Vector";

export class FloatingLabelManager {
	private _labels = new Map<string, HTMLElement>();

	constructor(private _container: HTMLElement) {}

	show(
		key: string,
		text: string,
		position: Vector,
		placement: "top" | "right" | "bottom" | "left" = "top",
		margin = 8,
	): void {
		let dom = this._labels.get(key);

		if (undefined === dom) {
			dom = document.createElement("div");
			dom.classList.add("floatingLabel");
			this._labels.set(key, dom);
			this._container.append(dom);
		}

		dom.textContent = text;
		dom.style.display = "";
		const bbox = dom.getBoundingClientRect();
		const centerOffset = new Vector(bbox.width, bbox.height);
		let offset = centerOffset.mul(new Vector(0.5, 1)).add(new Vector(0, margin));

		switch (placement) {
			case "bottom":
				offset = centerOffset.mul(new Vector(0.5, 0)).add(new Vector(0, -margin));
				break;
			case "left":
				offset = centerOffset.mul(new Vector(-1, 0.5)).add(new Vector(-margin, 0));
			case "right":
				offset = centerOffset.mul(new Vector(1, 0.5)).add(new Vector(margin, 0));
		}

		const xy = position.sub(offset).toAttributes();
		dom.style.transform = `translate(${xy.x}px, ${xy.y}px)`;
	}

	hide(key: string): void {
		const dom = this._labels.get(key);

		if (undefined === dom) {
			return;
		}

		dom.style.display = "none";
	}
}
