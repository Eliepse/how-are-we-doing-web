import { type TransitionClipConfig } from "./TransitionClip";
import { type Node2D } from "../../Node/Node2D";
import type { Vector } from "../../ValueObject/Vector";
import type { Angle } from "../../ValueObject/Angle";
import type { Opacity } from "../../ValueObject/Opacity";
import {
	interpolateAngle,
	interpolateOpacity,
	interpolatePosition,
	Interpolation,
	type TimingFn,
} from "../../Time/interpolations";
import type { Clipable } from "./Clipable";
import type { Tickable } from "../../Time/Tickable";

const PROP_NAMES = ["position", "rotation", "opacity"] as const;

type Keyframe = {
	position?: Vector;
	rotation?: Angle;
	opacity?: Opacity;
}

type Span<TProp extends keyof Keyframe = keyof Keyframe> = {
	startAt: number;
	// Single point
	endAt?: number;
	timing: TimingFn;
	value: [Keyframe[TProp], Keyframe[TProp]];
}

export class NodeClip implements Tickable, Clipable {
	private readonly spans: {
		position: Array<Span<"position">>,
		rotation: Array<Span<"rotation">>,
		opacity: Array<Span<"opacity">>,
	} = { position: [], rotation: [], opacity: [] };
	private readonly durationMs: number;

	constructor(
		private node: Node2D,
		keyframes: Record<number, Keyframe>,
		config?: Pick<TransitionClipConfig, "timingFunction">,
	) {
		const timeKeys = Object.keys(keyframes).map((k) => parseInt(k));
		this.durationMs = Math.max(...timeKeys);

		PROP_NAMES.forEach((propName) => {
			const positionTimeKeys = timeKeys.filter((timeKey) => keyframes[timeKey] && propName in keyframes[timeKey]);
			const timeKeysLength = positionTimeKeys.length;
			let i = 0;

			for (; i < timeKeysLength; i++) {
				const timeKey = positionTimeKeys[i];
				const keyframe = keyframes[timeKey ?? 0];

				if (undefined === timeKey || undefined === keyframe) {
					continue;
				}

				const lastSpan = this.spans[propName].slice(-1)[0];

				// Complete last span
				if (lastSpan) {
					lastSpan.endAt = timeKey;
					lastSpan.value[1] = keyframe[propName];
				}

				// Last keyframe
				if (timeKeysLength === i && timeKeysLength !== 1) {
					continue;
				}

				if (!(propName in keyframe)) {
					continue;
				}

				this.spans[propName].push({
					startAt: timeKey,
					timing: config?.timingFunction ?? Interpolation.linear,
					// @ts-expect-error: Unable to validate the "value" property
					value: [keyframe[propName], keyframe[propName]],
				} satisfies Span<typeof propName>);
			}
		});
	}

	applyEnd(): void {
		this.tick(0, this.durationMs, 0, 0, 0);
	}

	applyStart(): void {
		this.tick(0, 0, 0, 0, 0);
	}

	tick(_deltaTime: number, time: number, _timeUTC: number, _deltaTimeMs: number, _ticks: number) {
		PROP_NAMES.forEach((propName) => {
			const spans = this.spans[propName];
			let i = this.spans[propName].length - 1,
				span: Span | undefined;

			for (; i >= 0; i--) {
				const _span = spans[i];
				if (undefined !== _span && _span.startAt <= time) {
					span = _span;
					break;
				}
			}

			if (!span || !span.endAt) {
				return;
			}

			const spanProgress = (time - span.startAt) / (span.endAt - span.startAt);
			const progress = span.timing(spanProgress);

			switch (propName) {
				case "position":
					// @ts-expect-error
					this.node.setPosition(interpolatePosition(progress, span.value[0], span.value[1]));
					return;
				case "rotation":
					// @ts-expect-error
					this.node.setRotation(interpolateAngle(progress, span.value[0], span.value[1]));
					return;
				case "opacity":
					// @ts-expect-error
					this.node.setOpacity(interpolateOpacity(progress, span.value[0], span.value[1]));
					return;
			}
		});
	}

	getDuration(): number {
		return this.durationMs;
	}
}