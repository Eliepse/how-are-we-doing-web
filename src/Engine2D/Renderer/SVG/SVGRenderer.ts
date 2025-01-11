import type { Symbolic } from "../../Contract/renderable";
import type { EngineNode } from "../../Core/EngineNode";
import type { NodeRenderer } from "../../Core/NodeRenderer";
import { Renderer } from "../../Core/Renderer";
import type { Node2D } from "../../Node2D";
import type { Size } from "../../Parameters/Size";
import { SymbolShape } from "../../SymbolShape";
import { Vector } from "../../Vector";
import { VirtualShape } from "../../VirtualShape";
import { FallbackRenderer } from "./NodeRenderer/FallbackRenderer";

type NodeDOMStore = Map<string, Element>;

export class SVGRenderer extends Renderer {
	private _dom: SVGElement;
	private _nodesStore = new WeakMap<Node2D, NodeDOMStore>();
	private _stats = { lastFrameTime: 0 };
	private _shapes = new Map<SymbolShape, Element>();
	private _renderers = new Set<NodeRenderer<SVGRenderer>>();

	constructor(
		private _container: Element,
		root: Node2D,
		private size: Size,
		private debug: boolean = false,
	) {
		super(root);

		this._dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const w = this.size.width.toFixed();
		const h = this.size.height.toFixed();
		this._dom.setAttribute("viewBox", `0 0 ${w} ${h}`);
		this._container.append(this._dom);

		this._renderers.add(new FallbackRenderer(this));

		const correctCursorPosition = (position: Vector): Vector => {
			const bbox = this._dom.getBoundingClientRect();
			return position
				.sub(new Vector(bbox.x, bbox.y))
				.mul(new Vector(size.width / bbox.width, size.height / bbox.height));
		};

		document.addEventListener("mousemove", (e) => {
			this._engine.dispatchEvent("mousemove", {
				cursor: correctCursorPosition(new Vector(e.clientX, e.clientY)),
			});
		});

		document.addEventListener("click", (e) => {
			this._engine.dispatchEvent("click", {
				cursor: correctCursorPosition(new Vector(e.clientX, e.clientY)),
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

	getDOMUnsafe<TElement extends Element>(node: EngineNode, key: string): TElement | undefined {
		return this._nodesStore.get(node.node)?.get(key) as TElement | undefined;
	}

	override render(): void {
		const startedAt = Date.now();
		super.render();
		this._stats.lastFrameTime = Date.now() - startedAt;
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
