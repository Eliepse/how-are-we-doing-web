import type { Scene } from "./Scene";
import type { Tickable } from "../Time/Tickable";

export class Animator implements Tickable {
	private static _instance: Animator = new Animator();

	currentScenes = new Set<Scene>();
	scenesStartedAt = new WeakMap<Scene, number>();

	stop(scene: Scene) {
		this.currentScenes.delete(scene);
		this.scenesStartedAt.delete(scene);
	}

	play(scene: Scene, onDone: () => void) {
		if (this.currentScenes.has(scene)) {
			console.warn(`The scene '${scene.name}' is already playing`);
			return;
		}

		this.currentScenes.add(scene);
		this.scenesStartedAt.set(scene, Date.now());

		scene.onended = () => {
			this.stop(scene);
			onDone();
		};
	}

	tick(deltaTime: number, time: number, timeUTC: number, deltaTimeMs: number, ticks: number): void {
		this.currentScenes.forEach((scene) => {
			const startTimestamp = this.scenesStartedAt.get(scene);

			if (!startTimestamp) {
				this.currentScenes.delete(scene);
				console.warn(`Failed to find the start timestamp for the scene '${scene.name}': removed from animator`);
				return;
			}

			const sceneTime = timeUTC - startTimestamp;
			scene.tick(deltaTime, sceneTime, timeUTC, deltaTimeMs, ticks);
		});
	}

	static instance() {
		return Animator._instance;
	}

	static play(scene: Scene, onDone?: () => void): void {
		Animator.instance().play(scene, onDone ?? (() => undefined));
	}
}