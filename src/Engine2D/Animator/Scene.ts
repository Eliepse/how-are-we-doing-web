import { type Sequence } from "./Sequence";
import type { Tickable } from "../Time/Tickable";

type TrackedSequenceConfig = {
	delay?: number;
};

export class Scene implements Tickable {
	public onended: (() => void) = () => undefined;
	private sequences = new Set<[number, Sequence]>();

	constructor(public readonly name: string, sequences: Array<[number, Sequence]> = []) {
		sequences.forEach(([delay, sequence]) => this.add(sequence, { delay: 0 <= delay ? delay : undefined }));
	}

	tick(deltaTime: number, time: number, timeUTC: number, deltaTimeMs: number, ticks: number): void {
		let ended = true;

		this.sequences.forEach(([delay, sequence]) => {
			const sequenceTime = time - delay;

			// Sequence not ended yet
			if (sequenceTime < sequence.durationMs) {
				ended = false;
			}

			// Sequence hasn't started
			if (0 > sequenceTime) {
				return;
			}

			sequence.tick(deltaTime, sequenceTime, timeUTC, deltaTimeMs, ticks);
		});

		if (ended) {
			this.onended();
		}
	}

	public add(sequence: Sequence, config: TrackedSequenceConfig = {}): void {
		this.sequences.add([config.delay ?? 0, sequence]);
	}

	private findDeltaToEnd(): number {
		let delta = 0;
		this.sequences.forEach(([delay, sequence]) => delta = Math.max(delta, delay + sequence.durationMs));
		return delta;
	}
}