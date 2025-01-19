import db from "../database.json";
import { Config } from "./config";
import { Diagram, type SelectableNode } from "./Diagram/Diagram";
import { FloatingLabelManager } from "./Diagram/FloatingLabelManager";
import { DeterminantRenderer } from "./Diagram/Renderer/DeterminantRenderer";
import { DeterminantSubFamilyRenderer } from "./Diagram/Renderer/DeterminantSubFamilyRenderer";
import { FacilityFamilyRenderer } from "./Diagram/Renderer/FacilityFamilyRenderer";
import { FacilityRenderer } from "./Diagram/Renderer/FacilityRenderer";
import { GroupWithArcTextRenderer } from "./Diagram/Renderer/GroupWithArcTextRenderer";
import { PathologyLinkRenderer } from "./Diagram/Renderer/PathologyLinksRenderer";
import { PathologyRenderer } from "./Diagram/Renderer/PathologyRenderer";
import { Translator } from "./Diagram/Translation/Translator";
import type { NodeEvent } from "./Engine2D/Core/NodeEvent";
import { SVGRenderer } from "./Engine2D/Renderer/SVG/SVGRenderer";
import { Vector } from "./Engine2D/Vector";

const container = document.querySelector("#diagramContainer");
const labelContainer = document.querySelector("#labels") as HTMLDivElement;

if (null === container) {
	throw new Error("Missing container");
}

if (null === labelContainer) {
	throw new Error("Missing labels container");
}

const translator = new Translator(
	"/translations/{context}.{lang}.json",
	"fr",
	["en", "fr", "it"],
	["nodes"],
);

const labelManager = new FloatingLabelManager(labelContainer);
const diagram = new Diagram(db.pathologies, db.facilities, db.determinants);
const renderer = new SVGRenderer(
	"diagram",
	container,
	diagram,
	new Vector(1000, 1000),
	Config.Render.debug,
);

diagram.setPosition(renderer.size.div(2));

renderer.addNodeRenderer(new FacilityRenderer(renderer, diagram));
renderer.addNodeRenderer(new DeterminantRenderer(renderer, diagram));
renderer.addNodeRenderer(new PathologyRenderer(renderer, diagram));
renderer.addNodeRenderer(new GroupWithArcTextRenderer(renderer, translator));
renderer.addNodeRenderer(new FacilityFamilyRenderer(renderer));
renderer.addNodeRenderer(new DeterminantSubFamilyRenderer(renderer));
renderer.addNodeRenderer(new PathologyLinkRenderer(renderer));

const engine = renderer.getEngine();

diagram.addListener("mouseenter", (event: NodeEvent<SelectableNode | undefined>) => {
	if (undefined === event.target) {
		return;
	}

	if (event.target === diagram.getSelectedNode()) {
		labelManager.hide("hover");
		return;
	}

	labelManager.show(
		"hover",
		translator.translate(event.target.label, "nodes"),
		renderer.localPointToWindow(event.target?.getGlobalPosition()),
		"left",
		16,
	);
});

diagram.addListener("nodeSelected", (event: NodeEvent<SelectableNode | undefined>) => {
	if (undefined === event.target) {
		labelManager.hide("selected");
		return;
	}

	labelManager.hide("hover");
	labelManager.show(
		"selected",
		translator.translate(event.target.label, "nodes"),
		renderer.localPointToWindow(event.target?.getGlobalPosition()),
		"left",
		16,
	);
});

diagram.addListener("mouseleave", () => {
	if (0 !== engine.getHovering().length) {
		return;
	}

	labelManager.hide("hover");
});

const biblio = document.querySelector("#bibliography") as HTMLDivElement;

diagram.addListener("nodeSelected", (event: NodeEvent<SelectableNode | undefined>) => {
	biblio.querySelectorAll(".biblio-nodes").forEach((list) => (list.innerHTML = ""));

	if (undefined === event.target) {
		biblio.style.display = "none";
		return;
	}

	const activeNodes = diagram.getActiveNodes();

	biblio.querySelectorAll<HTMLUListElement>(".biblio-nodes[data-type]").forEach((list) => {
		let nodes: SelectableNode[] = [];

		switch (list.dataset.type) {
			case "pathology":
				nodes = activeNodes.pathologies;
				break;
			case "determinant":
				nodes = activeNodes.determinants;
				break;
			case "facility":
				nodes = activeNodes.facilities;
				break;
		}

		nodes.forEach((node) => {
			const entry = document.createElement("li");
			entry.textContent = translator.translate(node.label, "nodes");
			list.append(entry);
		});
	});

	const links = diagram.getActiveLinksSources();
	const facilityLinks = new Set(links.facilities.map((l) => l.source.toLowerCase()));
	const pathologiesLinks = new Set(links.facilities.map((l) => l.source.toLowerCase()));

	biblio.querySelectorAll<HTMLUListElement>("[data-link]").forEach((list) => {
		if ("facilities" === list.dataset.link) {
			list.textContent = Array.from(facilityLinks.values()).join(" / ");
		} else if ("pathologies" === list.dataset.link) {
			list.textContent = Array.from(pathologiesLinks.values()).join(" / ");
		}
	});

	biblio.style.display = "";
});

translator.loadContexts().then(() => {
	renderer.render();
	engine.start();
});

/**
 * Debugger
 */
/*
document.addEventListener("mousemove", (e) => {
  const cursor = new Vector(e.clientX, e.clientY);
  // determinantsGroup.setSize(cursor.x);
  // determinantsGroup.refresh()
  // console.debug(cursor.x)
});
*/
