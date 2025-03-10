import type { Collider } from "../../../Engine2D/Physic/Collider";
import type { Symbolic } from "../../../Engine2D/Contract/renderable";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Physic/ConstantCollider";
import type { Engine } from "../../../Engine2D/Engine";
import { TorusCollider } from "../../../Engine2D/Physic/TorusCollider";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import type { Angle } from "../../../Engine2D/ValueObject/Angle";
import { VirtualShape } from "../../../Engine2D/Node/VirtualShape";
import { Diagram } from "../../Diagram";
import { Facility } from "../Facility/Facility";
import { Pathology } from "../Pathology/Pathology";
import { DeterminantSubFamily } from "./DeterminantSubFamily";
import { CustomTransition } from "../../../Engine2D/Util/CustomTransition";
import { interpolate } from "../../../helpers";
import type { DeterminantKey } from "../../types";

export type Steps = 1 | 2 | 3 | 4;
type Associations = { pathologies: number[]; facilities: number[] };

export class Determinant extends VirtualShape implements WithPointerEvents, WithLifecycle {
	private step: Steps = 2;
	private _collider?: TorusCollider;
	private _diagram?: Diagram;
	private stepsTransition ?: CustomTransition<Steps>;
	private applicable: boolean = true;

	constructor(
		public readonly id: number,
		public readonly key: DeterminantKey,
		public readonly label: string,
		asset: Symbolic,
		private _colliderConfig: { arc: Angle },
		public readonly associations: Associations,
	) {
		super(asset);
	}

	onMount(_: Engine): void | (() => void) {
		const parent = this.getParent();

		if (!(parent instanceof DeterminantSubFamily)) {
			return;
		}

		this._diagram = Node2D.findParent(parent, (n) => n instanceof Diagram) as
			| Diagram
			| undefined;

		const outerRadius = parent.getRadius() + 8;
		const torusWidth = parent.getTorusWidth() + 16;

		this._collider = new TorusCollider(
			parent.getGlobalPosition(),
			outerRadius - torusWidth / 2,
			torusWidth,
			this._colliderConfig.arc,
			this.getGlobalRotation().sub(this._colliderConfig.arc.div(2)),
		);
	}

	override onProcess(deltaTime: number) {
		super.onProcess(deltaTime);

		this.shouldRepaint();

		if (this.stepsTransition) {
			this.step = this.stepsTransition.value;
		}
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

	getStep(): Steps {
		return this.step;
	}

	setStep(step: Steps): void {
		this.applicable = true;
		this.stepsTransition = new CustomTransition(
			{ durationMs: 350, from: this.step, to: step, completed: () => this.stepsTransition = undefined },
			(percent, from, to) => Math.round(interpolate(from, to, percent)) as Steps,
		);
		this.shouldRepaint();
	}

	notApplicable(): void {
		this.step = 1;
		this.applicable = false;
	}

	isApplicable(): boolean {
		return this.applicable;
	}

	isActive(): boolean {
		const node = this._diagram?.getSelectedNode();

		if (this === node) {
			return true;
		}

		if (node instanceof Facility) {
			return this.associations.facilities.includes(node.id);
		}

		if (node instanceof Pathology) {
			return this.associations.pathologies.includes(node.id);
		}

		return false;
	}
}
