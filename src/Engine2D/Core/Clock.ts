export class Clock {
	private _paused = true;
	private _time = 0;
	private _frames = 0;

	constructor(
		public frameRate = 60,
		private _callback: (deltaTime: number, frames: number) => void
	) {}

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
		let lastTickTime = Date.now();
		let minTimeMsPerFrame = 1_000 / this.frameRate;

		const attemptNextTick = () => {
			if (this._paused) {
				return;
			}
			const now = Date.now();
			const deltaTimeMs = now - lastTickTime;

			if (minTimeMsPerFrame <= deltaTimeMs) {
				this.tick(deltaTimeMs);
				lastTickTime = now;
			}

			requestAnimationFrame(attemptNextTick);
		};

		attemptNextTick();
	}

	pause(): void {
		this._paused = true;
	}
}
