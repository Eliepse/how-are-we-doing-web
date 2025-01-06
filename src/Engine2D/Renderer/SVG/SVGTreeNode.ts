import { TreeNode } from "./TreeNode";

export class SVGTreeNode extends TreeNode {
  private _domElements = new Map<string, Element>();

  getElement(key: string): Element {
    const element = this._domElements.get(key);

    if (!(element instanceof Element)) {
      throw new Error("Element doesn't exist");
    }

    return element;
  }

  setElement(key: string, value: Element): void {
    this._domElements.set(key, value);
  }

  deleteElement(key: string): void {
    this._domElements.get(key)?.remove();
    this._domElements.delete(key);
  }
}
