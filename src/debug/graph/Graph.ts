import type { GraphData } from "./GraphData";

export class Graph {
	constructor(private readonly dom: HTMLElement, public readonly data: GraphData) {
		dom.classList.add("graph");
		dom.style.height = "2em";
		const width = 100 / this.data.size;

		for (let i = 0; i < this.data.size; i++) {
			const segment = document.createElement("span");
			segment.style.display = "inline-block";
			segment.style.position = "absolute";
			segment.style.left = (width * i).toFixed(3) + "%";
			segment.style.bottom = "0";
			segment.style.background = "#fff";
			segment.style.width = width.toFixed(3) + "%";
			dom.append(segment);
		}
	}

	render() {
		const values = this.data.getValues();
		const max = Math.max(...values);
		values.forEach((value, i) => {
			const segment = this.dom.childNodes.item(i) as HTMLElement;
			segment.style.height = ((value / max) * 100).toFixed(1) + "%";
		});
	}
}