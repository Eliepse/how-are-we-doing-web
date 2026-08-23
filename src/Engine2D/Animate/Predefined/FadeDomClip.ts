import { TransitionClip, type TransitionClipConfig } from "../Clip/TransitionClip";
import { interpolate } from "../../../helpers";

type Options = {
	min?: number;
	max?: number;
	// Force the node to start at the given max/min instead of starting at the current opacity
	absolute?: boolean;
}

const DUMMY_FN = () => undefined;

export class FadeDomClip extends TransitionClip {
	constructor(
		dom: HTMLElement | string | null | undefined,
		direction: "in" | "out",
		durationMs: number,
		config?: TransitionClipConfig & Options,
	) {
		const node = typeof dom === "string" ? document.querySelector<HTMLElement>(dom) : dom;

		const target = "in" === direction ? (config?.max ?? 1) : (config?.min ?? 0);
		let origin = "in" === direction ? (config?.min ?? 0) : (config?.max ?? 1);

		// Force transition to use min/max and not current opacity as start
		if (config?.absolute) {
			origin = "in" === direction ? (config?.min ?? 0) : (config?.max ?? 1);
		} else if (node && node.style.opacity) {
			// Get current opacity from node
			// TODO(elie): doesn't work because it's calculated when instanciating, not when
			//  		   the transition actually starts (the value differ between those states)
			// origin = parseFloat(node.style.opacity);
		}

		super(
			node ? (progress) => node.style.opacity = interpolate(origin, target, progress).toFixed(2) : DUMMY_FN,
			durationMs,
			config,
		);
	}
}