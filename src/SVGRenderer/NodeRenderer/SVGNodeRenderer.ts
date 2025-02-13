import { type VirtualNode } from "../../Engine2D/Core/VirtualNode";
import type { Engine } from "../../Engine2D/Engine";
import { ShapeCollection } from "../ValueObject/ShapeCollection";
import type { SVGRenderer } from "../SVGRenderer";

export abstract class SVGNodeRenderer {
	private shapesByVNode = new WeakMap<VirtualNode, ShapeCollection>();

	constructor(protected _renderer: SVGRenderer, protected engine: Engine) {
	}

	getShapes(vnode: VirtualNode): ShapeCollection {
		let collection = this.shapesByVNode.get(vnode);

		if (undefined === collection) {
			collection = new ShapeCollection();
			this.shapesByVNode.set(vnode, collection);
		}

		return collection;
	}

	abstract render(engineNode: VirtualNode): void;

	abstract accepts(engineNode: VirtualNode): boolean;
}