import type { Composition } from "./Composition";
import type { Tickable } from "../../Time/Tickable";
import type { Clipable } from "../Clip/Clipable";

type TrackedSequenceConfig = {
	delay?: number;
};

type AcceptedClips = Clipable & Tickable;
export type ClipTuple = [number, AcceptedClips];

export class TickableComposition implements Tickable, Composition {
	public onstarted: (() => void) = () => undefined;
	public onended: (() => void) = () => undefined;
	private sequences = new Set<ClipTuple>();

	constructor(
		clips: Array<ClipTuple> = [],
		public readonly name: string | undefined = undefined,
	) {
		clips.forEach(([delay, sequence]) => this.add(sequence, { delay: 0 <= delay ? delay : undefined }));
	}

	tick(deltaTime: number, time: number, timeUTC: number, deltaTimeMs: number, ticks: number): void {
		let ended = true;

		this.sequences.forEach(([delay, sequence]) => {
			const sequenceTime = time - delay;

			// Sequence not ended yet
			if (sequenceTime < sequence.getDuration()) {
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

	public add(sequence: AcceptedClips, config: TrackedSequenceConfig = {}): void {
		this.sequences.add([config.delay ?? 0, sequence]);
	}
}