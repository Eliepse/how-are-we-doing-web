import type { Node2D } from "../Node2D";
import { EngineNode } from "./EngineNode";

export class Engine {
	private _tree?: EngineNode;

	constructor(
		private _rootNode: Node2D,
		private _onMount: (node: EngineNode) => void,
		private _onUnmount: (node: EngineNode) => void,
		private _onRender: (node: EngineNode) => void
	) {}

	private mountTree(node: EngineNode): void {
		this._onMount(node);
		this._onRender(node);
		node.children.forEach((child) => this.mountTree(child));
	}

	private unmountTree(node: EngineNode): void {
		node.children.forEach((child) => this.unmountTree(child));
		this._onUnmount(node);
	}

	private compareTreeRecursive(previous: Array<EngineNode>, current: Array<EngineNode>) {
		previous.slice(current.length).forEach((node) => this.unmountTree(node));

		current.forEach((currentNode, index) => {
			const previousNode = previous[index];

			// Element didn't exist
			if (undefined === previousNode) {
				this.mountTree(currentNode);
				return;
			}

			// Elements differs
			if (false === previousNode.isEqual(currentNode)) {
				this.unmountTree(previousNode);
				this.mountTree(currentNode);
				return;
			}

			this._onRender(currentNode);

			this.compareTreeRecursive(
				Array.from(previousNode.children),
				Array.from(currentNode.children)
			);
		});
	}

	updateTree(): void {
		// Generate a fresh new tree
		const newTree = new EngineNode(this._rootNode);

		// Compare with the previous one
		this.compareTreeRecursive(this._tree ? [this._tree] : [], [newTree]);

		// Keep the new one for next render
		this._tree = newTree;
	}
}
