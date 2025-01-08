import type { Node2D } from "../Node2D";

export class NodeEvent<Target extends Node2D | undefined = Node2D> {
	private _propagate: boolean = true;

	constructor(private _type: string, private _target?: Target) {}

	get type(): string {
		return this._type;
	}

	get target(): Target | undefined {
		return this._target;
	}

	stopPropagation(): void {
		this._propagate = false;
	}

	canPropagate(): boolean {
		return this._propagate;
	}
}
