// @ts-ignore
import { Noise } from "noisejs";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import { Angle } from "../../../Engine2D/ValueObject/Angle";
import { Vector } from "../../../Engine2D/ValueObject/Vector";
import { type Pathology } from "./Pathology";
import { PI2 } from "../../../Engine2D/math";
import { Attribute } from "../../../Engine2D/Core/Attribute";

export class PathologyFamily extends Node2D {
	public paused = false;

	private _noise: Noise;
	private _noiseClock = 0;
	public origin = new Attribute(Vector.Zero, Vector.isDiff);

	constructor(public readonly name: string, children: Array<Pathology>, private _size: number) {
		super();

		this._noise = new Noise(Math.random() * 1234);
		this.updateShiftedPosition(0);

		// Place pathologies as grouped but that feels random

		let size = 28;
		let radius = 24;
		let angleCursor = 0;
		let itemArc = new Angle(size / radius);

		children.forEach((child) => {
			child.setPosition(
				Vector.Right.mul(radius)
					.rot(angleCursor) // Place the node
					.add(Vector.rand(6)), // Add randomness
			);

			this.addChildren(child);

			angleCursor += itemArc.rad;

			// No more space to place another one, increase radius and start over
			if (itemArc.rad + angleCursor >= PI2) {
				angleCursor = 0;
				radius += size;
				itemArc = new Angle(size / radius);
			}
		});
	}

	override onProcess(deltaTime: number): void {
		super.onProcess(deltaTime);

		if (this.paused) {
			return;
		}

		this._noiseClock += deltaTime;
		this.updateShiftedPosition(this._noiseClock);
	}

	getSize(): number {
		return this._size;
	}


	override setPosition(value: Vector) {
		this.origin.set(value);
	}


	override getGlobalPosition(): Attribute<Vector> {
		return super.getGlobalPosition();
	}

	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.origin.commit();
	}

	updateShiftedPosition(time: number): void {
		const scaledTime = time / 20;

		const shift = new Vector(
			this._noise.simplex2(0, scaledTime) * 16,
			this._noise.simplex2(scaledTime, 0) * 16,
		);


		this.position.set(this.origin.get().add(shift));
	}

	override shouldRerender(): boolean {
		if (super.shouldRerender()) {
			return true;
		}

		return this.origin.hasChanged();
	}
}
