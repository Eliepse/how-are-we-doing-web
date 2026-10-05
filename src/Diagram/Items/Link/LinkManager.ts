import { Node2D } from "../../../Engine2D/Node/Node2D";
import type { Pathology } from "../Pathology/Pathology";
import type { Determinant } from "../Determinant/Determinant";
import { Link } from "./Link";
import { AssociationManager } from "../../Links/AssociationManager";
import type { AssociationView } from "../../Links/AssociationView";
import type { ActiveStatus } from "../../types";

/**
 * Manage visible links in the diagram
 */
export class LinkManager extends Node2D {
	private links = new Map<string, Link>();

	constructor(
		private pathologies: Map<number, Pathology>,
		private determinants: Map<number, Determinant>,
	) {
		super();

		// Extract all associations that has a pathology and a determinant
		const pathologiesView = AssociationManager.all().filterByTypeAll(["pathology", "determinant"]);

		// Extract all associations that has only determinants
		const determinantsView = AssociationManager.all().filterByOnlyDeterminants();

		// Index to quickly lookup if an association exists or not
		const index = new Set<string>();

		// Index pathology-determinant associations
		for (const association of pathologiesView.associations) {
			let pathologyId, determinantId;

			for (const node of association.nodes) {
				if ("determinant" === node.type) {
					determinantId = node.id;
				} else if ("pathology" === node.type) {
					pathologyId = node.id;
				}
			}

			index.add(`p${pathologyId}-d${determinantId}`);
		}

		// Index determinant-determinant associations
		for (const association of determinantsView.associations) {
			const [a, b] = association.nodes;

			if (!a || !b) {
				continue;
			}

			index.add(`d${a.id}-d${b.id}`);
		}

		// Create links by checking every combination possible
		for (const [pkey, pathology] of this.pathologies) {
			for (const [dkey, determinant] of this.determinants) {
				const nodeKey = `p${pkey}-d${dkey}`;

				if (false === index.has(nodeKey)) {
					continue;
				}

				const invertedKey = `d${dkey}-p${pkey}`;
				const link = new Link(determinant, pathology, nodeKey);
				// link.bidirectional = true;
				link.hide();
				this.links.set(nodeKey, link);
				this.links.set(invertedKey, link);
				this.addChildren(link);
			}
		}

		// Create determinants links
		for (const [aKey, aDeterminant] of this.determinants) {
			for (const [bKey, bDeterminant] of this.determinants) {
				if(aKey === bKey) {
					continue;
				}

				const nodeKey = `d${aKey}-d${bKey}`;

				if (false === index.has(nodeKey)) {
					continue;
				}

				const link = new Link(aDeterminant, bDeterminant, nodeKey);
				link.hide();
				this.links.set(nodeKey, link);
				this.addChildren(link);
			}
		}
	}

	showViewLinks(view: AssociationView, sourceStatus: ActiveStatus | false, preview = false) {
		for (const association of view.filterByTypeAll(["pathology", "determinant"]).associations) {
			let pathologyId, determinantId;

			for (const node of association.nodes) {
				if ("determinant" === node.type) {
					determinantId = node.id;
				} else if ("pathology" === node.type) {
					pathologyId = node.id;
				}
			}

			if (!pathologyId || !determinantId) {
				continue;
			}

			const link = this.links.get(`d${determinantId}-p${pathologyId}`);
			link?.show();

			if ("n+1" === sourceStatus) {
				link?.status?.set("n+1");
			} else if (preview) {
				link?.status?.set("preview");
			} else {
				link?.status?.set("selected");
			}
		}
	}

	showViewInterDeterminantsLinks(view: AssociationView, preview = false) {
		for (const association of view.associations) {
			const [a, b] = association.nodes;

			if (a?.type !== "determinant" || b?.type !== "determinant") {
				continue;
			}

			const link = this.links.get(`d${a.id}-d${b.id}`);

			if (undefined === link) {
				console.warn(`Unable to find link for association: d${a.id}-d${b.id}`);
				continue;
			}

			link.status?.set(preview ? "preview" : "selected");
			link.show();
		}
	}

	clearLinks() {
		(this.children as Link[]).forEach((link) => link.hide());
	}
}
