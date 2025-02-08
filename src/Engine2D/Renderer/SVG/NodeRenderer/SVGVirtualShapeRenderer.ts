import { Config } from "../../../../config";
import { VirtualShape } from "../../../Node/VirtualShape";
import { TreeNode } from "../TreeNode";
import { SVGNodeRenderer } from "./SVGNodeRenderer";

export class SVGVirtualShapeRenderer extends SVGNodeRenderer<VirtualShape> {
	override create(): void {
		super.create();
		const element = document.createElementNS("http://www.w3.org/2000/svg", "use");
		element.setAttributeNS(
			"http://www.w3.org/1999/xlink",
			"xlink:href",
			this.node.element.getShape().getHref()
		);

		this.elements.set("root", element);
		this.getContainer()?.append(element);
	}

	override update(): void {
		super.update();

		const root = this.elements.get("root");

		if (undefined === root) {
			throw new Error("Root node missing");
		}

		const element = this.node.element;
		const shape = element.getShape();

		const position = element.getGlobalPosition().sub(shape.getPivot()).toAttributes();
		const transformPivot = element.getGlobalPosition().toAttributes();
		const degrees = element
			.getGlobalRotation()
			.add(shape.getAngle())
			.deg.toFixed(Config.Render.precision);

		root.setAttribute("x", position.x);
		root.setAttribute("y", position.y);
		root.setAttribute(
			"transform",
			`rotate(${degrees}, ${transformPivot.x}, ${transformPivot.y})`
		);

		// if (null !== this.clip) {
		//   this.element.setAttribute("clip-path", this.clip.toString());
		// } else {
		//   this.element.removeAttribute("clip-path");
		// }
	}

	static override accepts(node: TreeNode): boolean {
		return node.element instanceof VirtualShape;
	}
}
