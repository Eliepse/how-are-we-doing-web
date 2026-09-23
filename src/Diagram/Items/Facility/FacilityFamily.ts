import { ArcGroup } from "../../ArcGroup";
import { Angle } from "../../../Engine2D/ValueObject/Angle";
import { Node2D } from "../../../Engine2D/Node/Node2D";
import { Attribute } from "../../../Engine2D/Core/Attribute";
import { Opacity } from "../../../Engine2D/ValueObject/Opacity";

export class FacilityFamily<T extends Node2D = Node2D> extends ArcGroup {
	protected decorationOpacity = new Attribute(Opacity.Opaque, Opacity.isDiff);

	constructor(name: string, children: Array<T>, arc: Angle, radius: number = 100, show: boolean = true) {
		super(name, children, arc, radius, show);
	}

	override onRendered(_deltaTime: number) {
		this.decorationOpacity.commit();
		super.onRendered(_deltaTime);
	}

	override shouldRerender(): boolean {
		if (this.decorationOpacity.hasChanged()) {
			return true;
		}

		return super.shouldRerender();
	}

	getDecorationOpacity() {
		return this.decorationOpacity;
	}

	setDecorationOpacity(value: Opacity) {
		this.decorationOpacity.set(value);
	}
}
