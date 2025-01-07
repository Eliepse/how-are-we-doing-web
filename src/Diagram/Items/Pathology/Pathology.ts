import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { Engine, EngineMouseEvent } from "../../../Engine2D/Core/Engine";
import { Node2D } from "../../../Engine2D/Node2D";
import type { PathologyFamily } from "./PathologyFamily";

export class Pathology extends Node2D implements WithLifecycle {
	private _hovered = false;

	onMount(engine: Engine): void | (() => void) {
		const sizeSq = Math.pow(10, 2);

		const handleMouseMove = (e: EngineMouseEvent) => {
			const hovered = this.getGlobalPosition().sub(e.cursor).magSq() <= sizeSq;

			if (hovered === this._hovered) {
				return;
			}

			this._hovered = hovered;
			const parent = this.getParent() as PathologyFamily | undefined;

			if (undefined !== parent) {
				parent.paused = this._hovered;
			}
		};

		const ccclick = () => {
			if (false === this._hovered) {
				return;
			}

			console.debug("clicked", this);
		};

		engine.addEventListener("mousemove", handleMouseMove);
		engine.addEventListener("click", ccclick);
		return () => {
			engine.removeEventListener("mousemove", handleMouseMove);
			engine.removeEventListener("click", ccclick);
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
}
