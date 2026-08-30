import { Scene, type SceneChild, type SceneConfig } from "../../Engine2D/Animate/Scene/Scene";

export class HTMLScene extends Scene {
	constructor(
		prepare: (register: (key: string, node: HTMLElement) => void) => void,
		compose: (node: (key: string) => HTMLElement) => SceneChild[],
		cleanup?: (node: (key: string) => HTMLElement) => void,
		config?: Omit<SceneConfig, "onPreScene" | "onPostScene">
	) {
		const nodes = new Map<string, HTMLElement>();
		const finder = (key: string) => HTMLScene.getNode(nodes, key);

		super(
			[],
			{
				...config,
				onPreScene: () => {
					prepare((key, node) => nodes.set(key, node));
					compose(finder).forEach((child) => this.add(child));
				},
				onPostScene: () => cleanup && cleanup(finder),
			});
	}

	private static getNode(nodes: Map<string, HTMLElement>, key: string) {
		const node = nodes.get(key);

		if (!node) {
			throw new Error(`Node '${key}' not found`);
		}

		return node;
	}
}