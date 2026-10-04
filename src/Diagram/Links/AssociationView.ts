import type { NodeRef } from "./AssociationManager";
import type { SelectableNode } from "../Diagram";
import { Pathology } from "../Items/Pathology/Pathology";
import { Determinant } from "../Items/Determinant/Determinant";
import { Facility } from "../Items/Facility/Facility";
import type { Association } from "./Association";

/**
 * Hold a set of associations optimized for nodes lookup (method `has()`)
 */
export class AssociationView {
	public readonly pathologies = new Set<NodeRef["id"]>();
	public readonly determinants = new Set<NodeRef["id"]>();
	public readonly facilities = new Set<NodeRef["id"]>();

	constructor(public readonly associations: Association[]) {
		// Extract all referenced nodes to enable quick check
		for (const association of associations) {
			for (const node of association.nodes) {
				switch (node.type) {
					case "pathology":
						this.pathologies.add(node.id);
						break;
					case "determinant":
						this.determinants.add(node.id);
						break;
					case "facility":
						this.facilities.add(node.id);
						break;
					default:
						console.warn(`Undefined link node type: ${node.type}`);
				}
			}
		}
	}

	has(node: SelectableNode): boolean {
		if (node instanceof Pathology) {
			return this.pathologies.has(node.id);
		}

		if (node instanceof Determinant) {
			return this.determinants.has(node.id);
		}

		if (node instanceof Facility) {
			return this.facilities.has(node.id);
		}

		return false;
	}

	/**
	 * Extract a new view with all associations that contains at least one of each given types
	 */
	filterByTypeAll(types: NodeRef["type"][]) {
		return new AssociationView(this.associations.filter((association) => association.hasTypeAll(types)));
	}

	/**
	 * Extract a new view with all associations that only contains determinants
	 */
	filterByOnlyDeterminants() {
		return new AssociationView(this.associations.filter((association) => association.hasOnlyDeterminant()));
	}
}
