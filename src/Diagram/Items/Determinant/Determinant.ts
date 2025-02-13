import type { Collider } from "../../../Engine2D/Physic/Collider";
import type { Symbolic } from "../../../Engine2D/Contract/renderable";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Physic/ConstantCollider";
import type { Engine } from "../../../Engine2D/Engine";
import { TorusCollider } from "../../../Engine2D/Physic/TorusCollider";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import type { Angle } from "../../../Engine2D/ValueObject/Angle";
import { ClipPath } from "../../../Engine2D/ValueObject/Clip";
import { VirtualShape } from "../../../Engine2D/Node/VirtualShape";
import { Diagram } from "../../Diagram";
import { Facility } from "../Facility/Facility";
import { Pathology } from "../Pathology/Pathology";
import { DeterminantSubFamily } from "./DeterminantSubFamily";

const stepClips = [
	ClipPath.rect("0", "100%", "25%", "0"),
	ClipPath.rect("25%", "100%", "50%", "0"),
	ClipPath.rect("50%", "100%", "75%", "0"),
	ClipPath.rect("75%", "100%", "100%", "0"),
];

const stepClipsOptimized = [
	ClipPath.rect("0", "100%", "25%", "0"),
	ClipPath.rect("0", "100%", "50%", "0"),
	ClipPath.rect("0", "100%", "75%", "0"),
	ClipPath.rect("0", "100%", "100%", "0"),
];

type Associations = { pathologies: number[]; facilities: number[] };

export class Determinant extends VirtualShape implements WithPointerEvents, WithLifecycle {
	private step: number = 2;
	private _collider?: TorusCollider;
	private _diagram?: Diagram;

	constructor(
		public readonly id: number,
		public readonly label: string,
		asset: Symbolic,
		private _colliderConfig: { arc: Angle },
		public readonly associations: Associations,
	) {
		super(asset);

		// if (this.optimized) {
		//   const size = new Vector(159, 256).div(2);
		//   const shape = new VirtualShape(size, asset, stepClipsOptimized[this.step - 1]);
		//   this.elements.push(shape);
		//   return;
		// }

		// for (var i = 0; i < 4; i++) {
		//   const size = new Vector(159, 256).div(2);
		//   const shape = new VirtualShape(size, asset, stepClips[i]);
		//   this.elements.push(shape);
		// }
	}

	onMount(engine: Engine): void | (() => void) {
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

	getStep(): number {
		return this.step;
	}

	setStep(step: number): void {
		this.step = Math.min(4, Math.max(1, step));
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
