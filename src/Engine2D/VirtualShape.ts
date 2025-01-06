import type { Symbolic } from "./Contract/renderable";
import { Node2D } from "./Node2D";

export class VirtualShape extends Node2D {
  constructor(private _shape: Symbolic) {
    super();
  }

  getShape(): Symbolic {
    return this._shape;
  }
}
