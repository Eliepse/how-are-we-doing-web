import { Node2D } from "../../../Engine2D/Node/Node2D";
import { Attribute } from "../../../Engine2D/Core/Attribute";

type Status = "selected" | "preview";

export class Link extends Node2D {
	private _hidden = new Attribute(false);
	public bidirectional = false;
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
}