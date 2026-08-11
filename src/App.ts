import { Context, type Details } from "./Diagram/Context";
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
import { PathologyFamilyRenderer } from "./Diagram/Renderer/PathologyFamilyRenderer";
import { DiagramBackgroundRenderer } from "./Diagram/Renderer/DiagramBackgroundRenderer";
import { FallbackRenderer } from "./SVGRenderer/NodeRenderer/FallbackRenderer";
import type { NodeEvent } from "./Engine2D/Core/NodeEvent";
import { BiblioManager } from "./Diagram/BiblioManager";
import { BgDecorationsRenderer } from "./Diagram/Renderer/BgDecorationsRenderer";
import type { DeterminantKey } from "./Diagram/types";
import { Determinant } from "./Diagram/Items/Determinant/Determinant";
import { LinkRenderer } from "./Diagram/Renderer/LinkRenderer";
import { ProfilerDisplay } from "./debug/graph/ProfilerDisplay";
import { linkGradient } from "./Diagram/Shape/LinkGradient";
import { linkArrow } from "./Diagram/Shape/LinkArrow";
import { makeScene } from "./Animations/RevealDiagramScene";
import { Timeline } from "./Engine2D/Animate/Timeline";

export type Feature =
	"detailed-relations"
	| "focus-determinant"
	| "determinant"
	| "det-links:determinant"
	| "pathology"
	| "det-links:pathology"
	| "facility"
	| "det-links:facility";

export class App {
	private static _instance?: App = undefined;

	private readonly translator: Translator;
	private readonly labelManager: FloatingLabelManager;
	private profiling?: ProfilerDisplay = undefined;

	private contexts: Context[] = [];
	private currentContext?: Context;
	private database?: any;

	private diagram?: Diagram;
	private biblio: BiblioManager;
	private loaded: boolean = false;
	private features: Set<Feature> = new Set([
		"determinant",
		"pathology",
		"det-links:pathology",
		"facility",
		"det-links:facility",
	]);

	public onContextChanged = (_context: Context) => undefined;
	public onSelectionChanged = (_node: SelectableNode | undefined) => undefined;
	public onPreviewChanged = (_node: SelectableNode | undefined) => undefined;
	public onFeatureChanged = () => undefined;

