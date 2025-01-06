import type { Element2D } from "../../Contract/renderable";
import { Size } from "../../Parameters/Size";
import { SymbolShape } from "../../SymbolShape";
import { GhostRenderer } from "./GhostRenderer";
import { SVGArcTextRenderer } from "./NodeRenderer/SVGArcTextRenderer";
import { SVGNodeRenderer } from "./NodeRenderer/SVGNodeRenderer";
import { SVGVirtualShapeRenderer } from "./NodeRenderer/SVGVirtualShapeRenderer";
import { TreeNode } from "./TreeNode";

const renderers = [SVGArcTextRenderer, SVGVirtualShapeRenderer, GhostRenderer];

export class SVGRenderer {
	private dom?: SVGElement = undefined;
	private _tree?: TreeNode;
	private renderers = new WeakMap<Element2D, SVGNodeRenderer>();
	private symbolics = new Map<SymbolShape, Element[]>();

	constructor(private container: Element, private size: Size, private _root: Element2D) {}

	private initDOM(): boolean {
		if (this.isInit()) {
			return false;
		}

		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const w = this.size.width.toFixed();
		const h = this.size.height.toFixed();
		this.dom.setAttribute("viewBox", `0 0 ${w} ${h}`);

		// Add symbolic shapes to the dom
		this.symbolics.forEach((_, s) => this.addSymbolShape(s));

		return true;
	}

	isInit(): boolean {
		return undefined !== this.dom;
	}

	addSymbolShape(symbol: SymbolShape): void {
		this.symbolics.set(symbol, []);

		if (false === this.isInit()) {
			return;
		}

		const elements = symbol.getDOM();
		elements.forEach((el) => this.dom?.append(el));
		this.symbolics.set(symbol, elements);
	}

	private mount(node: TreeNode, parentRenderer?: SVGNodeRenderer): void {
		// Then create the given element
		let renderer: SVGNodeRenderer | undefined = undefined;

		for (const Renderer of renderers) {
			if (false === Renderer.accepts(node)) {
				continue;
			}

			// renderer = new Renderer(node, parentRenderer, parentRenderer ? undefined : this.dom);
			break;
		}

		if (undefined === renderer) {
			throw new Error("Unsupported node type");
		}

		this.renderers.set(node.element, renderer);

		// First mount leaves
		node.children.forEach((child) => this.mount(child, renderer));

		// renderer?.create();
		// renderer?.update();
	}

	private unmount(node: TreeNode): void {
		// First unmount leaves
		node.children.forEach((child) => this.unmount(child));

		// Then remove the given element
		this.renderers.get(node.element)?.delete();
		this.renderers.delete(node.element);
	}

	render(): number {
		const startedAt = Date.now();

		if (undefined === this._root) {
			throw new Error("Root node missing");
		}

		const shouldAppend = this.initDOM();

		// Render process here

		const newTree = new TreeNode(this._root);

		const compareNodes = (previous: Array<TreeNode>, current: Array<TreeNode>) => {
			// Remaining children are not present on the new tree
			previous.slice(current.length).forEach((child) => this.unmount(child));

			// Compare nodes
			current.forEach((child, index) => {
				const previousChild = previous[index];

				// Element didn't exist
				if (undefined === previousChild) {
					this.mount(child);
					return;
				}

				// Elements differs
				if (previousChild.element !== child.element) {
					this.unmount(previousChild);
					this.mount(child);
					return;
				}

				this.renderers.get(child.element)?.update();

				compareNodes(Array.from(previousChild.children), Array.from(child.children));
			});
		};

		compareNodes(this._tree ? [this._tree] : [], [newTree]);

		this._tree = newTree;

		if (shouldAppend && this.dom) {
			this.container.append(this.dom);
		}

		return Date.now() - startedAt;
	}
}
