import { Node2D } from "../../../Engine2D/Node/Node2D";
import type { Pathology } from "../Pathology/Pathology";
import type { Determinant } from "../Determinant/Determinant";
import { Link } from "./Link";
import { AssociationManager } from "../../AssociationManager";

export class LinkManager extends Node2D {
	private links = new Map<string, Link>();

	constructor(
		private pathologies: Map<number, Pathology>,
		private determinants: Map<number, Determinant>,
	) {
		super();

		// Create pathologies links
		for (const [key, pathology] of this.pathologies) {
			pathology.associations.determinants.forEach((assoId) => {
				const nodeKey = `p${key}-d${assoId}`;
				const invertedKey = `d${assoId}-p${key}`;
				const determinant = this.determinants.get(assoId);

				if (undefined === determinant) {
					console.warn(`Could not find associated node (asso. key: ${nodeKey})`);
					return;
				}

				const link = new Link(determinant, pathology, nodeKey);
				// link.bidirectional = true;
				link.hide();
				this.links.set(nodeKey, link);
				this.links.set(invertedKey, link);
				this.addChildren(link);
			});
		}

		// Create determinants links
		for (const [key, determinant] of this.determinants) {
			determinant.associations.determinants.forEach((assoId) => {
				const nodeKey = `d${key}-d${assoId}`;
				const invertedKey = `d${assoId}-d${key}`;
				const to = this.determinants.get(assoId);

				// Prevent duplicates from inversed size associations
				const linkInverted = this.links.get(invertedKey);
				if (undefined !== linkInverted) {
					// linkInverted.bidirectional = true;
					return;
				}

				if (undefined === to) {
					console.warn(`Could not find associated node (asso. key: ${nodeKey})`);
					return;
				}

				const link = new Link(determinant, to, nodeKey);
				link.hide();
				this.links.set(nodeKey, link);
				this.links.set(invertedKey, link);
				this.addChildren(link);
			});
		}

		this.setUname("link:manager");
	}

	showInterDeterminantLinks(node: Determinant, preview = false) {
		const associations = AssociationManager.getDirectAssociations(node).determinant;

		for (const [detId, direction] of associations.entries()) {
			const link = this.links.get(`d${node.id}-d${detId}`);

			if (undefined === link) {
				console.warn(`Unable to find link for asso: d${node.id}-d${detId}`);
				continue;
			}

			link.direction = direction;
			link.status?.set(preview ? "preview" : "selected");
			link.show();
		}
	}

	showDeterminantPathologyLinks(node: Determinant, preview = false) {
		const associations = AssociationManager.getDirectAssociations(node).pathology;

		// Use keys as we don't need to know the real direction (all displayed as bidirectional)
		for (const pathologyId of associations.keys()) {
			const link = this.links.get(`d${node.id}-p${pathologyId}`);
			link?.show();
			link?.status?.set(preview ? "preview" : "selected");
		}
	}

	showPathologyLinks(node: Pathology) {
		const associations = AssociationManager.getDirectAssociations(node).determinant;

		// Use keys as we don't need to know the real direction (all displayed as bidirectional)
		for (const determinantId of associations.keys()) {
			const link = this.links.get(`d${determinantId}-p${node.id}`);
			link?.show();
			link?.status?.set("selected");
		}
	}

	clearLinks() {
		(this.children as Link[]).forEach((link) => link.hide());
	}
}