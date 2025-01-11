import type { HasEvents, NodeEvents } from "./Contract/HasEvents";
import type { ParameterMap } from "./Contract/renderable";
import type { NodeEvent } from "./Core/NodeEvent";
import { Angle } from "./Parameters/Angle";
import { Vector } from "./Vector";

type Parameters = {
	position: Vector;
	rotation: Angle;
	pivot: Vector;
};

type DefaultEvents = { [key: string]: NodeEvent };

export class Node2D<TNodeEvents extends NodeEvents = DefaultEvents>
	implements HasEvents<TNodeEvents>
{
	protected _parent?: Node2D = undefined;
	protected children: Array<Node2D> = [];
	protected position = Vector.Zero;
	protected rotation = Angle.Zero;
	protected pivot: Vector = Vector.Zero;
	protected _listeners = new Map<keyof TNodeEvents, Set<Function>>();

	setPosition(value: Vector): void {
		this.position = value;
	}

	getPosition(): Vector {
		return this.position;
	}

	getGlobalPosition(): Vector {
		const parentPosition = this.getParent()?.getGlobalPosition() ?? Vector.Zero;
		const position = this.getPosition().rot(
			this.getParent()?.getGlobalRotation() ?? Angle.Zero,
		);
		return parentPosition.add(position);
	}

	setRotation(value: Angle): void {
		this.rotation = value;
	}

	getRotation(): Angle {
		return this.rotation;
	}

	getGlobalRotation(): Angle {
		return (this.getParent()?.getGlobalRotation() ?? Angle.Zero).add(this.getRotation());
	}

	addChildren(element: Node2D): void {
		this.children.push(element);
		element.setParent(this);
	}

	getChildren(): Array<Node2D> {
		return this.children;
	}

	getParameters(): ParameterMap<Parameters> {
		return {
			position: this.position,
			rotation: this.rotation,
			pivot: this.pivot,
		};
	}

	setParent(element: Node2D): void {
		this._parent = element;
	}

	getParent(): Node2D | undefined {
		return this._parent;
	}

	addListener(type: string, callback: Function): void {
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
		if (event.canPropagate()) {
			this.getParent()?.dispatchEvent(event);
		}
	}

	static findParent(
		node: Node2D | undefined,
		callback: (node: Node2D) => boolean,
	): Node2D | undefined {
		if (undefined === node || true === callback(node)) {
			return node;
		}

		return Node2D.findParent(node.getParent(), callback);
	}
}
