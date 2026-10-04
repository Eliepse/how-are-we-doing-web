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
		const view = AssociationManager.all().filterByTypeAll(["pathology", "determinant"]);

		// Create an index to quickly lookup if an association exists or not
		const index = new Set(
			view.associations.map((association) => {
				let pathologyId, determinantId;

				for (const node of association.nodes) {
					if ("determinant" === node.type) {
						determinantId = node.id;
					} else if ("pathology" === node.type) {
						pathologyId = node.id;
					}
				}

				return `p${pathologyId}-d${determinantId}`;
			}),
		);

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
		// for (const [key, determinant] of this.determinants) {
		// 	determinant.associations.determinants.forEach((assoId) => {
		// 		const nodeKey = `d${key}-d${assoId}`;
		// 		const invertedKey = `d${assoId}-d${key}`;
		// 		const to = this.determinants.get(assoId);
		//
		// 		// Prevent duplicates from inversed size associations
		// 		const linkInverted = this.links.get(invertedKey);
		// 		if (undefined !== linkInverted) {
		// 			// linkInverted.bidirectional = true;
		// 			return;
		// 		}
		//
		// 		if (undefined === to) {
		// 			console.warn(`Could not find associated node (asso. key: ${nodeKey})`);
		// 			return;
		// 		}
		//
		// 		const link = new Link(determinant, to, nodeKey);
		// 		link.hide();
		// 		this.links.set(nodeKey, link);
		// 		this.links.set(invertedKey, link);
		// 		this.addChildren(link);
		// 	});
		// }
	}

	showInterDeterminantLinks(node: Determinant, preview = false) {
		const view = AssociationManager.filterByNode(node);

		// for (const [detId, direction] of view.entries()) {
		// 	const nodeKey = Dir.Source === direction ? `d${detId}-d${node.id}` : `d${node.id}-d${detId}`;
		// 	const link = this.links.get(nodeKey);
		//
		// 	if (undefined === link) {
		// 		console.warn(`Unable to find link for asso: d${node.id}-d${detId}`);
		// 		continue;
		// 	}
		//
		// 	// link.direction = Dir.Bidirectional === direction ? Dir.Bidirectional : Dir.Target;
		// 	link.status?.set(preview ? "preview" : "selected");
		// 	link.show();
		// }
	}

	showViewLinks(view: AssociationView, sourceStatus: ActiveStatus | false, preview = false) {
		const filteredView = view.filterByTypeAll(["pathology", "determinant"]);

		for (const association of view.associations) {
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

	clearLinks() {
		(this.children as Link[]).forEach((link) => link.hide());
	}
}
