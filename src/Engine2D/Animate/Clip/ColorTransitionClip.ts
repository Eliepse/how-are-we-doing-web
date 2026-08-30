import { TransitionClip, type TransitionClipConfig } from "./TransitionClip";
import type { Color } from "../../ValueObject/Color";
import { interpolateColor } from "../../Time/interpolations";

type ProcessClb = (progress: Color) => void;

export class ColorTransitionClip extends TransitionClip {
	constructor(
		processClb: ProcessClb,
		private readonly from: Color,
		private readonly to: Color,
		durationMs: number,
		config?: TransitionClipConfig,
	) {
		super((p) => processClb(interpolateColor(p, from, to)), durationMs, config);
	}
}
