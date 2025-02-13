import { Angle } from "../ValueObject/Angle";
import { Vector } from "../ValueObject/Vector";
import { Observable } from "./Observable";

export class Node2D extends Observable {
	protected _parent?: Node2D = undefined;
	protected children: Array<Node2D> = [];
	protected position = Vector.Zero;
	protected rotation = Angle.Zero;

	setParent(element: Node2D): void {
		this._parent = element;
	}

	getParent(): Node2D | undefined {
		return this._parent;
	}

	addChildren(element: Node2D): void {
		this.children.push(element);
		element.setParent(this);
	}

	getChildren(): Array<Node2D> {
		return this.children;
	}

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
}
