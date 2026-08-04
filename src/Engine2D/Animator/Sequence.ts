import type { Tickable } from "../Time/Tickable";
import { clamp } from "../math";

type ProcessClb = (
	// The progression as a float from 0 to 1
	progress: number,
) => void;

export class Sequence implements Tickable {
	constructor(
		private processClb: ProcessClb,
		public readonly durationMs: number,
	) {
	}

	tick(deltaTime: number, time: number, timeUTC: number, deltaTimeMs: number, ticks: number): void {
		this.processClb(clamp(0, time / this.durationMs, 1));
	}
}