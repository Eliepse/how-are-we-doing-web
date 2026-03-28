import { ArcGroup } from "../../ArcGroup";
import { Angle } from "../../../Engine2D/ValueObject/Angle";
import { Opacity } from "../../../Engine2D/ValueObject/Opacity";
import { Node2D } from "../../../Engine2D/Node/Node2D";

export class FacilityFamily<T extends Node2D = Node2D> extends ArcGroup {
	constructor(
		name: string,
		children: Array<T>,
		arc: Angle,
		radius: number = 100,
		show: boolean = true,
	) {
		super(name, children, arc, radius, show);
		this.opacity.set(new Opacity(.6));
	}

}
