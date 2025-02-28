export interface TransitionConfig<TValue> {
	durationMs: number,
	from: TValue,
	to: TValue
	delayMs?: number,
	completed?: () => void,
}

export abstract class Transition<TValue> {
	private readonly startedAtMs: number;
	private readonly durationMs: number;
	protected readonly from: TValue;
	protected readonly to: TValue;
	protected completed: boolean = false;
	protected onCompleted?: () => void;

	protected constructor(config: TransitionConfig<TValue>) {
		this.durationMs = config.durationMs;
		this.from = config.from;
		this.to = config.to;
		this.startedAtMs = Date.now() + (config.delayMs ?? 0);
		this.onCompleted = config.completed;
	}

	abstract interpolate(percent: number): TValue;

	get value(): TValue {
		if (this.completed) {
			return this.to;
		}

		const elapsedTime = Date.now() - this.startedAtMs;

		if (0 >= elapsedTime) {
			return this.from;
		} else if (this.durationMs <= elapsedTime) {
			this.completed = true;
			this.onCompleted && this.onCompleted();
			return this.to;
		}

		return this.interpolate(elapsedTime / this.durationMs);
	}
}