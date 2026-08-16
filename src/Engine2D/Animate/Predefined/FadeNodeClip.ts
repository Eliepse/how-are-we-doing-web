import { NodeClip } from "../Clip/NodeClip";
import type { Node2D } from "../../Node/Node2D";
import { Opacity } from "../../ValueObject/Opacity";
import type { TransitionClipConfig } from "../Clip/TransitionClip";

type Options = {
	min?: Opacity;
	max?: Opacity;
}

export class FadeNodeClip extends NodeClip {
	constructor(
		node: Node2D,
		direction: "in" | "out",
		durationMs: number,
		config?: Pick<TransitionClipConfig, "timingFunction"> & Options,
	) {
		const min = config?.min ?? Opacity.Transparent;
		const max = config?.max ?? Opacity.Opaque;

		super(
			node,
			{
				0: { opacity: "in" === direction ? min : max },
				[durationMs]: { opacity: "in" === direction ? max : min },
			},
			config,
		);
	}
}