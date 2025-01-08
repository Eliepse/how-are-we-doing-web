import { VirtualShape } from "../../../Engine2D/VirtualShape";
import { facilityShape } from "./shapes";

export class Facility extends VirtualShape {
	public active = false;

	constructor() {
		super(facilityShape);
	}

	setActive(value: boolean): void {
		if (value === this.active) {
			return;
		}

		this.active = value;
	}
}
