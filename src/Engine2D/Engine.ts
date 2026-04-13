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
// type ValueOf<T> = T[keyof T];
type DebugProfile = {
	nodesCount: number;
	nodesMounted: number;
	nodesUnmounted: number;
	nodesRendered: number;
	nodesSkippedRender: number;
	frames: number;
	frameTime: number;
	fps: number;
	transitionsCount: number;
};
type OnTickClb = (engine: Engine, profile: DebugProfile) => void;

export class Engine<TRenderer extends Renderer = Renderer> {
	private static _instance: Engine;
	public static onTicked: OnTickClb = () => undefined;

	private readonly tree: VirtualTree;
	private readonly _nodeByUname = new Map<string, Node2D>();
	private readonly _nodesByTag = new Map<string, Set<Node2D>>();
	private clock: Clock;
	private _lifecycleCallbacks = new WeakMap<Node2D, () => void>();
	private _listeners = {
		mousemove: new Set<Listeners["mousemove"]>(),
		click: new Set<Listeners["click"]>(),
	};
	private _pointerEventsNodes = new Set<Node2D & WithPointerEvents>();
	private _hoveredNodes = new Set<Node2D & WithPointerEvents>();
	private transitions = new Set<Transition>();

	private _debug = false;
	private _profile: DebugProfile = {
		nodesCount: 0,
		nodesMounted: 0,
		nodesUnmounted: 0,
		nodesRendered: 0,
		nodesSkippedRender: 0,
		frames: 0,
		frameTime: 0,
		fps: 0,
		transitionsCount: 0,
	};

	private constructor(
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

	static get root(): Node2D {
		return Engine._instance.rootNode;
	}

	static getRenderer<T extends Renderer>() {
		return Engine._instance.renderer as T;
	}

	private handleOnMount(vnode: VirtualNode<Node2D & Partial<WithPointerEvents>>): void {
		const node = vnode.node;

		if (undefined !== node.uname) {
			if (Engine._instance._nodeByUname.has(node.uname)) {
				console.warn(`Non-unique uname: ${node.uname}. Two nodes shouldn't share the same uname. Previous occurence is replaced.`);
			}

			Engine._instance._nodeByUname.set(node.uname, node);
		}

		node.tags.forEach((tag) => {
			const store = Engine._instance._nodesByTag.get(tag);

			if (store) {
				store.add(node);
				return;
			}

			Engine._instance._nodesByTag.set(tag, new Set([node]));
		});

		const callback = node.onMount ? node.onMount(this) : undefined;

		if ("function" === typeof callback) {
			this._lifecycleCallbacks.set(node, callback);
		}

		if (undefined !== node.getPointerCollider) {
			this._pointerEventsNodes.add(node as Node2D & WithPointerEvents);
		}

		this.renderer.mountNode(vnode);

		if (Engine.debug) {
			this._profile.nodesMounted++;
		}
	}

	private handleOnUnmount(vnode: VirtualNode<Node2D & Partial<WithPointerEvents>>): void {
		const node = vnode.node;
		const callback = this._lifecycleCallbacks.get(node);

		callback && callback();

		if (undefined !== node.getPointerCollider) {
			this._pointerEventsNodes.delete(node as Node2D & WithPointerEvents);
		}

		this.renderer.unmountNode(vnode);

		if (undefined !== node.uname) {
			if (false === Engine._instance._nodeByUname.has(node.uname)) {
				console.warn(`Undefined unique node: ${node.uname}. The uname doesn't match any node in the engine's store. Did it changed? Beware of memory leaks!`);
			}

			Engine._instance._nodeByUname.delete(node.uname);
		}

		node.tags.forEach((tag) => Engine._instance._nodesByTag.get(tag)?.delete(node));

		if (Engine.debug) {
			this._profile.nodesUnmounted++;
		}
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

				if (Engine.debug) {
					this._profile.nodesRendered++;
				}
			} else if (Engine.debug) {
				this._profile.nodesSkippedRender++;
			}
		}

		// Process transitions
		for (const transition of Engine._instance.transitions) {
			transition.tick();

			if (transition.finished) {
				Engine._instance.transitions.delete(transition);
			}
		}

		if (Engine.debug) {
			this._profile.frames = frames;
			this._profile.frameTime = deltaTime;
			this._profile.fps = (1 / deltaTime);
			this._profile.transitionsCount = Engine._instance.transitions.size;
			this._profile.nodesCount = this.tree.getNodes().size;
			Engine.onTicked(this, this._profile);
			this._profile.nodesMounted = 0;
			this._profile.nodesUnmounted = 0;
			this._profile.nodesRendered = 0;
			this._profile.nodesSkippedRender = 0;
		}
	}

	public static registerTransition(transition: Transition) {
		Engine._instance.transitions.add(transition);
	}

	static isHovering(node: Node2D & WithPointerEvents): boolean {
		return Engine._instance._hoveredNodes.has(node);
	}

	static getHovering(): Array<Node2D & WithPointerEvents> {
		return Array.from(Engine._instance._hoveredNodes.values());
	}

	static nodeByUname<T extends Node2D>(uname: string): T | undefined {
		return Engine._instance._nodeByUname.get(uname) as T;
	}

	static nodesByTag<T extends Node2D>(tag: string): Set<T> {
		return Engine._instance._nodesByTag.get(tag) as Set<T> ?? new Set();
	}

	static init(rootNode: Node2D, renderer: Renderer): Engine {
		return Engine._instance = new Engine(rootNode, renderer);
	}

	static start(): void {
		Engine._instance.clock.update();
		Engine._instance.clock.start();
	}

	static pause(): void {
		Engine._instance.clock.pause();
	}

	static get debug() {
		return Engine._instance._debug;
	}

	static setDebug(value: boolean) {
		Engine._instance._debug = value;
		Engine._instance.renderer.setDebug(value);
	}
}
