import { VirtualNode } from "./VirtualNode";
import type { Node2D } from "../Node/Node2D";

const emptyFn = () => undefined;

export class VirtualTree {
	private rootVNode?: VirtualNode;

	public onMount: (vnode: VirtualNode) => void = emptyFn;
	public onUnmount: (vnode: VirtualNode) => void = emptyFn;

	constructor(private rootNode: Node2D) {
	}

	private mountTree(node: Node2D): VirtualNode {
		const virtualNode = new VirtualNode(node);

		this.onMount(virtualNode);

		virtualNode.setChildren(node.getChildren().map((child) => this.mountTree(child)));
		return virtualNode;
	}

	private unmountTree(vnode: VirtualNode): void {
		for (const child of vnode.children) {
			this.unmountTree(child);
		}

		this.onUnmount(vnode);
	}

	private compareChildrenRecursive(nodes: Node2D[], vNodes: VirtualNode[]): VirtualNode[] {
		vNodes.slice(nodes.length).forEach((vnode) => this.unmountTree(vnode));

		return nodes.map((node, index) => {
			const vnode = vNodes[index];

			// Element didn't exist
			if (undefined === vnode) {
				return this.mountTree(node);
			}

			// Elements differs
			if (node !== vnode.node) {
				this.unmountTree(vnode);
				return this.mountTree(node);
			}

			vnode.setChildren(this.compareChildrenRecursive(node.getChildren(), vnode.children));
			return vnode;
		});
	}

	update(): void {
		this.rootVNode = this.compareChildrenRecursive([this.rootNode], this.rootVNode ? [this.rootVNode] : [])[0];
	}

	getVRoot() {
		if (undefined === this.rootVNode) {
			throw new Error("Virtual tree has not been initialized yet");
		}

		return this.rootVNode;
	}
}