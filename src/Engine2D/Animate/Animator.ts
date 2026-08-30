import type { Tickable } from "../Time/Tickable";
import type { TickableComposition } from "./Composition/TickableComposition";

export class Animator implements Tickable {
	private static _instance: Animator = new Animator();

	private currentScenes = new Set<TickableComposition>();
	private scenesStartedAt = new WeakMap<TickableComposition, number>();
	private signals = new WeakMap<TickableComposition, AbortSignal>();

	stop(scene: TickableComposition) {
		this.currentScenes.delete(scene);
		this.scenesStartedAt.delete(scene);
	}

	play(scene: TickableComposition, onDone: () => void, delayMs?: number, signal?: AbortSignal) {
		if (this.currentScenes.has(scene)) {
			const sceneName = scene.name ? `'${scene.name}'` : "<unamed>";
			console.warn(`The scene ${sceneName} is already playing`);
			return;
		}

		this.currentScenes.add(scene);
		this.scenesStartedAt.set(scene, Date.now() + (delayMs ?? 0));

		if(signal) {
			this.signals.set(scene, signal);
		}

		scene.onstarted();

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

			if(this.signals.get(scene)?.aborted) {
				scene.onended();
				return;
			}

			const sceneTime = timeUTC - startTimestamp;

			if(0 > sceneTime) {
				return;
			}

			scene.tick(deltaTime, sceneTime, timeUTC, deltaTimeMs, ticks);
		});
	}

	static instance() {
		return Animator._instance;
	}

	static play(scene: TickableComposition, onDone?: () => void, delayMs?: number, signal?: AbortSignal): void {
		Animator.instance().play(scene, onDone ?? (() => undefined), delayMs, signal);
	}
}