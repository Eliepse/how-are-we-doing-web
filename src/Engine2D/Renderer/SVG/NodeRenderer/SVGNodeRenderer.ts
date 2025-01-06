import { Config } from "../../../../config";
import type { Element2D } from "../../../Contract/renderable";
import { TreeNode } from "../TreeNode";

export abstract class SVGNodeRenderer<TNode extends Element2D = Element2D> {
	protected elements = new Map<string, SVGElement>();

	constructor(
		protected node: TreeNode<TNode>,
		protected _parent?: SVGNodeRenderer,
		protected _container?: SVGElement
	) {}

	create(): void {
		if (false === Config.Render.debug) {
			return;
		}

		const pivot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		pivot.setAttribute("cx", "0");
		pivot.setAttribute("cy", "0");
		pivot.setAttribute("r", "2");
		pivot.setAttribute("stroke", "#ff0000");
		pivot.setAttribute("fill", "#ffffff");
		this.elements.set("debug:pivot", pivot);
		this.getContainer()?.append(pivot);
	}

	update(): void {
		if (false === Config.Render.debug) {
			return;
		}

		const position = this.node.element.getGlobalPosition().toAttributes();
		const pivot = this.elements.get("debug:pivot");
		pivot?.setAttribute("cx", position.x);
		pivot?.setAttribute("cy", position.y);
	}

	delete(): void {
		this.elements.forEach((element) => element.remove());
		this.elements.clear();
	}

	get parent() {
		return this._parent;
	}

	getContainer(): SVGElement | undefined {
		return this._container ?? this.parent?.getContainer();
	}

	static accepts(node: TreeNode): boolean {
		throw new Error("Not implemented");
	}
}
