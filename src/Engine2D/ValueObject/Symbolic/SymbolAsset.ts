import type { Symbolic } from "../../Contract/renderable";
import { Angle } from "../Angle";
import { Vector } from "../Vector";

export class SymbolAsset implements Symbolic {
	private readonly size: Vector;
	private readonly pivot: Vector;

	constructor(private href: string, size: Vector, pivot?: Vector) {
		this.pivot = pivot ?? size.div(2);
		this.size = size;
	}

	getPivot(): Vector {
		return this.pivot;
	}

	getSize(): Vector {
		return this.size;
	}

	getHref(): string {
		return this.href;
	}

	getAngle(): Angle {
		return Angle.Zero;
	}
}
