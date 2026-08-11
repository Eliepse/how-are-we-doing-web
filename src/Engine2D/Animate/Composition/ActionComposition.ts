import type { Composition } from "./Composition";

export class ActionComposition implements Composition {
	onstarted: () => void = () => undefined;
	onended: () => void = () => undefined;

	constructor(
		private readonly action: () => void,
	) {
	}

	trigger(clb: () => void) {
		this.onstarted();
		this.action();
		this.onended();
		clb();
	}
}