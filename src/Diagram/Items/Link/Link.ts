import { Node2D } from "../../../Engine2D/Node/Node2D";
import { Attribute } from "../../../Engine2D/Core/Attribute";
import { Dir, type Direction } from "../../AssociationManager";
import { Pathology } from "../Pathology/Pathology";

type Status = "selected" | "preview";

export class Link extends Node2D {
	private _hidden = new Attribute(false);
	public direction: Direction = Dir.Bidirectional;
	public readonly status = new Attribute<Status>("selected");

	constructor(
		public readonly from: Node2D,
		public readonly to: Node2D,
		public readonly key: string,
	) {
		super();
	}

	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this._hidden.commit();
		this.status.commit();
	}

	override shouldRerender(): boolean {
		const hasPathology = this.from instanceof Pathology || this.to instanceof Pathology;
		if (hasPathology && false === this._hidden.get()) {
			return true;
		}

		return super.shouldRerender() || this._hidden.hasChanged() || this.status.hasChanged();
	}

	get hidden() {
		return this._hidden.get();
	}

	show() {
		this._hidden.set(false);
	}

	hide() {
		this._hidden.set(true);
	}

	/**
	 * Return the source of the link according to the direction
	 */
	getSource() {
		if (Dir.Source === this.direction) {
			return this.to;
		}

		return this.from;
	}

	/**
	 * Return the destination of the link according to the direction
	 */
	getDestination() {
		if (Dir.Source === this.direction) {
			return this.from;
		}

		return this.to;
	}
}