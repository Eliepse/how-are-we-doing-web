import type { Tickable } from "./Tickable";

export class Clock {
	private _paused = true;
	private _time = 0;
	private _frames = 0;
	private _firstTickTime: number | undefined;
	private _lastTickTime: number | undefined;
	private _minTimeMsPerFrame: number | undefined;

	constructor(
		public frameRate = 60,
		private _callback: Tickable | ((deltaTime: number, frames: number) => void),
	) {
		this._lastTickTime = Date.now();
		this._minTimeMsPerFrame = 1_000 / this.frameRate;
	}

	private tick(deltaTimeMs: number): void {
		this._time += deltaTimeMs;
		this._frames++;
		const now = Date.now();

		if ("tick" in this._callback) {
			this._callback.tick(
				deltaTimeMs / 1_000,
				now - (this._firstTickTime ?? now),
				now,
				deltaTimeMs,
				this._frames,
			);
		} else {
			this._callback(deltaTimeMs / 1_000, this._frames);
		}
	}

	getFrames(): number {
		return this._frames;
	}

	update(): void {
		this.tick(0);
	}

	start(): void {
		if (false === this._paused) {
			return;
		}

		this._paused = false;
		this._firstTickTime = this._lastTickTime = Date.now();
		this._minTimeMsPerFrame = 1_000 / this.frameRate;

		this.tryTick();
	}

	private tryTick(force = false) {
		if (this._paused || undefined === this._minTimeMsPerFrame || undefined === this._lastTickTime) {
			return;
		}

		const now = Date.now();
		const deltaTimeMs = now - this._lastTickTime;

		if (this._minTimeMsPerFrame <= deltaTimeMs || force) {
			this.tick(deltaTimeMs);
			this._lastTickTime = now;
		}

		requestAnimationFrame(() => this.tryTick());
	}

	pause(): void {
		this._paused = true;
	}

	forceTick() {
		this.tryTick(true);
	}
}
