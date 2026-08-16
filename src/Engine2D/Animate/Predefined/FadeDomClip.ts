import { TransitionClip, type TransitionClipConfig } from "../Clip/TransitionClip";
import { interpolate } from "../../../helpers";

type Options = {
	min?: number;
	max?: number;
}

const DUMMY_FN = () => undefined;

export class FadeDomClip extends TransitionClip {
	constructor(
		dom: HTMLElement | string | null | undefined,
		direction: "in" | "out",
		durationMs: number,
		config?: TransitionClipConfig & Options,
	) {
		const min = config?.min ?? 0;
		const max = config?.max ?? 1;
		const node = typeof dom === "string" ? document.querySelector<HTMLElement>(dom) : dom;

		super(
			node ? (progress) => node.style.opacity = interpolate(min, max, progress).toFixed(2) : DUMMY_FN,
			durationMs,
			{ ...config, inverted: "in" !== direction },
		);
	}
}