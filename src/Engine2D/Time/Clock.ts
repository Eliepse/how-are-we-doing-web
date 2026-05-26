export class Clock {
	private _paused = true;
	private _time = 0;
	private _frames = 0;
	private _lastTickTime;
	private _minTimeMsPerFrame;

	constructor(
		public frameRate = 60,
		private _callback: (deltaTime: number, frames: number) => void
	) {
		this._lastTickTime = Date.now();
		this._minTimeMsPerFrame = 1_000 / this.frameRate;
	}

	private tick(deltaTimeMs: number): void {
		this._time += deltaTimeMs;
		this._frames++;
		this._callback(deltaTimeMs / 1_000, this._frames);
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
		this._lastTickTime = Date.now();
		this._minTimeMsPerFrame = 1_000 / this.frameRate;

		this.tryTick();
	}

	private tryTick(force = false) {
		if (this._paused) {
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
