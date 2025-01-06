import type { Element2D } from "../../Contract/renderable";

export class TreeNode<TNode extends Element2D = Element2D> {
  private _children = new Set<TreeNode>();

  constructor(private _element: TNode, private _parent?: TreeNode) {
    _element.getChildren().forEach((child) => this._children.add(new TreeNode(child, this)));
  }

  get element() {
    return this._element;
  }

  get children() {
    return this._children;
  }

  get parent() {
    return this._parent;
  }
}
