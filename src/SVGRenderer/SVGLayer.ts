import { SVGShape } from "./Shape/SVGShape";

export class SVGLayer {
	public readonly dom: SVGGElement;

	constructor() {
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "g");
	}

	addToLayer(element: SVGShape | SVGElement): void {
		if (element instanceof SVGShape) {
			element.mount(this.dom);
			return;
		}

		this.dom.append(element);
	}
}