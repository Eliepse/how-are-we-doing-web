import type { Collider } from "../../../Engine2D/Physic/Collider";
import type { Symbolic } from "../../../Engine2D/Contract/renderable";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Physic/ConstantCollider";
import { Engine } from "../../../Engine2D/Engine";
import { TorusCollider } from "../../../Engine2D/Physic/TorusCollider";
import { type Angle } from "../../../Engine2D/ValueObject/Angle";
import { VirtualShape } from "../../../Engine2D/Node/VirtualShape";
import { type SelectableNode } from "../../Diagram";
import { Facility } from "../Facility/Facility";
import { Pathology } from "../Pathology/Pathology";
import { DeterminantSubFamily } from "./DeterminantSubFamily";
import type { ActiveStatus, DeterminantKey } from "../../types";
import { Attribute } from "../../../Engine2D/Core/Attribute";
import { dimmedAlpha } from "../../colors";
import { Opacity } from "../../../Engine2D/ValueObject/Opacity";
import { Transition } from "../../../Engine2D/Time/Transition";
import { easeOutCubic, interpolateNumber } from "../../../Engine2D/Time/interpolations";

export type Steps = 1 | 2 | 3 | 4;
type Associations = { pathologies: number[]; facilities: number[], determinants: number[] };

export class Determinant extends VirtualShape implements WithPointerEvents {
	private _collider?: TorusCollider;
	private step = new Attribute<Steps>(2);
	private applicable = new Attribute(true);
	public status = new Attribute<ActiveStatus | false>(false);

	constructor(
		public readonly id: number,
		public readonly key: DeterminantKey,
		public readonly label: string,
		asset: Symbolic,
		private _colliderConfig: { arc: Angle },
		public readonly associations: Associations,
	) {
		super(asset);
		this.tags.push("determinant");
	}

	override onMount(_: Engine): void | (() => void) {
		const parent = this.getParent();

		if (!(parent instanceof DeterminantSubFamily)) {
			return;
		}

		const outerRadius = parent.getRadius() + 8;
		const torusWidth = parent.getTorusWidth() + 16;

		this._collider = new TorusCollider(
			parent.getGlobalPosition().get(),
			outerRadius - torusWidth / 2,
			torusWidth,
			this._colliderConfig.arc,
			this.getGlobalRotation().get().sub(this._colliderConfig.arc.div(2)),
		);
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

	getStep() {
		return this.step;
	}

	setStep(step: Steps): void {
		this.applicable.set(true);
		const from = this.step.get();
		Engine.registerTransition(
			new Transition(
				350,
				(v) => this.step.set(Math.round(interpolateNumber(v, from, step)) as Steps),
				{ easeFn: easeOutCubic },
			),
		);
	}

	notApplicable(): void {
		this.step.set(1);
		this.applicable.set(false);
	}

	isApplicable() {
		return this.applicable;
	}

	setStatus(status: ActiveStatus | false): void {
		this.status.set(status);
		this.opacity.set("dimmed" === status ? dimmedAlpha : Opacity.Opaque);
	}

	isConnected(node?: SelectableNode): boolean {
		if (node instanceof Facility) {
			return this.associations.facilities.includes(node.id);
		}

		if (node instanceof Pathology) {
			return this.associations.pathologies.includes(node.id);
		}

		if (node instanceof Determinant) {
			return this.associations.determinants.includes(node.id);
		}

		return false;
	}


	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.step.commit();
		this.applicable.commit();
		this.status.commit();
	}


	override shouldRerender(): boolean {
		if (super.shouldRerender()) {
			return true;
		}

		return this.status.hasChanged() || this.applicable.hasChanged() || this.step.hasChanged();
	}
}
