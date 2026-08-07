import { Sequence, type SequenceConfig } from "./Sequence";
import { type Node2D } from "../Node/Node2D";
import type { Vector } from "../ValueObject/Vector";
import type { Angle } from "../ValueObject/Angle";
import type { Opacity } from "../ValueObject/Opacity";
import {
	interpolateAngle,
	interpolateOpacity,
	interpolatePosition,
	Interpolation,
	type TimingFn,
} from "../Time/interpolations";

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

const DUMMY_FN = () => undefined;

export class NodeSequence extends Sequence {
	private readonly spans: {
		position: Array<Span<"position">>,
		rotation: Array<Span<"rotation">>,
		opacity: Array<Span<"opacity">>,
	} = { position: [], rotation: [], opacity: [] };

	constructor(
		private node: Node2D,
		keyframes: Record<number, Keyframe>,
		config?: SequenceConfig,
	) {
		const timeKeys = Object.keys(keyframes).map((k) => parseInt(k));
		super(DUMMY_FN, Math.max(...timeKeys), config);

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


	override tick(_deltaTime: number, time: number, _timeUTC: number, _deltaTimeMs: number, _ticks: number) {
		PROP_NAMES.forEach((propName) => {
			const span = this.spans[propName].reverse().find((span) => span.startAt <= time);

			if (!span) {
				return;
			}

			const progress = span.timing(time / this.durationMs);

			switch (propName) {
				case "position":
					this.node.setPosition(interpolatePosition(progress, span.value[0], span.value[1]));
					return;
				case "rotation":
					this.node.setRotation(interpolateAngle(progress, span.value[0], span.value[1]));
					return;
				case "opacity":
					this.node.setOpacity(interpolateOpacity(progress, span.value[0], span.value[1]));
					return;
			}
		});
	}
}