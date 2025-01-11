import type { Collider } from "../../../Engine2D/Contract/Collider";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Core/ConstantCollider";
import type { Engine } from "../../../Engine2D/Core/Engine";
import { TorusCollider } from "../../../Engine2D/Core/TorusCollider";
import type { Angle } from "../../../Engine2D/Parameters/Angle";
import { VirtualShape } from "../../../Engine2D/VirtualShape";
import { FacilityFamily } from "./FacilityFamily";
import { facilityShape } from "./shapes";

export class Facility extends VirtualShape implements WithPointerEvents, WithLifecycle {
	public active = false;
	private _collider?: TorusCollider;

	constructor(private _arc: Angle) {
		super(facilityShape);
	}

	onMount(engine: Engine): void | (() => void) {
		const parent = this.getParent();

		if (!(parent instanceof FacilityFamily)) {
			return;
		}

		const outerRadius = parent.getRadius() + 8;
		const torusWidth = 24;

		this._collider = new TorusCollider(
			parent.getGlobalPosition(),
			outerRadius - torusWidth / 2,
			torusWidth,
			this._arc,
			this.getGlobalRotation().sub(this._arc.div(2)),
		);
	}

	onRender(deltaTime: number): void {
		//
	}

	onUnmount(engine: Engine): void {
		//
	}

	getPointerCollider(): Collider {
		if (undefined === this._collider) {
			return ConstantCollider.miss;
		}

		const position = this.getParent()?.getGlobalPosition();

		if (position) {
			this._collider.setCenter(position);
		}

		return this._collider;
	}

	setActive(value: boolean): void {
		if (value === this.active) {
			return;
		}

		this.active = value;
	}
}
