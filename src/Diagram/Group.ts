import { Node2D } from "../Engine2D/Node/Node2D";

export class Group<T extends Node2D = Node2D> extends Node2D {
	constructor(children: Array<T>) {
		super();
		children.forEach((child) => this.addChildren(child));
	}

	size(): number {
		return this.children.length;
	}
}
