import type { Collider } from "../../../Engine2D/Physic/Collider";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Physic/ConstantCollider";
import { type Engine } from "../../../Engine2D/Engine";
import { TorusCollider } from "../../../Engine2D/Physic/TorusCollider";
import { type Angle } from "../../../Engine2D/ValueObject/Angle";
import { VirtualShape } from "../../../Engine2D/Node/VirtualShape";
import { type SelectableNode } from "../../Diagram";
import { Determinant } from "../Determinant/Determinant";
import { Pathology } from "../Pathology/Pathology";
import { FacilityFamily } from "./FacilityFamily";
import { facilityShape } from "./shapes";
import type { ActiveStatus } from "../../types";
import { Attribute } from "../../../Engine2D/Core/Attribute";
import { Opacity } from "../../../Engine2D/ValueObject/Opacity";
import { dimmedAlpha } from "../../colors";

type Associations = { determinants: number[] };

export class Facility extends VirtualShape implements WithPointerEvents, WithLifecycle {
	private _collider?: TorusCollider;
	public status = new Attribute<ActiveStatus | false>(false);

	constructor(
		public readonly id: number,
		public readonly label: string,
		public readonly associations: Associations,
		private _arc: Angle,
	) {
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
			parent.getGlobalPosition().get(),
			outerRadius - torusWidth / 2,
			torusWidth,
			this._arc,
			this.getGlobalRotation().get().sub(this._arc.div(2)),
		);
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
			this._collider.setCenter(position.get());
		}

		return this._collider;
	}

	setStatus(status: ActiveStatus | false): void {
		this.status.set(status);
		this.opacity.set("dimmed" === status ? dimmedAlpha : Opacity.Opaque);
	}

	isConnected(node: SelectableNode): boolean {
		if (node instanceof Determinant) {
			return this.associations.determinants.includes(node.id);
		}

		if (node instanceof Pathology) {
			const activeDets = node.associations.determinants;
			return undefined !== this.associations.determinants.find((id) => activeDets.includes(id));
		}

		return false;
	}


	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.status.commit();
	}


	override shouldRerender(): boolean {
		if (super.shouldRerender()) {
			return true;
		}

		return this.status.hasChanged();
	}
}
