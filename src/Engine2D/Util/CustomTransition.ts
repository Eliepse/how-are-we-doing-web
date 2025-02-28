import { Transition, type TransitionConfig } from "./Transition";

export class CustomTransition<TValue> extends Transition<TValue> {
	constructor(
		config: TransitionConfig<TValue>,
		private readonly interpolator: (percent: number, from: TValue, to: TValue) => TValue,
	) {
		super(config);
	}

	override interpolate(percent: number): TValue {
		return this.interpolator(percent, this.from, this.to);
	}
}