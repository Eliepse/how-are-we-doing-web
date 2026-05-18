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
import { Attribute } from "../../../Engine2D/Core/Attribute";
import { Opacity } from "../../../Engine2D/ValueObject/Opacity";

export type PathologyEvents = { click: NodeEvent<Pathology> };
type Associations = { determinants: number[] };

export class Pathology extends Node2D implements WithPointerEvents {
	private time = new Attribute(0);
	public status = new Attribute<ActiveStatus | false>(false);
	static readonly maxRadius: number = 8;
	static readonly minRadius: number = 4;

	constructor(
		public readonly id: number,
		public readonly label: string,
		public readonly associations: Associations,
	) {
		super();
		this.tags.push("pathology");
		this.time.set(Math.random() * 124.134);
		this.opacity.set(new Opacity(.6));
	}

	override onProcess(deltaTime: number) {
		super.onProcess(deltaTime);
		// this.time.set((_, current) => current + deltaTime);
	}

	getRadius(): number {
		// const factor = (Math.cos(this.time.get() / 3) + 1) / 2;
		// return interpolate(Pathology.minRadius, Pathology.maxRadius, factor);
		return 6;
	}

	setStatus(status: ActiveStatus | false): void {
		this.status.set(status);
		this.opacity.set(false === status ? new Opacity(.6) : Opacity.Opaque);
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
		return new CircleCollider(this.getGlobalPosition().get(), 10);
	}


	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.time.commit();
		this.status.commit();
	}


	override shouldRerender(): boolean {
		return super.shouldRerender() || this.time.hasChanged() || this.status.hasChanged();
	}
}
