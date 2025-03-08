import { Context } from "./Diagram/Context";
import { Translator } from "./Diagram/Translation/Translator";
import { FloatingLabelManager } from "./Diagram/FloatingLabelManager";
import { Diagram, type SelectableNode } from "./Diagram/Diagram";
import { Engine } from "./Engine2D/Engine";
import { SVGRenderer } from "./SVGRenderer/SVGRenderer";
import { Vector } from "./Engine2D/ValueObject/Vector";
import { Config } from "./config";
import { Node2D } from "./Engine2D/Node/Node2D";
import { blobPattern } from "./Diagram/Shape/BlobPattern";
import { FacilityRenderer } from "./Diagram/Renderer/FacilityRenderer";
import { DeterminantRenderer } from "./Diagram/Renderer/DeterminantRenderer";
import { PathologyRenderer } from "./Diagram/Renderer/PathologyRenderer";
import { GroupWithArcTextRenderer } from "./Diagram/Renderer/GroupWithArcTextRenderer";
import { FacilityFamilyRenderer } from "./Diagram/Renderer/FacilityFamilyRenderer";
import { DeterminantSubFamilyRenderer } from "./Diagram/Renderer/DeterminantSubFamilyRenderer";
import { PathologyLinkRenderer } from "./Diagram/Renderer/PathologyLinksRenderer";
import { PathologyFamilyRenderer } from "./Diagram/Renderer/PathologyFamilyRenderer";
import { DiagramBackgroundRenderer } from "./Diagram/Renderer/DiagramBackgroundRenderer";
import { FallbackRenderer } from "./SVGRenderer/NodeRenderer/FallbackRenderer";
import type { NodeEvent } from "./Engine2D/Core/NodeEvent";
import { BiblioManager } from "./Diagram/BiblioManager";
import { BgDecorationsRenderer } from "./Diagram/Renderer/BgDecorationsRenderer";

export class App {
	private readonly translator: Translator;
	private readonly labelManager: FloatingLabelManager;
	private readonly engine: Engine<SVGRenderer>;

	private contexts: Context[] = [];
	private database?: any;

	private diagram?: Diagram;
	private biblio: BiblioManager;
	private loaded: boolean = false;

	constructor(
		rootDom: Element,
		diagramDom: Element,
	) {
		const labelDom = document.createElement("div");
		labelDom.id = "labels";

		const rendererDom = document.createElement("div");
		rendererDom.id = "diagramContainer";

		diagramDom.append(labelDom, rendererDom);

		this.translator = new Translator("/translations/{context}.{lang}.json", "fr", ["en", "fr", "it"], ["general", "nodes"]);
		this.labelManager = new FloatingLabelManager(labelDom);
		this.biblio = new BiblioManager(rootDom, this.translator);

		const renderer = new SVGRenderer("diagram", rendererDom, new Vector(1100, 1100), Config.Render.debug);
		this.engine = new Engine(new Node2D(), renderer);

		renderer.registerReferencable(blobPattern);
		renderer.addNodeRenderer(new FacilityRenderer(renderer, this.engine, this));
		renderer.addNodeRenderer(new DeterminantRenderer(renderer, this.engine, this));
		renderer.addNodeRenderer(new PathologyRenderer(renderer, this.engine, this));
		renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer, this.engine, this.translator));
		renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer, this.engine));
		renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer, this.engine));
		renderer.addNodeRenderer(new PathologyLinkRenderer(renderer, this.engine));
		renderer.addNodeRenderer(new PathologyFamilyRenderer(renderer, this.engine));
		renderer.addNodeRenderer(new DiagramBackgroundRenderer(renderer, this.engine));
		renderer.addNodeRenderer(new BgDecorationsRenderer(renderer, this.engine));
		renderer.addNodeRenderer(new FallbackRenderer(renderer, this.engine));
	}

	getDiagram(): Diagram {
		if (undefined === this.diagram) {
			throw new Error("Diagram not initialized");
		}

		return this.diagram;
	}

	async load(clb?: (step: number, total: number, title: string) => void) {
		const steps = 3;
		let step = 0;
		clb ??= (() => undefined);

		// Database
		clb(step++, steps, "Loading diagram elements and links");
		this.database = await (await fetch("data/database.json")).json();

		// Translations
		clb(step++, steps, "Loading translations");
		await this.translator.loadAll();

		// Contexts
		clb(step++, steps, "Loading contexts");
		const data = await (await fetch("data/contexts.json")).json();
		this.contexts = data.contexts.map((context) => new Context(context.id, context.name, context.determinants));

		this.loaded = true;
	}

	async launch() {
		if (false === this.loaded) {
			await this.load();
		}

		this.diagram = new Diagram(this.database.pathologies, this.database.facilities, this.database.determinants);

		// Center the diagram
		this.engine.root.setPosition(this.engine.getRenderer().size.div(2));
		this.engine.root.addChildren(this.diagram);

		this.diagram.addListener("mouseenter", (event: NodeEvent<SelectableNode | undefined>) => {
			if (undefined === event.target) {
				return;
			}

			if (event.target === this.diagram?.getSelectedNode()) {
				this.labelManager.hide("hover");
				return;
			}

			this.labelManager.show(
				"hover",
				this.translator.translate(event.target.label, "nodes"),
				this.engine.getRenderer().localPointToWindow(event.target?.getGlobalPosition()),
				"left",
				16,
			);
		});

		this.engine.root.addListener("click", () => {
			this.diagram?.selectNode(undefined);
		});

		this.diagram.addListener("nodeSelected", (event: NodeEvent<SelectableNode | undefined>) => {
			if (undefined === event.target) {
				this.labelManager.hide("selected");
				return;
			}

			this.labelManager.hide("hover");
			this.labelManager.show(
				"selected",
				this.translator.translate(event.target.label, "nodes"),
				this.engine.getRenderer().localPointToWindow(event.target?.getGlobalPosition()),
				"left",
				16,
			);
		});

		this.diagram.addListener("mouseleave", () => {
			if (0 !== this.engine.getHovering().length) {
				return;
			}

			this.labelManager.hide("hover");
		});

		this.diagram.addListener("nodeSelected", (event: NodeEvent<SelectableNode | undefined>) => {
			if (undefined === event.target) {
				this.biblio.clear();
				return;
			}

			if (undefined === this.diagram) {
				return;
			}

			this.biblio.clear();

			const activeNodes = this.diagram.getActiveNodes();
			activeNodes.facilities.forEach((node) => this.biblio.addNode(node));
			activeNodes.determinants.forEach((node) => this.biblio.addNode(node));
			activeNodes.pathologies.forEach((node) => this.biblio.addNode(node));

			const links = this.diagram.getActiveLinksSources();
			links.pathologies.forEach((l) => this.biblio.addLink("pathology", l.source.toLowerCase()));
			links.facilities.forEach((l) => this.biblio.addLink("facility", l.source.toLowerCase()));
		});

		// Start the engine
		this.engine.render();
		this.engine.start();
	}

	getTranslator(): Translator {
		return this.translator;
	}

	showBibliography() {
		this.biblio.open();
	}

	hideBibliography() {
		this.biblio.close();
	}
}