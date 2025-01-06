import type { Element2D, ParameterMap } from "./Contract/renderable";
import { Angle } from "./Parameters/Angle";
import { Vector } from "./Vector";

type Parameters = {
	position: Vector;
	rotation: Angle;
	pivot: Vector;
};

export class Node2D {
	protected _parent?: Element2D = undefined;
	protected children: Array<Node2D> = [];
	protected position = Vector.Zero;
	protected rotation = Angle.Zero;
	protected pivot: Vector = Vector.Zero;

	setPosition(value: Vector): void {
		this.position = value;
	}

	getPosition(): Vector {
		return this.position;
	}

	getGlobalPosition(): Vector {
		const parentPosition = this.getParent()?.getGlobalPosition() ?? Vector.Zero;
		const position = this.getPosition().rot(
			this.getParent()?.getGlobalRotation() ?? Angle.Zero
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

	setParent(element: Element2D): void {
		this._parent = element;
	}

	getParent(): Element2D | undefined {
		return this._parent;
	}
}
