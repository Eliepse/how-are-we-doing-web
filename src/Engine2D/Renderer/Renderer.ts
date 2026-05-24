import type { VirtualNode } from "../Core/VirtualNode";
import type { Vector } from "../ValueObject/Vector";

export abstract class Renderer {
	protected _debug = false;
	abstract mountNode(vnode: VirtualNode): void;

	abstract renderNode(vnode: VirtualNode, deltaTime: number, frames: number): void;

	abstract unmountNode(vnode: VirtualNode): void;

	abstract windowToLocalPoint(point: Vector): Vector;

	abstract localPointToWindow(point: Vector): Vector;

	get debug() {
		return this._debug;
	}

	setDebug(value: boolean) {
		this._debug = value;
	}
}
