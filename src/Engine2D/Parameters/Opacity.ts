import { Parameter } from "./Parameter";

export class Opacity implements Parameter {
  constructor(private value: number = 1) {}

  isEqual(parameter: Parameter): boolean {
    return parameter instanceof Opacity && parameter.value === this.value;
  }
}
