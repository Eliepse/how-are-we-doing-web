import type { TickableComposition } from "../Composition/TickableComposition";
import type { YieldComposition } from "../Composition/YieldComposition";
import { ActionComposition } from "../Composition/ActionComposition";

export type SceneChild = TickableComposition | YieldComposition | ActionComposition | Scene;

export interface SceneConfig {
	onPreScene?: () => void;
	onPostScene?: () => void;
	skip?: boolean;
}

const DEFAULT_CLB = () => undefined;

export class Scene {
	public readonly onPreScene: () => void = DEFAULT_CLB;
	public readonly onPostScene: () => void = DEFAULT_CLB;
	private skip = false;

	constructor(
		private readonly children: SceneChild[] = [],
		config?: SceneConfig,
	) {
		this.onPreScene = config?.onPreScene ?? DEFAULT_CLB;
		this.onPostScene = config?.onPostScene ?? DEFAULT_CLB;
		this.skip = config?.skip ?? false;
	}

	add(composition: SceneChild) {
		this.children.push(composition);
	}

	get(index: number): SceneChild | undefined {
		return this.children[index];
	}

	shouldSkip() {
		return this.skip;
	}
}
