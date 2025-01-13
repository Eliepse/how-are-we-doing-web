import type { Node2D } from "../Node2D";

export class EngineNode<TNode extends Node2D = Node2D> {
	private _children = new Set<EngineNode>();

	constructor(private _node: TNode, private _parent?: EngineNode) {
		_node.getChildren().forEach((child) => this._children.add(new EngineNode(child, this)));
	}

	get node(): TNode {
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
