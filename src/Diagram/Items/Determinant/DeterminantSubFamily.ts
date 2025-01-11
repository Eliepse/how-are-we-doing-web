import type { Angle } from "../../../Engine2D/Parameters/Angle";
import { ArcGroup } from "../../ArcGroup";
import type { Determinant } from "./Determinant";

export class DeterminantSubFamily extends ArcGroup<Determinant> {
	constructor(name: string, determinants: Array<Determinant>, arc: Angle, radius: number) {
		super(name, determinants, arc, radius);
	}

	getTorusWidth(): number {
		return 120;
	}
}
