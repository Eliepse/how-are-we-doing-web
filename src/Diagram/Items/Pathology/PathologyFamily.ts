// @ts-ignore
import { Noise } from "noisejs";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { Engine } from "../../../Engine2D/Engine";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import { Angle } from "../../../Engine2D/ValueObject/Angle";
import { Vector } from "../../../Engine2D/ValueObject/Vector";
import type { Pathology } from "./Pathology";

export class PathologyFamily extends Node2D implements WithLifecycle {
	public paused = false;

	private _noise: Noise;
	private _noiseClock = 0;
	private _shiftedPosition: Vector = Vector.Zero;

	constructor(public readonly name: string, children: Array<Pathology>, private _size: number) {
		super();

		this._noise = new Noise(Math.random() * 1234);
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

	onMount(engine: Engine): void | (() => void) {
		//
	}

	onRender(deltaTime: number): void {
		if (this.paused) {
			return;
		}

		this._noiseClock += deltaTime;
		this.updateShiftedPosition(this._noiseClock);
	}

	onUnmount(engine: Engine): void {
		//
	}

	getSize(): number {
		return this._size;
	}

	override getPosition(): Vector {
		return super.getPosition().add(this._shiftedPosition);
	}

	updateShiftedPosition(time: number): void {
		const scaledTime = time / 20;

		this._shiftedPosition = new Vector(
			this._noise.simplex2(0, scaledTime) * 16,
			this._noise.simplex2(scaledTime, 0) * 16
		);
	}
}
