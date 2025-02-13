import { Node2D } from "../../../Engine2D/Node/Node2D";
import { Angle } from "../../../Engine2D/ValueObject/Angle";
import { ArcGroup } from "../../ArcGroup";
import type { Facility } from "./Facility";

export class FacilitiesRing extends Node2D {
	constructor(groups: Array<ArcGroup<Facility>>, private radius: number) {
		super();

		groups.forEach((child) => this.addChildren(child));

		const totalFacilities = groups.reduce((sum, group) => sum + group.getChildren().length, 0);
		const stepAngle = (Math.PI * 2) / totalFacilities;
		let angle = new Angle();

		const children = this.children as unknown as ArcGroup[];
		children.forEach((group) => {
			group.setRotation(angle);
			const arc = group.getChildren().length * stepAngle;
			group.setArc(arc);
			angle = angle.add(arc);
		});
	}

	setRadius(radius: number): void {
		this.radius = radius;
		const children = this.children as unknown as ArcGroup[];
		children.forEach((child) => child.setRadius(this.radius));
	}
}
