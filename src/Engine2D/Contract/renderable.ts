import { Angle } from "../ValueObject/Angle";
import { Vector } from "../ValueObject/Vector";

export interface Element2D {
	setPosition(value: Vector): void;

	getPosition(): Vector;

	getGlobalPosition(): Vector;

	setRotation(value: Angle): void;

	getRotation(): Angle;

	getGlobalRotation(): Angle;

	getChildren(): Array<Element2D>;

	setParent(element: Element2D): void;

	getParent(): Element2D | undefined;
}

export interface Symbolic {
	getHref(): string;

	getPivot(): Vector;

	getAngle(): Angle;
}
