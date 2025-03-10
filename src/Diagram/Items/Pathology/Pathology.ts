import type { Collider } from "../../../Engine2D/Physic/Collider";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { CircleCollider } from "../../../Engine2D/Physic/CircleCollider";
import { NodeEvent } from "../../../Engine2D/Core/NodeEvent";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import { type SelectableNode } from "../../Diagram";
import { Determinant } from "../Determinant/Determinant";
import { Facility } from "../Facility/Facility";

export type PathologyEvents = { click: NodeEvent<Pathology> };
type Associations = { determinants: number[] };

export class Pathology extends Node2D implements WithPointerEvents {
	public active = false;

	constructor(
		public readonly id: number,
		public readonly label: string,
		public readonly associations: Associations,
	) {
		super();
	}

	setActive(state: boolean): void {
		this.active = state;
		this.shouldRepaint();
	}

	isConnected(node: SelectableNode): boolean {
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
