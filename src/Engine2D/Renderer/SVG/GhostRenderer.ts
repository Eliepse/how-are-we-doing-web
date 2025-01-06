import { SVGNodeRenderer } from "./NodeRenderer/SVGNodeRenderer";
import { TreeNode } from "./TreeNode";

export class GhostRenderer extends SVGNodeRenderer {
  static override accepts(node: TreeNode): boolean {
    return true;
  }
}
