import { Node2D } from "../Engine2D/Node/Node2D";
import { Angle } from "../Engine2D/ValueObject/Angle";
import { Vector } from "../Engine2D/ValueObject/Vector";

export class ArcGroup<T extends Node2D = Node2D> extends Node2D {
	constructor(
		private name: string,
		children: Array<T>,
		private arc: Angle,
		private radius: number = 100,
		private show: boolean = true,
	) {
		super();
		children.forEach((child) => this.addChildren(child));
		this.updatePlacement();
	}

	getName(): string {
		return this.name;
	}

	getItemArc(): Angle {
		return this.arc.div(this.children.length);
	}

	getArc(): Angle {
		return this.arc;
	}

	setArc(angle: number | Angle): void {
		this.arc = angle instanceof Angle ? angle : new Angle(angle);
		this.updatePlacement();
	}

	getRadius(): number {
		return this.radius;
	}

	setRadius(radius: number): void {
		this.radius = radius;
		this.updatePlacement();
	}

	/**
	 * Return the number of end items that will be placed
	 * in the arc. "End items" because the count is recursive.
	 */
	getCount(): number {
		return this.children.reduce((sum, child) => {
			if (child instanceof ArcGroup) {
				return sum + child.getCount();
			}

			return sum + 1;
		}, 0);
	}

	visible(): boolean {
		return this.show;
	}

	updatePlacement(): void {
		this.children.forEach((child, index) => {
			const angle = this.getItemArc().rad * index;

			child.setPosition(
				new Vector(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius),
			);

			// Correct the angle to have every element pointed toward the center
			child.setRotation(new Angle(angle));
		});
	}
}
