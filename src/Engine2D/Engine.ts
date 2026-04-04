import type { WithLifecycle } from "./Contract/WithLifecycle";
import type { WithPointerEvents } from "./Contract/WithPointerEvents";
import type { Node2D } from "./Node/Node2D";
import { Vector } from "./ValueObject/Vector";
import { Clock } from "./Time/Clock";
import { VirtualNode } from "./Core/VirtualNode";
import { NodeEvent } from "./Core/NodeEvent";
import { VirtualTree } from "./Core/VirtualTree";
import type { Renderer } from "./Renderer/Renderer";
import type { Transition } from "./Time/Transition";

export type EngineMouseEvent = { cursor: Vector };
type Listener<TEvent extends object> = (event: TEvent) => void;
type Listeners = {
	mousemove: Listener<EngineMouseEvent>;
	click: Listener<EngineMouseEvent>;
};
type ValueOf<T> = T[keyof T];

export class Engine<TRenderer extends Renderer = Renderer> {
	private readonly tree: VirtualTree;
	private clock: Clock;
	private _lifecycleCallbacks = new WeakMap<Node2D, () => void>();
	private _listeners = {
		mousemove: new Set<Listeners["mousemove"]>(),
		click: new Set<Listeners["click"]>(),
	};
	private _pointerEventsNodes = new Set<Node2D & WithPointerEvents>();
	private _hoveredNodes = new Set<Node2D & WithPointerEvents>();
	private static transitions = new Set<Transition>();

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
		const skipCheck: (Node2D & WithPointerEvents)[] = [];

		for (const hoveredNodes of this._hoveredNodes) {
			// Still hovering
			if (hoveredNodes.getPointerCollider().isInside(cursor)) {
				continue;
			}

			// Handle not hovering anymore
			skipCheck.push(hoveredNodes);
			this._hoveredNodes.delete(hoveredNodes);
			hoveredNodes.dispatchEvent(new NodeEvent("mouseleave", hoveredNodes));
		}

		for (const node of this._pointerEventsNodes) {
			// Prevent re-checking node that has already been checked for "mouseleave"
			if (skipCheck.includes(node)) {
				continue;
			}

			// Not hovering
			if (false === node.getPointerCollider().isInside(cursor)) {
				continue;
			}

			// Handle hovering
			this._hoveredNodes.add(node);
			node.dispatchEvent(new NodeEvent("mouseenter", node));
		}
	}

	private clockTick(deltaTime: number, frames: number): void {
		if (undefined === this.tree) {
			throw new Error("The tree has not been constructed");
		}

		this.tree.update();

		// "for" loop prevent long callstack caused by recursive calls
		for (const vnode of this.tree.getNodes()) {
			// Trigger onProcess method
			vnode.node.onProcess(deltaTime);

			// Trigger render if needed
			if (vnode.node.shouldRerender()) {
				this.renderer.renderNode(vnode, deltaTime, frames);
				vnode.node.onRendered(deltaTime);
			}
		}

		// Process transitions
		for (const transition of Engine.transitions) {
			transition.tick();

			if (transition.finished) {
				Engine.transitions.delete(transition);
			}
		}
	}

	public static registerTransition(transition: Transition) {
		Engine.transitions.add(transition);
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
