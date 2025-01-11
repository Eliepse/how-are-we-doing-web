import type { Collider } from "../../../Engine2D/Contract/Collider";
import type { WithLifecycle } from "../../../Engine2D/Contract/WithLifecycle";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { CircleCollider } from "../../../Engine2D/Core/CircleCollider";
import type { Engine, EngineMouseEvent } from "../../../Engine2D/Core/Engine";
import { NodeEvent } from "../../../Engine2D/Core/NodeEvent";
import { Node2D } from "../../../Engine2D/Node2D";
import { Diagram } from "../../Diagram";
import { Determinant } from "../Determinant/Determinant";
import { Facility } from "../Facility/Facility";

export type PathologyEvents = { click: NodeEvent<Pathology> };
type Associations = { determinants: number[] };

export class Pathology
	extends Node2D<PathologyEvents>
	implements WithLifecycle, WithPointerEvents
{
	private _hovered = false;
	private _diagram?: Diagram;

	constructor(public readonly id: number, public readonly associations: Associations) {
		super();
	}

	onMount(engine: Engine): void | (() => void) {
		this._diagram = Node2D.findParent(this.getParent(), (n) => n instanceof Diagram) as
			| Diagram
			| undefined;

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

	isActive(): boolean {
		const node = this._diagram?.getSelectedNode();

		if (this === node) {
			return true;
		}

		if (node instanceof Determinant) {
			return this.associations.determinants.includes(node.id);
		}

		if (node instanceof Facility) {
			const activeDets = node.associations.determinants;
			return undefined !== this.associations.determinants.find((id) => activeDets.includes(id));
		}

		return false;
	}

	getPointerCollider(): Collider {
		return new CircleCollider(this.getGlobalPosition(), 10);
	}
}
