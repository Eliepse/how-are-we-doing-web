import type { Clipable } from "./Clipable";
import type { Tickable } from "../../Time/Tickable";
import { Interpolation, type TimingFn } from "../../Time/interpolations";
import { clamp } from "../../math";

type ProcessClb = (
	// The progression as a float from 0 to 1
	progress: number,
) => void;

export interface TransitionClipConfig {
	timingFunction?: TimingFn;
	inverted?: boolean;
}

export class TransitionClip implements Tickable, Clipable {
	public readonly timingFunction: TimingFn = Interpolation.linear;
	public readonly inverted: boolean = false;

	constructor(
		private processClb: ProcessClb,
		private readonly durationMs: number,
		config?: TransitionClipConfig,
	) {
		this.timingFunction = config?.timingFunction ?? Interpolation.linear;
		this.inverted = config?.inverted ?? false;
	}

    applyStart(): void {
        this.process(0);
    }

    applyEnd(): void {
        this.process(1);
    }

	private process(progress: number): void {
		this.processClb(this.timingFunction(this.inverted ? 1 - progress : progress));
	}

	tick(_deltaTime: number, time: number, _timeUTC: number, _deltaTimeMs: number, _ticks: number): void {
		this.process(clamp(0, time / this.getDuration(), 1));
	}

	getDuration(): number {
		return this.durationMs;
	}
}