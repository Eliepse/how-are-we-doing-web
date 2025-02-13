import type { Node2D } from "../Node/Node2D";

export class VirtualNode<TNode extends Node2D = Node2D> {
	private _children: VirtualNode[] = [];

	constructor(public readonly node: TNode) {
	}

	setChildren(children: VirtualNode[]): void {
		this._children = children;
	}

	get children() {
		return this._children;
	}
}
