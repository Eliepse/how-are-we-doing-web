import type { Composition } from "./Composition";

export class YieldComposition implements Composition {
	onstarted: () => void = () => undefined;
	onended: () => void = () => undefined;

	constructor(
		private readonly action: () => Promise<void>,
	) {
	}

	trigger(clb: () => void) {
		this.action().then(() => {
			this.onended();
			clb();
		});
		this.onstarted();
	}
}