	private constructor(
		rootDom: Element,
		diagramDom: Element,
	) {
		const labelDom = document.createElement("div");
		labelDom.id = "labels";

		const rendererDom = document.createElement("div");
		rendererDom.id = "diagramContainer";

		diagramDom.append(labelDom, rendererDom);

		this.translator = new Translator("/translations/{context}.{lang}.json", "fr", ["en", "fr"], ["general", "nodes"]);
		this.labelManager = new FloatingLabelManager(labelDom, this.translator);
		this.biblio = new BiblioManager(rootDom, this.translator);

		const renderer = new SVGRenderer("diagram", rendererDom, new Vector(1100, 1100), Config.Render.debug);
		Engine.init(new Node2D(), renderer);

		renderer.registerReferencable(blobPattern);
		renderer.registerReferencable(linkGradient);
		renderer.registerSymbolic(linkArrow);
		renderer.addNodeRenderer(new FacilityRenderer(renderer));
		renderer.addNodeRenderer(new DeterminantRenderer(renderer));
		renderer.addNodeRenderer(new PathologyRenderer(renderer));
		renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer));
		renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer));
		renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer));
		renderer.addNodeRenderer(new LinkRenderer(renderer));
		renderer.addNodeRenderer(new PathologyFamilyRenderer(renderer));
		renderer.addNodeRenderer(new DiagramBackgroundRenderer(renderer));
		renderer.addNodeRenderer(new BgDecorationsRenderer(renderer));
		renderer.addNodeRenderer(new FallbackRenderer(renderer));
	}

	static init(
		rootDom: Element,
		diagramDom: Element,
	) {
		if (undefined !== this._instance) {
			console.warn("App has already been instantiated, overriding...");
		}

		return this._instance = new App(rootDom, diagramDom);
	}

	static instance() {
		if (undefined === this._instance) {
			throw new Error("App has not been instanciated yet!");
		}

		return this._instance;
	}

	static feature(feature: Feature): boolean;
	static feature(feature: Feature, state: boolean): void;
	static feature(feature: Feature, state?: boolean): void | boolean {
		if (true === state) {
			App.instance().features.add(feature);
			App.instance().onFeatureChanged();
		} else if (false === state) {
			App.instance().features.delete(feature);
			App.instance().onFeatureChanged();
		} else {
			return App.instance().features.has(feature);
		}
	}

	static featuresAll(...features: Feature[]): boolean {
		for (const feature of features) {
			if (false === App.instance().features.has(feature)) {
				return false;
			}
		}

		return true;
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
		const contexts = [
			...(await (await fetch("contexts/default.json")).json())?.contexts,
			...(await (await fetch("contexts/lyon.json")).json())?.contexts,
			...(await (await fetch("contexts/grenoble.json")).json())?.contexts,
		];

		this.contexts = contexts.map((context: {
			id: string;
			name: string;
			default?: boolean;
			determinants: { [k in DeterminantKey]: number };
			details: Details;
		}) => {
			return new Context(
				context.id,
				context.name,
				context.determinants,
				true === context.default,
				context.details,
			);
		});

		this.loaded = true;
	}

	async launch() {
		if (false === this.loaded) {
			await this.load();
		}

		this.diagram = new Diagram(
			this.database.pathologies,
			this.database.facilities,
			this.database.determinants,
			this.database.associations,
		);

		this.changeContext(this.contexts[0]);

		// Center the diagram
		Engine.root.setPosition(Engine.getRenderer<SVGRenderer>().size.div(2));
		Engine.root.addChildren(this.diagram);

		this.diagram.addListener("mouseenter", (event: NodeEvent<SelectableNode | undefined>) => {
			const node = event.target;

			if (App.feature("focus-determinant") && !(node instanceof Determinant)) {
				return;
			}

			if (undefined === node) {
				this.labelManager.hide("selected");
				return;
			}

			if (node === this.diagram?.getSelectedNode()) {
				this.labelManager.hide("hover");
				return;
			}

			const nodePosition = node.getGlobalPosition().get();
			const hSize = Engine.getRenderer<SVGRenderer>().size.div(2);

			this.labelManager.show(
				"hover",
				node.label,
				Engine.getRenderer().localPointToWindow(nodePosition),
				hSize.x > nodePosition.x ? "left" : "right",
				16,
				"n+1" === node.status.get() ? "secondary" : "white",
			);
		});

		Engine.root.addListener("click", () => {
			this.diagram?.selectNode(undefined);
		});

		this.diagram.addListener("nodeSelected", (event: NodeEvent<SelectableNode | undefined>) => {
			const node = event.target;

			this.onSelectionChanged(node);

			if (undefined === node) {
				this.labelManager.hide("selected");
				return;
			}

			const nodePosition = node.getGlobalPosition().get();
			const hSize = Engine.getRenderer<SVGRenderer>().size.div(2);

			this.labelManager.hide("hover");
			this.labelManager.show(
				"selected",
				node.label,
				Engine.getRenderer().localPointToWindow(nodePosition),
				hSize.x > nodePosition.x ? "left" : "right",
				16,
			);
		});

		this.diagram.addListener("mouseleave", () => {
			if (0 !== Engine.getHovering().size) {
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

		this.diagram.addListener("nodePreviewed", (event: NodeEvent<SelectableNode | undefined>) => {
			this.onPreviewChanged(event.target);
		});

		// Start the engine
		Engine.start();

		Timeline.play(makeScene(this.diagram)).then(() => this.setReadonly(false));
	}

	get debug() {
		return Engine.debug;
	}

	setDebug(value: boolean) {
		Engine.setDebug(value);

		if (false === value) {
			Engine.onTicked = () => undefined;
			this.profiling?.hide();
			return;
		}

		if (!this.profiling) {
			const profilingDom = document.createElement("div");
			profilingDom.id = "profiling";
			document.body.append(profilingDom);
			this.profiling = new ProfilerDisplay(profilingDom, 5, 12);
		}

		Engine.onTicked = (_engin, profile) => {
			this.profiling?.stageStatValue("fps", profile.fps);
			this.profiling?.stageStatValue("frameTime", profile.frameTime);
			this.profiling?.stageStatValue("nodesRendered", profile.nodesRendered);
			this.profiling?.stageStatValue("nodesMounted", profile.nodesMounted);
			this.profiling?.stageStatValue("nodesUnmounted", profile.nodesUnmounted);
			this.profiling?.stageStatValue("transitionsCount", profile.transitionsCount);
		};
		this.profiling.show();
	}

	previousContext(): void {
		if (undefined === this.currentContext) {
			this.changeContext(this.contexts[0]);
			return;
		}

		let i = this.contexts.indexOf(this.currentContext) - 1;
		i = i < 0 ? this.contexts.length - 1 : i;
		this.changeContext(this.contexts[i]);
	}

	nextContext(): void {
		if (undefined === this.currentContext) {
			this.changeContext(this.contexts[0]);
			return;
		}

		const i = this.contexts.indexOf(this.currentContext) + 1;
		this.changeContext(this.contexts[i % this.contexts.length]);
	}

	changeContext(context?: Context): void {
		if (undefined === context) {
			return;
		}

		this.currentContext = context;
		this.diagram?.contextualizeDeterminants(context);
		this.onContextChanged(context);
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

	changeMode(mode: "focus" | "detailled" | "basic") {
		if (!this.diagram) {
			return;
		}

		document.querySelectorAll<HTMLElement>("[data-mode]").forEach((el) => {
			if (mode === el.dataset.mode) {
				el.classList.add("active");
			} else {
				el.classList.remove("active");
			}
		});

		App.feature("detailed-relations", "basic" !== mode);

		const isDetsFocus = "focus" === mode;
		App.feature("focus-determinant", isDetsFocus);
		App.feature("det-links:determinant", isDetsFocus);

		App.feature("pathology", !isDetsFocus);
		App.feature("det-links:pathology", !isDetsFocus);
		App.feature("facility", !isDetsFocus);
		App.feature("det-links:facility", !isDetsFocus);

		this.diagram.updateRingsOpacity();
		this.diagram.updateNodesHighlight();
	}

	setReadonly(state: boolean) {
		Engine.setReadonly(state);
	}
}