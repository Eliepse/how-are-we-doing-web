import type { Symbolic } from "./Contract/renderable";
import { Angle } from "./Parameters/Angle";
import { Vector } from "./Vector";

export class SymbolAsset implements Symbolic {
  constructor(private href: string, private pivot: Vector = Vector.Zero) {}

  getPivot(): Vector {
    return this.pivot;
  }

  getHref(): string {
    return this.href;
  }

  getAngle(): Angle {
    return Angle.Zero;
  }
}
