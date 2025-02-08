import { Element2D } from "../Engine2D/Contract/renderable";
import { Node2D } from "../Engine2D/Node/Node2D";

export class Group<T extends Element2D = Element2D> extends Node2D {
  constructor(children: Array<T>) {
    super();
    children.forEach((child) => this.addChildren(child));
  }

  size(): number {
    return this.children.length;
  }
}
