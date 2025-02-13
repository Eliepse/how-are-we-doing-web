import type { Symbolic } from "../Engine2D/Contract/renderable";
import type { VirtualNode } from "../Engine2D/Core/VirtualNode";
import { Renderer } from "../Engine2D/Renderer/Renderer";
import type { Node2D } from "../Engine2D/Node/Node2D";
import { SymbolShape } from "../Engine2D/ValueObject/Symbolic/SymbolShape";
import { Vector } from "../Engine2D/ValueObject/Vector";
import { VirtualShape } from "../Engine2D/Node/VirtualShape";
import type { SVGNodeRenderer } from "./NodeRenderer/SVGNodeRenderer";

type NodeDOMStore = Map<string, Element>;

export class SVGRenderer extends Renderer {
	public readonly dom: SVGElement;
	private _nodesStore = new WeakMap<Node2D, NodeDOMStore>();
	private _stats = { lastFrameTime: 0 };
	private _shapes = new Map<SymbolShape, Element>();
	private renderers = new Set<SVGNodeRenderer>();
	public onRender = (renderer: SVGRenderer) => undefined;
	private renderersByNode = new WeakMap<VirtualNode, SVGNodeRenderer[]>();

	constructor(
		public readonly key: string,
		private _container: Element,
		public readonly size: Vector,
		private debug: boolean = false,
	) {
		super();

		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const w = this.size.x.toFixed();
		const h = this.size.y.toFixed();
		this.dom.setAttribute("viewBox", `0 0 ${w} ${h}`);
		this.dom.id = this.key;
		this._container.append(this.dom);
	}

	addNodeRenderer(renderer: SVGNodeRenderer): void {
		this.renderers.add(renderer);
	}

	override mountNode(vnode: VirtualNode): void {
		if (vnode.node instanceof VirtualShape) {
			this.registerSymbolic(vnode.node.getShape());
		}

		const renderers: SVGNodeRenderer[] = [];

		this.renderers.forEach((nodeRenderer) => {
			if (false === nodeRenderer.accepts(vnode)) {
				return;
			}

			renderers.push(nodeRenderer);
		});

		this.renderersByNode.set(vnode, renderers);
	}

	override renderNode(vnode: VirtualNode): void {
		this.renderersByNode.get(vnode)?.forEach((renderer) => renderer.render(vnode));
	}

	override unmountNode(vnode: VirtualNode): void {
		// Remove all associated DOM element from the DOM
		this._nodesStore.get(vnode.node)?.forEach((element: Element) => element.remove());
		this.renderersByNode.delete(vnode);
	}

	private registerSymbolic(shape: Symbolic): void {
		if (!(shape instanceof SymbolShape) || this._shapes.has(shape)) {
			return;
		}

		const element = shape.getDOM();
		this.dom?.append(element);
		this._shapes.set(shape, element);
	}

	hasDOM(node: VirtualNode, key: string): boolean {
		return Boolean(this._nodesStore.get(node.node)?.has(key));
	}

	getDOM<TElement extends Element>(
		node: VirtualNode,
		key: string,
		fallback: (dom: SVGElement) => TElement,
		appendToDOM = false,
	): TElement {
		let nodeStore: NodeDOMStore | undefined = this._nodesStore.get(node.node);
		let value = nodeStore?.get(key) as TElement | undefined;

		if (undefined !== value) {
			return value;
		}

		if (undefined === nodeStore) {
			nodeStore = new Map<string, Element>();
			this._nodesStore.set(node.node, nodeStore);
		}

		value = fallback(this.dom);
		nodeStore.set(key, value);

		if (appendToDOM) {
			this.dom.append(value);
		}

		return value;
	}

	removeDOM(node: VirtualNode, key: string): void {
		this.getDOMUnsafe(node, key)?.remove();
		this._nodesStore.get(node.node)?.delete(key);
	}

	getDOMUnsafe<TElement extends Element>(node: VirtualNode, key: string): TElement | undefined {
		return this._nodesStore.get(node.node)?.get(key) as TElement | undefined;
	}

	localPointToWindow(point: Vector): Vector {
		const bbox = this.dom.getBoundingClientRect();
		const scaleFactor = new Vector(this.size.x / bbox.width, this.size.y / bbox.height);
		return new Vector(bbox.x + point.x / scaleFactor.x, bbox.y + point.y / scaleFactor.y);
	}

	windowToLocalPoint(point: Vector): Vector {
		const bbox = this.dom.getBoundingClientRect();
		const scaleFactor = new Vector(this.size.x / bbox.width, this.size.y / bbox.height);
		return new Vector((point.x - bbox.x) * scaleFactor.x, (point.y - bbox.y) * scaleFactor.y);
	}

	isDebug(): boolean {
		return this.debug;
	}
}
