import { Angle } from "../ValueObject/Angle";
import { Vector } from "../ValueObject/Vector";
import { Observable } from "./Observable";
import { type RenderType, RenderTypes } from "../Engine";

export class Node2D extends Observable {
	protected _parent?: Node2D = undefined;
	protected children: Array<Node2D> = [];
	protected position = Vector.Zero;
	protected rotation = Angle.Zero;
	private rerender: RenderType = RenderTypes.Skip;

	setParent(element: Node2D): void {
		this._parent = element;
	}

	getParent(): Node2D | undefined {
		return this._parent;
	}

	addChildren(element: Node2D): void {
		this.shouldRerender();
		this.children.push(element);
		element.setParent(this);
	}

	getChildren(): Array<Node2D> {
		return this.children;
	}

	setPosition(value: Vector): void {
		this.shouldRerender();
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
		this.shouldRerender();
		this.rotation = value;
	}

	getRotation(): Angle {
		return this.rotation;
	}

	getGlobalRotation(): Angle {
		return (this.getParent()?.getGlobalRotation() ?? Angle.Zero).add(this.getRotation());
	}

	onProcess(deltaTime: number): void {
		//
	}

	onRendered(deltaTime: number): void {
		this.rerender = RenderTypes.Skip;
	}

	protected shouldRepaint(): void {
		if (RenderTypes.Breaking === this.rerender) {
			// Prevent rolling back to lower rendering state
			return;
		}

		this.rerender = RenderTypes.Paint;
	}

	protected shouldRerender(): void {
		this.rerender = RenderTypes.Breaking;
	}

	renderState(): RenderType {
		return this.rerender;
	}

	static findParent(
		node: Node2D | undefined,
		callback: (node: Node2D) => boolean,
	): Node2D | undefined {
		if (undefined === node || callback(node)) {
			return node;
		}

		return Node2D.findParent(node.getParent(), callback);
	}
}
