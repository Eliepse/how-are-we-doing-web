import type { Collider } from "../../../Engine2D/Contract/Collider";
import type { Symbolic } from "../../../Engine2D/Contract/renderable";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { ConstantCollider } from "../../../Engine2D/Core/ConstantCollider";
import type { Engine } from "../../../Engine2D/Core/Engine";
import { TorusCollider } from "../../../Engine2D/Core/TorusCollider";
import type { Angle } from "../../../Engine2D/Parameters/Angle";
import { ClipPath } from "../../../Engine2D/Parameters/Clip";
import { VirtualShape } from "../../../Engine2D/VirtualShape";
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

export class Determinant extends VirtualShape implements WithPointerEvents, WithLifecycle {
	private elements: Array<VirtualShape> = [];
	private step: number = 2;
	private _active = false;
	private _collider?: TorusCollider;

	constructor(asset: Symbolic, private _colliderConfig: { arc: Angle }) {
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

	activate(): void {
		this._active = true;
	}

	deactivate(): void {
		this._active = false;
	}

	isActive(): boolean {
		return this._active;
	}
}
