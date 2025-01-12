import type { Collider } from "../../../Engine2D/Contract/Collider";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Core/ConstantCollider";
import type { Engine } from "../../../Engine2D/Core/Engine";
import { TorusCollider } from "../../../Engine2D/Core/TorusCollider";
import { Node2D } from "../../../Engine2D/Node2D";
import type { Angle } from "../../../Engine2D/Parameters/Angle";
import { VirtualShape } from "../../../Engine2D/VirtualShape";
import { Diagram } from "../../Diagram";
import { Determinant } from "../Determinant/Determinant";
import { Pathology } from "../Pathology/Pathology";
import { FacilityFamily } from "./FacilityFamily";
import { facilityShape } from "./shapes";

type Associations = { determinants: number[] };

export class Facility extends VirtualShape implements WithPointerEvents, WithLifecycle {
	private _collider?: TorusCollider;
	private _diagram?: Diagram;

	constructor(
		public readonly id: number,
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

		this._diagram = Node2D.findParent(parent, (n) => n instanceof Diagram) as
			| Diagram
			| undefined;

		if (undefined === this._diagram) {
			throw new Error("Failed to find diagram");
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

	isActive(): boolean {
		const node = this._diagram?.getSelectedNode();

		if (this === node) {
			return true;
		}

		if (node instanceof Determinant) {
			return this.associations.determinants.includes(node.id);
		}

		if (node instanceof Pathology) {
			const activeDets = node.associations.determinants;
			return undefined !== this.associations.determinants.find((id) => activeDets.includes(id));
		}

		return false;
	}

	getDiagram(): Diagram | undefined {
		return this._diagram;
	}
}
