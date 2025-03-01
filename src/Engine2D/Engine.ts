import type { WithLifecycle } from "./Contract/WithLifecycle";
import type { WithPointerEvents } from "./Contract/WithPointerEvents";
import type { Node2D } from "./Node/Node2D";
import { Vector } from "./ValueObject/Vector";
import { Clock } from "./Core/Clock";
import { VirtualNode } from "./Core/VirtualNode";
import { NodeEvent } from "./Core/NodeEvent";
import { VirtualTree } from "./Core/VirtualTree";
import type { Renderer } from "./Renderer/Renderer";

export type EngineMouseEvent = { cursor: Vector };
type Listener<TEvent extends object> = (event: TEvent) => void;
type Listeners = {
	mousemove: Listener<EngineMouseEvent>;
	click: Listener<EngineMouseEvent>;
};

export class Engine<TRenderer extends Renderer> {
	private readonly tree: VirtualTree;
	private clock: Clock;
	private _lifecycleCallbacks = new WeakMap<Node2D, () => void>();
	private _listeners = {
		mousemove: new Set<Listeners["mousemove"]>(),
		click: new Set<Listeners["click"]>(),
	};
	private _pointerEventsNodes = new Set<Node2D & WithPointerEvents>();
	private _hoveredNodes = new Set<Node2D & WithPointerEvents>();

	constructor(
		private rootNode: Node2D,
		private renderer: TRenderer,
	) {
		this.clock = new Clock(60, (delta, frames) => this.clockTick(delta, frames));

		this.tree = new VirtualTree(this.rootNode);
		this.tree.onMount = (vnode) => this.handleOnMount(vnode);
		this.tree.onUnmount = (vnode) => this.handleOnUnmount(vnode);

		this.addEventListener("click", (e) => this.propagateClick(e.cursor));
		this.addEventListener("mousemove", (e) => this.handleMouseMove(e.cursor));
		document.addEventListener("mousemove", (e) => {
			this.dispatchEvent("mousemove", {
				cursor: this.renderer.windowToLocalPoint(new Vector(e.clientX, e.clientY)),
			});
		});
		document.addEventListener("click", (e) => {
			this.dispatchEvent("click", {
				cursor: this.renderer.windowToLocalPoint(new Vector(e.clientX, e.clientY)),
			});
		});
	}

	get root(): Node2D {
		return this.rootNode;
	}

	getRenderer(): TRenderer {
		return this.renderer;
	}

	private handleOnMount(vnode: VirtualNode<Node2D & Partial<WithLifecycle & WithPointerEvents>>): void {
		const node = vnode.node;
		const callback = node.onMount ? node.onMount(this) : undefined;

		if ("function" === typeof callback) {
			this._lifecycleCallbacks.set(node, callback);
		}

		if (undefined !== node.getPointerCollider) {
			this._pointerEventsNodes.add(node as Node2D & WithPointerEvents);
		}

		this.renderer.mountNode(vnode);
	}

	private handleOnUnmount(vnode: VirtualNode<Node2D & Partial<WithLifecycle & WithPointerEvents>>): void {
		const node = vnode.node;
		const callback = this._lifecycleCallbacks.get(node);

		callback && callback();

		if (undefined !== node.getPointerCollider) {
			this._pointerEventsNodes.delete(node as Node2D & WithPointerEvents);
		}

		this.renderer.unmountNode(vnode);
	}

	private renderRecursive(vnode: VirtualNode<Node2D & Partial<WithLifecycle>>, deltaTime: number, frames: number): void {
		this.renderer.renderNode(vnode, deltaTime, frames);

		// Lifecycle aware node
		vnode.node.onRender && vnode.node.onRender(deltaTime);

		// Render children
		vnode.children.forEach((child) => this.renderRecursive(child, deltaTime, frames));
	}

	addEventListener<TKey extends keyof Listeners>(
		event: TKey,
		callback: Listeners[TKey],
	): () => void {
		this._listeners[event].add(callback);
		return () => this.removeEventListener(event, callback);
	}

	removeEventListener<TKey extends keyof Listeners>(
		event: TKey,
		callback: Listeners[TKey],
	): void {
		this._listeners[event].delete(callback);
	}

	dispatchEvent<TKey extends keyof Listeners>(
		event: TKey,
		...params: Parameters<Listeners[TKey]>
	): void {
		// @ts-ignore
		this._listeners[event].forEach((listener) => listener(...params));
	}

	private propagateClick(cursor: Vector): void {
		for (const node of this._pointerEventsNodes) {
			if (false === node.getPointerCollider().isInside(cursor)) {
				continue;
			}

			// Stop at first match
			node.dispatchEvent(new NodeEvent("click", node));
			return;
		}

		// Fallback to root node if none match
		this.rootNode.dispatchEvent(new NodeEvent("click"));
	}

	private handleMouseMove(cursor: Vector): void {
		for (const node of this._pointerEventsNodes) {
			const hovering = node.getPointerCollider().isInside(cursor);
			const nodeHovered = this._hoveredNodes.has(node);

			if (hovering && false === nodeHovered) {
				this._hoveredNodes.add(node);
				node.dispatchEvent(new NodeEvent("mouseenter", node));
				continue;
			}

			if (false === hovering && nodeHovered) {
				this._hoveredNodes.delete(node);
				node.dispatchEvent(new NodeEvent("mouseleave", node));
			}
		}
	}

	private clockTick(deltaTime: number, frames: number): void {
		if (undefined === this.tree) {
			throw new Error("The tree has not been constructed");
		}

		this.tree.update();
		this.renderRecursive(this.tree.getVRoot(), deltaTime, frames);
	}

	isHovering(node: Node2D & WithPointerEvents): boolean {
		return this._hoveredNodes.has(node);
	}

	getHovering(): Array<Node2D & WithPointerEvents> {
		return Array.from(this._hoveredNodes.values());
	}

	start(): void {
		this.clock.start();
	}

	pause(): void {
		this.clock.pause();
	}

	render(): void {
		this.clock.update();
	}
}
