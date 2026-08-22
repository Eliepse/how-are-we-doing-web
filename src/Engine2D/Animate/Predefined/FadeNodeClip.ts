import { NodeClip } from "../Clip/NodeClip";
import type { Node2D } from "../../Node/Node2D";
import { Opacity } from "../../ValueObject/Opacity";
import type { TransitionClipConfig } from "../Clip/TransitionClip";

type Options = {
	min?: Opacity;
	max?: Opacity;
	// Force the node to start at the given max/min instead of starting at the current opacity
	absolute?: boolean;
}

export class FadeNodeClip extends NodeClip {
	constructor(
		node: Node2D,
		direction: "in" | "out",
		durationMs: number,
		config?: Pick<TransitionClipConfig, "timingFunction"> & Options,
	) {
		const target = "in" === direction ? config?.max ?? Opacity.Opaque : config?.min ?? Opacity.Transparent;
		let origin = node.getOpacity().get();

		// Force transition to use min/max and not current opacity as start
		if (config?.absolute) {
			origin = "in" === direction ? (config?.min ?? Opacity.Transparent) : (config?.max ?? Opacity.Opaque);
		}

		super(node, { 0: { opacity: origin }, [durationMs]: { opacity: target }}, config);
	}
}