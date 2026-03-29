import { Angle } from "../ValueObject/Angle";
import { Vector } from "../ValueObject/Vector";
import { Observable } from "./Observable";
import { type RenderType, RenderTypes } from "../Engine";
import { Attribute } from "../Core/Attribute";
import { Opacity } from "../ValueObject/Opacity";

export class Node2D extends Observable {
	protected _parent?: Node2D = undefined;
	protected children: Array<Node2D> = [];
	protected position = new Attribute(Vector.Zero, Vector.isDiff);
	protected rotation = new Attribute(Angle.Zero, Angle.isDiff);
	protected opacity = new Attribute(Opacity.Opaque, Opacity.isDiff);
	// Global position caches, used only in getGlobalPosition()
	protected globalPosition = new Attribute(Vector.Zero, Vector.isDiff);
	// Global rotation caches, used only in getGlobalRotation()
	protected globalRotation = new Attribute(Angle.Zero, Angle.isDiff);
	// Global opacity caches, used only in getGlobalRotation()
	protected globalOpacity = new Attribute(Opacity.Opaque, Opacity.isDiff);
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

		// Rotate the position based on the parent position and rotation
		const rotatedPosition = this.position.get().rot(parent.getGlobalRotation().get());

		// Apply the rotated local position to the parent one
		const newPosition = parent.getGlobalPosition().get().add(rotatedPosition);

		this.globalPosition.set(newPosition);
		return this.globalPosition;
	}

	setRotation(value: Angle): void {
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

	setOpacity(value: Opacity) {
		this.opacity.set(value);
	}

	getOpacity() {
		return this.opacity;
	}

	getGlobalOpacity() {
		const parent = this.getParent();

		// Current node is root, therefore the local opacity is the reference
		if (undefined === parent) {
			return this.opacity;
		}

		const parentOpacity = parent.getGlobalOpacity();
		if (parentOpacity.hasChanged() || this.opacity.hasChanged()) {
			this.globalOpacity.set(parentOpacity.get().mul(this.opacity.get()));
		}

		return this.globalOpacity;
	}

	onProcess(_deltaTime: number): void {
		//
	}

	onRendered(_deltaTime: number): void {
		this.rerender = RenderTypes.Skip;
		this.position.commit();
		this.rotation.commit();
		this.globalPosition.commit();
		this.globalRotation.commit();
		this.opacity.commit();
	}

	protected shouldRerender(): void {
		this.rerender = RenderTypes.Breaking;
	}

	renderState(): RenderType {
		if (RenderTypes.Breaking === this.rerender) {
			return this.rerender;
		}

		if (this.position.hasChanged() || this.globalPosition.hasChanged()) {
			return RenderTypes.Paint;
		}

		if (this.rotation.hasChanged() || this.globalRotation.hasChanged()) {
			return RenderTypes.Paint;
		}

		if (this.opacity.hasChanged() || this.globalOpacity.hasChanged()) {
			return RenderTypes.Paint;
		}

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
