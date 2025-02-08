import type { Symbolic } from "../../Contract/renderable";
import type { EngineNode } from "../../Core/EngineNode";
import type { NodeRenderer } from "../NodeRenderer";
import { Renderer } from "../Renderer";
import type { Node2D } from "../../Node/Node2D";
import { SymbolShape } from "../../SymbolShape";
import { Vector } from "../../Vector";
import { VirtualShape } from "../../Node/VirtualShape";
import { FallbackRenderer } from "./NodeRenderer/FallbackRenderer";

type NodeDOMStore = Map<string, Element>;

export class SVGRenderer extends Renderer {
	private _dom: SVGElement;
	private _nodesStore = new WeakMap<Node2D, NodeDOMStore>();
	private _stats = { lastFrameTime: 0 };
	private _shapes = new Map<SymbolShape, Element>();
	private _renderers = new Set<NodeRenderer<SVGRenderer>>();
	public onRender = (renderer: SVGRenderer) => undefined;

	constructor(
		public readonly key: string,
		private _container: Element,
		root: Node2D,
		public readonly size: Vector,
		private debug: boolean = false,
	) {
		super(root);

		this._dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const w = this.size.x.toFixed();
		const h = this.size.y.toFixed();
		this._dom.setAttribute("viewBox", `0 0 ${w} ${h}`);
		this._dom.id = this.key;
		this._container.append(this._dom);

		this._renderers.add(new FallbackRenderer(this));

		document.addEventListener("mousemove", (e) => {
			this._engine.dispatchEvent("mousemove", {
				cursor: this.windowToLocalPoint(new Vector(e.clientX, e.clientY)),
			});
		});

		document.addEventListener("click", (e) => {
			this._engine.dispatchEvent("click", {
				cursor: this.windowToLocalPoint(new Vector(e.clientX, e.clientY)),
			});
		});
	}

	addNodeRenderer(renderer: NodeRenderer<SVGRenderer>): void {
		this._renderers.add(renderer);
	}

	override mountNode(node: EngineNode): void {
		if (node.node instanceof VirtualShape) {
			this.registerSymbolic(node.node.getShape());
		}
	}

	override renderNode(node: EngineNode): void {
		this._renderers.forEach((nodeRenderer) => {
			if (false === nodeRenderer.accepts(node)) {
				return;
			}

			nodeRenderer.render(node);
		});
	}

	override unmountNode(engineNode: EngineNode): void {
		// Remove all associated DOM element from the DOM
		this._nodesStore.get(engineNode.node)?.forEach((element: Element) => element.remove());
	}

	private registerSymbolic(shape: Symbolic): void {
		if (!(shape instanceof SymbolShape) || this._shapes.has(shape)) {
			return;
		}

		const element = shape.getDOM();
		this._dom?.append(element);
		this._shapes.set(shape, element);
	}

	hasDOM(node: EngineNode, key: string): boolean {
		return Boolean(this._nodesStore.get(node.node)?.has(key));
	}

	getDOM<TElement extends Element>(
		node: EngineNode,
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

		value = fallback(this._dom);
		nodeStore.set(key, value);

		if (appendToDOM) {
			this._dom.append(value);
		}

		return value;
	}

	removeDOM(node: EngineNode, key: string): void {
		this.getDOMUnsafe(node, key)?.remove();
		this._nodesStore.get(node.node)?.delete(key);
	}

	getDOMUnsafe<TElement extends Element>(node: EngineNode, key: string): TElement | undefined {
		return this._nodesStore.get(node.node)?.get(key) as TElement | undefined;
	}

	override render(): void {
		const startedAt = Date.now();
		super.render();
		this._stats.lastFrameTime = Date.now() - startedAt;
		this.onRender(this);
	}

	localPointToWindow(point: Vector): Vector {
		const bbox = this._dom.getBoundingClientRect();
		const scaleFactor = new Vector(this.size.x / bbox.width, this.size.y / bbox.height);
		return new Vector(bbox.x + point.x / scaleFactor.x, bbox.y + point.y / scaleFactor.y);
	}

	windowToLocalPoint(point: Vector): Vector {
		const bbox = this._dom.getBoundingClientRect();
		const scaleFactor = new Vector(this.size.x / bbox.width, this.size.y / bbox.height);
		return new Vector((point.x - bbox.x) * scaleFactor.x, (point.y - bbox.y) * scaleFactor.y);
	}

	isDebug(): boolean {
		return this.debug;
	}

	getLastFrameTime(): number {
		return this._stats.lastFrameTime;
	}

	getEngine() {
		return this._engine;
	}
}
