import type { Node2D } from "../Engine2D/Node/Node2D";

export class NodeSelectionEvent<T extends Node2D> extends CustomEvent<void> {
	constructor(public readonly selection: T | undefined) {
		super("selection:changed");
	}
}