import { Facility } from "./Items/Facility/Facility";
import { Determinant } from "./Items/Determinant/Determinant";
import { Pathology } from "./Items/Pathology/Pathology";
import type { Node2D } from "../Engine2D/Node/Node2D";
import type { Translator } from "./Translation/Translator";

export class BiblioManager {
	private readonly root: HTMLDivElement;
	private readonly pathologies: NodeBox;
	private readonly determinants: NodeBox;
	private readonly facilities: NodeBox;
	private readonly facilitySources: SourceBox;
	private readonly pathologySources: SourceBox;

	constructor(container: Element, private readonly translator: Translator) {
		this.root = document.createElement("div");
		this.root.id = "biblioRoot";

		const content = document.createElement("div");
		content.id = "biblioContent";

		this.pathologies = new NodeBox(content, "A");
		this.pathologySources = new SourceBox(content);
		this.determinants = new NodeBox(content, "B");
		this.facilitySources = new SourceBox(content);
		this.facilities = new NodeBox(content, "C");

		this.root.append(content);
		container.append(this.root);

		this.open();
	}

	addNode(node: Facility | Determinant | Pathology) {
		if (node instanceof Facility) {
			this.facilities.addNode(node);
		} else if (node instanceof Determinant) {
			this.determinants.addNode(node);
		} else {
			this.pathologies.addNode(node);
		}
	}

	addLink(side: "pathology" | "facility", text: string): void {
		if("pathology" === side) {
			this.pathologySources.add(text);
			return;
		}

		this.facilitySources.add(text);
	}

	open(): void {
		this.root.classList.add("open");
	}

	close(): void {
		this.root.classList.remove("open");
	}

	clear(): void {
		this.facilities.clear();
		this.determinants.clear();
		this.pathologies.clear();
	}

}

class NodeBox {
	private readonly root: HTMLUListElement;
	private nodes = new WeakMap<Node2D, HTMLLIElement>();

	constructor(container: Element, title: string) {
		this.root = document.createElement("ul");
		this.root.classList.add("biblio-nodes");
		container.append(this.root);
	}

	addNode(node: Facility | Determinant | Pathology): void {
		if (this.nodes.has(node)) {
			return;
		}

		const element = document.createElement("li");
		element.innerText = node.label;
		this.nodes.set(node, element);
		this.root.append(element);
	}

	clear(): void {
		this.root.innerText = "";
		this.nodes = new WeakMap();
	}
}

class SourceBox {
	private readonly root: HTMLDivElement;
	private readonly sources = new Set<string>();

	constructor(container: Element) {
		this.root = document.createElement("div");
		this.root.classList.add("biblio-links");
		container.append(this.root);
	}

	add(text: string): void {
		this.sources.add(text);
		this.root.innerText = Array.from(this.sources.values()).join(" / ");
	}

	clear(): void {
		this.sources.clear();
		this.root.innerText = "";
	}
}