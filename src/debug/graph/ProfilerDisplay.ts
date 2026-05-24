import { Clock } from "../../Engine2D/Time/Clock";
import { Graph } from "./Graph";
import { GraphData } from "./GraphData";

export class ProfilerDisplay {
	private clock: Clock;
	private stats = new Map<string, Graph>();

	constructor(private dom: HTMLElement, private readonly retentionSec: number, private readonly fps: number) {
		this.dom.style.display = "none";
		this.clock = new Clock(this.fps, () => this.render());

	}

	stageStatValue(key: string, value: number) {
		if (false === this.stats.has(key)) {
			const statDom = document.createElement("div");
			this.stats.set(key, new Graph(statDom, new GraphData(this.retentionSec * this.fps)));
			this.dom.append(statDom);
		}

		this.stats.get(key)?.data?.stage(value);
	}

	private render() {
		this.stats.forEach((graph) => {
			graph.data.commit();
			graph.render();
		});
	}

	show() {
		this.dom.style.display = "";
		this.clock.start();
	}

	hide() {
		this.dom.style.display = "none";
		this.clock.pause();
	}
}