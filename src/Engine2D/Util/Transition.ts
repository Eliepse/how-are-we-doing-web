import { linear } from "./interpolations";
import { clamp } from "../math";

export interface TransitionConfig {
	delayMs?: number,
	easeFn?: (x: number) => number,
	completed?: () => void,
}

export class Transition {
	private readonly startedAtMs: number;
	private readonly easeFn = linear;
	protected _finished: boolean = false;
	protected onCompleted?: () => void;

	constructor(
		private readonly durationMs: number,
		private readonly callback: (value: number) => void,
		config: TransitionConfig,
	) {
		this.startedAtMs = Date.now() + (config.delayMs ?? 0);
		this.easeFn = config.easeFn ?? linear;
		this.onCompleted = config.completed;
	}

	tick() {
		if (this._finished) {
			return;
		}

		const now = Date.now();
		if (now < this.startedAtMs) {
			return;
		}

		const elapsedTime = now - this.startedAtMs;
		this.callback(this.easeFn(clamp(0, elapsedTime / this.durationMs, 1)));

		if (this.durationMs <= elapsedTime) {
			this._finished = true;
			this.onCompleted && this.onCompleted();
		}
	}

	get finished() {
		return this._finished;
	}
}