import type { Collider } from "../../../Engine2D/Contract/Collider";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { CircleCollider } from "../../../Engine2D/Core/CircleCollider";
import type { Engine, EngineMouseEvent } from "../../../Engine2D/Core/Engine";
import { NodeEvent } from "../../../Engine2D/Core/NodeEvent";
import { Node2D } from "../../../Engine2D/Node2D";

export type PathologyEvents = { click: NodeEvent<Pathology> };

export class Pathology
	extends Node2D<PathologyEvents>
	implements WithLifecycle, WithPointerEvents
{
	private _hovered = false;
	public active = false;

	onMount(engine: Engine): void | (() => void) {
		const handleMouseMove = (e: EngineMouseEvent) => {
			const hovered = this.getPointerCollider().isInside(e.cursor);

			if (hovered === this._hovered) {
				return;
			}

			this._hovered = hovered;
		};

		engine.addEventListener("mousemove", handleMouseMove);
		return () => {
			engine.removeEventListener("mousemove", handleMouseMove);
		};
	}

	onRender(deltaTime: number): void {
		//
	}

	onUnmount(engine: Engine): void {
		//
	}

	isHovered(): boolean {
		return this._hovered;
	}

	setActive(value: boolean): void {
		if (value === this.active) {
			return;
		}

		this.active = value;
	}

	getPointerCollider(): Collider {
		return new CircleCollider(this.getGlobalPosition(), 10);
	}
}
