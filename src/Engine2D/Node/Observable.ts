import type { NodeEvent } from "../Core/NodeEvent";
import { Node2D } from "./Node2D";

type DefaultEvents = { [key: string]: NodeEvent };
export type NodeEvents = { [key: string]: NodeEvent };

export class Observable<TNodeEvents extends NodeEvents = DefaultEvents> {
	protected _listeners = new Map<keyof TNodeEvents, Set<Function>>();

	addListener(type: string, callback: Function): void {
		// noinspection PointlessBooleanExpressionJS
		if (false === this._listeners.has(type)) {
			this._listeners.set(type, new Set());
		}

		this._listeners.get(type)?.add(callback);
	}

	removeListener(type: string, callback: Function): void {
		this._listeners.get(type)?.delete(callback);
	}

	dispatchEvent<Type extends keyof TNodeEvents>(event: TNodeEvents[Type]): void {
		this._listeners.get(event.type)?.forEach((listener) => listener(event));

		if (event.canPropagate() && this instanceof Node2D) {
			this.getParent()?.dispatchEvent(event);
		}
	}
}