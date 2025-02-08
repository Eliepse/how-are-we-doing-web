import type { WithLifecycle } from "../Contract/WithLifecycle";
import type { WithPointerEvents } from "../Contract/WithPointerEvents";
import type { Node2D } from "../Node/Node2D";
import type { Vector } from "../Vector";
import { Clock } from "./Clock";
import { EngineNode } from "./EngineNode";
import { NodeEvent } from "./NodeEvent";

export type EngineMouseEvent = { cursor: Vector };
type Listener<TEvent extends object> = (event: TEvent) => void;
type Listeners = {
	mousemove: Listener<EngineMouseEvent>;
	click: Listener<EngineMouseEvent>;
};

export class Engine {
	private _tree?: EngineNode;
	private _clock: Clock;
	private _lifecycleCallbacks = new WeakMap<Node2D, () => void>();
	private _listeners = {
		mousemove: new Set<Listeners["mousemove"]>(),
		click: new Set<Listeners["click"]>(),
	};
	private _pointerEventsNodes = new Set<Node2D & WithPointerEvents>();
	private _hoveredNodes = new Set<Node2D & WithPointerEvents>();

	constructor(
		private _rootNode: Node2D,
		private _onMount: (node: EngineNode) => void,
		private _onUnmount: (node: EngineNode) => void,
		private _onRender: (node: EngineNode, deltaTime: number, frames: number) => void,
	) {
		this._clock = new Clock(60, (delta, frames) => this.tick(delta, frames));
		this.addEventListener("click", (e) => this.propagateClick(e.cursor));
		this.addEventListener("mousemove", (e) => this.handleMouseMove(e.cursor));
	}

	private mountTree(treeNode: EngineNode): void {
		this._onMount(treeNode);

		const node = treeNode.node as Node2D & Partial<WithLifecycle & WithPointerEvents>;

		const callback = node.onMount ? node.onMount(this) : undefined;

		if ("function" === typeof callback) {
			this._lifecycleCallbacks.set(node, callback);
		}

		if (undefined !== node.getPointerCollider) {
			this._pointerEventsNodes.add(node as Node2D & WithPointerEvents);
		}

		treeNode.children.forEach((child) => this.mountTree(child));
	}

	private unmountTree(treeNode: EngineNode): void {
		treeNode.children.forEach((child) => this.unmountTree(child));

		const node = treeNode.node as Node2D & Partial<WithPointerEvents>;
		const callback = this._lifecycleCallbacks.get(treeNode.node);

		callback && callback();

		if (undefined !== node.getPointerCollider) {
			this._pointerEventsNodes.delete(node as Node2D & WithPointerEvents);
		}

		this._onUnmount(treeNode);
	}

	private renderTree(treeNode: EngineNode, deltaTime: number, frames: number): void {
		this._onRender(treeNode, deltaTime, frames);

		const node = treeNode.node as Node2D & Partial<WithLifecycle>;

		if (node.onRender) {
			node.onRender(deltaTime);
		}

		treeNode.children.forEach((child) => this.renderTree(child, deltaTime, frames));
	}

	private compareTreeRecursive(previous: Array<EngineNode>, current: Array<EngineNode>) {
		previous.slice(current.length).forEach((node) => this.unmountTree(node));

		current.forEach((currentNode, index) => {
			const previousNode = previous[index];

			// Element didn't exist
			if (undefined === previousNode) {
				this.mountTree(currentNode);
				return;
			}

			// Elements differs
			if (false === previousNode.isEqual(currentNode)) {
				this.unmountTree(previousNode);
				this.mountTree(currentNode);
				return;
			}

			this._onRender(currentNode);

			this.compareTreeRecursive(
				Array.from(previousNode.children),
				Array.from(currentNode.children),
			);
		});
	}

	updateTree(): void {
		// Generate a fresh new tree
		const newTree = new EngineNode(this._rootNode);

		// Compare with the previous one
		this.compareTreeRecursive(this._tree ? [this._tree] : [], [newTree]);

		// Keep the new one for next render
		this._tree = newTree;
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
		this._rootNode.dispatchEvent(new NodeEvent("click"));
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
				continue;
			}
		}
	}

	private tick(deltaTime: number, frames: number): void {
		this.updateTree();

		if (undefined === this._tree) {
			throw new Error("The tree has not been constructed");
		}

		this.renderTree(this._tree, deltaTime, frames);
	}

	isHovering(node: Node2D & WithPointerEvents): boolean {
		return this._hoveredNodes.has(node);
	}

	getHovering(): Array<Node2D & WithPointerEvents> {
		return Array.from(this._hoveredNodes.values());
	}

	start(): void {
		this._clock.start();
	}

	pause(): void {
		this._clock.pause();
	}
}
