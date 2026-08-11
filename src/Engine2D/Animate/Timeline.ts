import type { Scene } from "./Scene/Scene";
import { Animator } from "./Animator";

export class Timeline {
	static async play(scene: Scene) {
		let index = 0, current = scene.get(index);

		while (current) {
			await new Promise<void>((next) => {
				if (!current) {
					return next();
				}

				// It supposed to be an animated composition
				if ("tick" in current) {
					Animator.play(current, next);
					return;
				}

				// It's supposed to a yield composition
				if ("trigger" in current) {
					current.trigger(next);
					return;
				}

				// Fallback: skip
				next();
			});

			current = scene.get(++index);
		}
	}
}