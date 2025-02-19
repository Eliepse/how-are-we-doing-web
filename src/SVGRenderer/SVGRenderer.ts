import type { Symbolic } from "../Engine2D/Contract/renderable";
import type { VirtualNode } from "../Engine2D/Core/VirtualNode";
import { Renderer } from "../Engine2D/Renderer/Renderer";
import type { Node2D } from "../Engine2D/Node/Node2D";
import { SymbolShape } from "../Engine2D/ValueObject/Symbolic/SymbolShape";
import { Vector } from "../Engine2D/ValueObject/Vector";
import { VirtualShape } from "../Engine2D/Node/VirtualShape";
import type { SVGNodeRenderer } from "./NodeRenderer/SVGNodeRenderer";
import type { Referencable } from "./Shape/Referencable";
import { SVGLayer } from "./SVGLayer";

type NodeDOMStore = Map<string, Element>;

export class SVGRenderer extends Renderer {
	public readonly dom: SVGElement;
	private _nodesStore = new WeakMap<Node2D, NodeDOMStore>();
	private _stats = { lastFrameTime: 0 };
	private _shapes = new Map<SymbolShape, Element>();
	private references = new Map<string, [Referencable, SVGElement]>();
	private defsDom: SVGDefsElement;
	private renderers = new Set<SVGNodeRenderer>();
	public onRender = (renderer: SVGRenderer) => undefined;
	private renderersByNode = new WeakMap<VirtualNode, SVGNodeRenderer[]>();
	private layers = new Map<number, SVGLayer>();

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

		// Setup defs container
		this.defsDom = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		this.dom.append(this.defsDom);

		// Add the canvas into the DOM
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

	public registerSymbolic(symbol: Symbolic): void {
		if (!(symbol instanceof SymbolShape) || this._shapes.has(symbol)) {
			return;
		}

		const element = symbol.getDOM();
		this.dom.append(element);
		this._shapes.set(symbol, element);
	}

	registerReferencable(reference: Referencable) {
		if (this.references.has(reference.getRefID())) {
			return;
		}

		const element = reference.getRefDOM();
		this.defsDom.append(element);
		this.references.set(reference.getRefID(), [reference, element]);
	}

	getLayer(position: number): SVGLayer {
		if (this.layers.has(position)) {
			return this.layers.get(position) as SVGLayer;
		}


		// Look for the closest layer
		let closestDelta: number | null = null, closestLayer = null;
		for (const [key, value] of this.layers.entries()) {
			const delta = position - key;

			if (null === closestDelta || Math.abs(delta) < Math.abs(closestDelta)) {
				closestLayer = value;
				closestDelta = delta;
			}
		}

		const layer = new SVGLayer();

		if (null === closestLayer || null === closestDelta) {
			// First layer inserted
			this.dom.append(layer.dom);
		} else if (closestDelta < 0) {
			closestLayer.dom.before(layer.dom);
		} else {
			closestLayer.dom.after(layer.dom);
		}

		this.layers.set(position, layer);
		return layer;
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
