import { Facility } from "./Items/Facility/Facility";
import { Determinant } from "./Items/Determinant/Determinant";
import { Pathology } from "./Items/Pathology/Pathology";
import type { Translator } from "./Translation/Translator";
import type { IntlStr } from "./Translation/IntlStr";

export class BiblioManager {
	private readonly root: HTMLDivElement;
	private readonly pathologies: NodeBox;
	private readonly determinants: NodeBox;
	private readonly facilities: NodeBox;
	private readonly facilitySources: SourceBox;
	private readonly pathologySources: SourceBox;

	constructor(container: Element, private readonly translator: Translator) {
		const root = document.querySelector<HTMLDivElement>("#biblioRoot");

		if (null === root) {
			throw new Error("Missing bibliography root DOM element");
		}

		this.root = root;

		const content = document.createElement("div");
		content.id = "biblioContent";

		this.pathologies = new NodeBox(content, "general.pathologies", this.translator);
		this.pathologySources = new SourceBox(content, this.translator);
		this.determinants = new NodeBox(content, "general.determinants", this.translator);
		this.facilitySources = new SourceBox(content, this.translator);
		this.facilities = new NodeBox(content, "general.facilities", this.translator);

		this.root.append(content);
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
		if ("pathology" === side) {
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
		this.facilitySources.clear();
		this.determinants.clear();
		this.pathologySources.clear();
		this.pathologies.clear();
	}
}

class NodeBox {
	private readonly root: HTMLDivElement;
	private readonly list: HTMLUListElement;
	private nodesIntlStr = new Map<string, IntlStr>();

	constructor(container: Element, private titleKey: string, private translator: Translator) {
		this.root = document.createElement("div");

		this.list = document.createElement("ul");
		this.list.classList.add("biblio-nodes");

		const title = document.createElement("div");
		title.classList.add("biblio-nodesTitle");
		const titleStr = this.translator.dyn(this.titleKey, (text) => title.innerText = text);
		title.innerText = titleStr.toString();

		this.root.append(title);
		this.root.append(this.list);
		container.append(this.root);
	}

	addNode(node: Facility | Determinant | Pathology): void {
		if (this.nodesIntlStr.has(node.label)) {
			return;
		}

		const element = document.createElement("li");
		const str = this.translator.dyn(`nodes.${node.label}`, (text) => element.innerText = text);
		element.innerText = str.toString();
		this.nodesIntlStr.set(node.label, str);
		this.list.append(element);
	}

	clear(): void {
		for (const intl of this.nodesIntlStr.values()) {
			intl.disconnect();
		}

		this.list.innerText = "";
		this.nodesIntlStr.clear();
	}
}

class SourceBox {
	private readonly root: HTMLDivElement;
	private readonly sources = new Set<string>();

	constructor(container: Element, private translator: Translator) {
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