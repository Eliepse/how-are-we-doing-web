import { Scene } from "./Scene/Scene";
import { Animator } from "./Animator";

export class Timeline {
	static async play(scene: Scene, signal?: AbortSignal) {
		scene.onPreScene();

		let index = 0, current = scene.get(index);

		while (current && !signal?.aborted) {
			if(current instanceof Scene) {
				await Timeline.play(current, signal);
				continue;
			}

			await new Promise<void>((next) => {
				if (!current) {
					return next();
				}

				// It supposed to be an animated composition
				if ("tick" in current) {
					Animator.play(current, next, undefined, signal);
					return;
				}

				// It's supposed to a yield composition
				if ("trigger" in current) {
					current.trigger(next, signal);
					return;
				}

				// Fallback: skip
				next();
			});

			current = scene.get(++index);
		}

		scene.onPostScene();
	}
}