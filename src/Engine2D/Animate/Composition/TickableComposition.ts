import type { Composition } from "./Composition";
import type { Tickable } from "../../Time/Tickable";
import type { Clipable } from "../Clip/Clipable";

type TrackedSequenceConfig = {
	delay?: number;
};

type AcceptedClips = Clipable & Tickable;
export type ClipTuple = [number, AcceptedClips];

export class TickableComposition implements Tickable, Composition {
	public onstarted: () => void = () => undefined;
	public onended: () => void = () => undefined;
	private clips = new Set<ClipTuple>();

	constructor(
		clips: Array<ClipTuple> = [],
		public readonly name: string | undefined = undefined,
	) {
		clips.forEach(([delay, sequence]) =>
			this.add(sequence, { delay: 0 <= delay ? delay : undefined }),
		);
	}

	tick(
		deltaTime: number,
		time: number,
		timeUTC: number,
		deltaTimeMs: number,
		ticks: number,
	): void {
		let ended = true;

		this.clips.forEach(([delay, clip]) => {
			const duration = clip.getDuration();
			const sequenceTime = time - delay;

			// Sequence not ended yet
			if (sequenceTime < duration) {
				ended = false;
			}

			// Sequence hasn't started
			if (0 > sequenceTime) {
				return;
			}

			clip.tick(deltaTime, Math.min(sequenceTime, duration), timeUTC, deltaTimeMs, ticks);
		});

		if (ended) {
			// Cleanup every sequence to make sure it riches the target value
			this.clips.forEach(([_, clip]) => clip.applyEnd());

			this.onended();
		}
	}

	public add(sequence: AcceptedClips, config: TrackedSequenceConfig = {}): void {
		this.clips.add([config.delay ?? 0, sequence]);
	}
}
