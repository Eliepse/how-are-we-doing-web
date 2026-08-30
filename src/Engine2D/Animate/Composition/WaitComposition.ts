import { YieldComposition } from "./YieldComposition";

export class WaitComposition extends YieldComposition {
	constructor(
		durationMs: number,
	) {
		super(() => new Promise<void>((r) => setTimeout(r, durationMs)));
	}
}