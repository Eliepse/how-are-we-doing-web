import { Node2D } from "../../../Engine2D/Node2D";
import type { DeterminantFamily } from "./DeterminantFamily";

export class DeterminantsRing extends Node2D {
	constructor(families: Array<DeterminantFamily>) {
		super();

		families.forEach((child) => this.addChildren(child));
	}
}
