import { Transition, type TransitionConfig } from "./Transition";

export class AutoTransition extends Transition<number> {
	override interpolate(percent: number): number {
		return percent;
	}

	constructor(
		config: Omit<TransitionConfig<number>, "from" | "to">,
		private handle: (transition: AutoTransition) => void,
	) {
		super({ ...config, from: 0, to: 1 });
	}

	tick() {
		this.handle(this);
	}

	isCompleted() {
		return this.completed;
	}
}