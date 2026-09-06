import { type Angle } from "../../../Engine2D/ValueObject/Angle";
import { ArcGroup } from "../../ArcGroup";
import { type Determinant } from "./Determinant";
import { Attribute } from "../../../Engine2D/Core/Attribute";
import { Opacity } from "../../../Engine2D/ValueObject/Opacity";

export class DeterminantSubFamily extends ArcGroup<Determinant> {
	protected decorationOpacity = new Attribute(Opacity.Opaque, Opacity.isDiff);

	constructor(name: string, determinants: Array<Determinant>, arc: Angle, radius: number) {
		super(name, determinants, arc, radius);
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

	getTorusWidth(): number {
		return 120;
	}
}
