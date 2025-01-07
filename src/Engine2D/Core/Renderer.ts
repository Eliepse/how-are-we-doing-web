import type { Node2D } from "../Node2D";
import { Engine } from "./Engine";
import type { EngineNode } from "./EngineNode";

export abstract class Renderer {
	protected _engine: Engine;

	constructor(root: Node2D) {
		this._engine = new Engine(
			root,
			(node) => this.mountNode(node),
			(node) => this.unmountNode(node),
			(node) => this.renderNode(node)
		);
	}

	abstract mountNode(node: EngineNode): void;
	abstract renderNode(node: EngineNode): void;
	abstract unmountNode(node: EngineNode): void;

	render() {
		this._engine.updateTree();
	}
}
