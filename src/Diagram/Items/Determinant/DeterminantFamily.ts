import { Node2D } from "../../../Engine2D/Node2D";
import type { DeterminantSubFamily } from "./DeterminantSubFamily";

export class DeterminantFamily extends Node2D {
	constructor(subFamilies: Array<DeterminantSubFamily>) {
		super();
		subFamilies.forEach((subFamily) => this.addChildren(subFamily));
	}
}
