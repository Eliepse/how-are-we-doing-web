import type { Collider } from "../../../Engine2D/Physic/Collider";
import type { WithPointerEvents } from "../../../Engine2D/Contract/WithPointerEvents";
import { CircleCollider } from "../../../Engine2D/Physic/CircleCollider";
import { NodeEvent } from "../../../Engine2D/Core/NodeEvent";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import { type SelectableNode } from "../../Diagram";
import { Determinant } from "../Determinant/Determinant";
import { Facility } from "../Facility/Facility";
import { interpolate } from "../../../helpers";
import type { ActiveStatus } from "../../types";

export type PathologyEvents = { click: NodeEvent<Pathology> };
type Associations = { determinants: number[] };

export class Pathology extends Node2D implements WithPointerEvents {
	public active: ActiveStatus | false = false;
	private time: number = 0;
	static readonly maxRadius: number = 8;
	static readonly minRadius: number = 4;

	constructor(
		public readonly id: number,
		public readonly label: string,
		public readonly associations: Associations,
	) {
		super();

		this.time = Math.random() * 124.134;
		this.shouldRepaint();
	}

	override onProcess(deltaTime: number) {
		super.onProcess(deltaTime);

		this.time += deltaTime;
	}

	getRadius(): number {
		const factor = (Math.cos(this.time / 3) + 1) / 2;
		return interpolate(Pathology.minRadius, Pathology.maxRadius, factor);
	}

	setActive(status: ActiveStatus | false): void {
		if (this.active === status) {
			return;
		}

		this.active = status;
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
