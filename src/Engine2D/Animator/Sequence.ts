import type { Tickable } from "../Time/Tickable";
import { clamp } from "../math";
import { Interpolation } from "../Time/interpolations";

type TimingFn = (typeof Interpolation)[keyof typeof Interpolation];

type ProcessClb = (
	// The progression as a float from 0 to 1
	progress: number,
) => void;

export class Sequence implements Tickable {
	public readonly timingFunction: TimingFn = Interpolation.linear;
	public readonly inverted: boolean = false;

	constructor(
		private processClb: ProcessClb,
		public readonly durationMs: number,
		config?: { timingFunction?: TimingFn; inverted?: boolean; },
	) {
		this.timingFunction = config?.timingFunction ?? Interpolation.linear;
		this.inverted = config?.inverted ?? false;
	}

	tick(_deltaTime: number, time: number, _timeUTC: number, _deltaTimeMs: number, _ticks: number): void {
		const progression = clamp(0, time / this.durationMs, 1);
		this.processClb(this.timingFunction(this.inverted ? 1 - progression : progression));
	}
}