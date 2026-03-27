import { Angle } from "../ValueObject/Angle";
import { Vector } from "../ValueObject/Vector";
import { Observable } from "./Observable";
import { type RenderType, RenderTypes } from "../Engine";
import { Attribute } from "../Core/Attribute";

export class Node2D extends Observable {
	protected _parent?: Node2D = undefined;
	protected children: Array<Node2D> = [];
	protected position = new Attribute(Vector.Zero, Vector.isDiff);
	protected rotation = new Attribute(Angle.Zero, Angle.isDiff);
	protected globalPosition = new Attribute(Vector.Zero, Vector.isDiff);
	protected globalRotation = new Attribute(Angle.Zero, Angle.isDiff);
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
		this.position.set(value);
	}

	getPosition() {
		return this.position;
	}

	getGlobalPosition() {
		const parent = this.getParent();

		// Current node is root, therefore the local position is the reference
		if (undefined === parent) {
			return this.position;
		}

		const parentPos = parent.getGlobalPosition();

		// Positions changed, recompute all!
		if (parentPos.hasChanged() || this.position.hasChanged()) {
			// Rotate the position based on the parent position and rotation
			const rotatedPosition = this.getPosition().get().rot(parent.getGlobalRotation().get());

			// Apply the rotated local position to the parent one
			const newPosition = parentPos.get().add(rotatedPosition);

			// Cache the new position
			this.globalPosition.set(newPosition);
		}

		return this.globalPosition;
	}

	setRotation(value: Angle): void {
		this.shouldRerender();
		this.rotation.set(value);
	}

	getRotation() {
		return this.rotation;
	}

	getGlobalRotation() {
		const parent = this.getParent();

		// Current node is root, therefore the local rotation is the reference
		if (undefined === parent) {
			return this.rotation;
		}

		const parentRot = parent.getGlobalRotation();

		if (parentRot.hasChanged() || this.rotation.hasChanged()) {
			this.globalRotation.set(parentRot.get().add(this.rotation.get()));
		}

		return this.globalRotation;
	}

	onProcess(_deltaTime: number): void {
		//
	}

	onRendered(_deltaTime: number): void {
		this.rerender = RenderTypes.Skip;
		this.position.commit();
		this.rotation.commit();
		this.globalRotation.commit();
		this.globalRotation.commit();
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
