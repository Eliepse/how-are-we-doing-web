import type { Node2D } from "../Node2D";

export class EngineNode {
	private _children = new Set<EngineNode>();

	constructor(private _node: Node2D, private _parent?: EngineNode) {
		_node.getChildren().forEach((child) => this._children.add(new EngineNode(child, this)));
	}

	get node(): Node2D {
		return this._node;
	}

	get children(): Set<EngineNode> {
		return this._children;
	}

	get parent(): EngineNode | undefined {
		return this._parent;
	}

	isEqual(engineNode: EngineNode): boolean {
		return this._node === engineNode.node;
	}
}
