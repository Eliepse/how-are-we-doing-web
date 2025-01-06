import type { Parameter } from "../Contract/Parameter";
import { Vector } from "../Vector";

export class Size implements Parameter {
  private value: Vector;

  constructor(width: number, height: number) {
    this.value = new Vector(width, height);
  }

  get width(): number {
    return this.value.x;
  }

  get height(): number {
    return this.value.y;
  }

  isEqual(parameter: Parameter): boolean {
    return parameter instanceof Size && parameter.value.isEqual(this.value);
  }
}
