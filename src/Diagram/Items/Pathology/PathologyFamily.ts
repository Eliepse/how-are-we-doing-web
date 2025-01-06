// @ts-ignore
import { Noise } from "noisejs";
import { Node2D } from "../../../Engine2D/Node2D";
import { Angle } from "../../../Engine2D/Parameters/Angle";
import { Vector } from "../../../Engine2D/Vector";
import type { Pathology } from "./Pathology";

export class PathologyFamily extends Node2D {
	private noise: Noise;
	private shiftedPosition: Vector = Vector.Zero;

	constructor(children: Array<Pathology>, private _size: number) {
		super();

		this.noise = new Noise(Math.random() * 1234);
		this.updateShiftedPosition(0);

		// Place pathologies as grouped but that feels random

		let size = 28;
		let radius = 24;
		let angleCursor = Angle.Zero;
		let itemArc = new Angle(size / radius);

		children.forEach((child) => {
			child.setPosition(
				Vector.Right.mul(radius)
					.rot(angleCursor) // Place the node
					.add(Vector.rand(6)) // Add randomness
			);

			this.addChildren(child);

			angleCursor = angleCursor.add(itemArc);

			// No more space to place another one, increase radius and start over
			if (angleCursor.add(itemArc).rad >= 2 * Math.PI) {
				angleCursor = Angle.Zero;
				radius += size;
				itemArc = new Angle(size / radius);
			}
		});
	}

	getSize(): number {
		return this._size;
	}

	override getPosition(): Vector {
		return super.getPosition().add(this.shiftedPosition);
	}

	updateShiftedPosition(time: number): void {
		const scaledTime = time / 20;

		this.shiftedPosition = new Vector(
			this.noise.simplex2(0, scaledTime) * 16,
			this.noise.simplex2(scaledTime, 0) * 16
		);
	}
}
