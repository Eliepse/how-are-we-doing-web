import type { Composition } from "./Composition";

export class YieldComposition implements Composition {
	onstarted: () => void = () => undefined;
	onended: () => void = () => undefined;

	constructor(
		private readonly action: () => Promise<void>,
	) {
	}

	trigger(clb: () => void, signal?: AbortSignal) {
		const cancel = () => clb();
		signal?.addEventListener("abort", cancel);

		this.action().finally(() => {
			signal?.removeEventListener("abort", cancel);

			if (signal?.aborted) {
				return;
			}

			this.onended();
			clb();
		});

		this.onstarted();
	}
}