import type { NodeRef } from "./AssociationManager";
import type { SelectableNode } from "../Diagram";
import { Pathology } from "../Items/Pathology/Pathology";
import { Determinant } from "../Items/Determinant/Determinant";
import { Facility } from "../Items/Facility/Facility";

/**
 * An association between nodes without constraints
 * (there can be any number of nodes, of any type)
 */
export class Association {
	private readonly types = new Set<NodeRef["type"]>();

	constructor(
		public readonly nodes: NodeRef[],
		public readonly sources: any[] = [],
	) {
		this.nodes.forEach((node) => this.types.add(node.type));
	}

	has(node: SelectableNode): boolean {
		if (node instanceof Pathology) {
			return this.nodes.some((v) => v.type === "pathology" && v.id === node.id);
		}

		if (node instanceof Determinant) {
			return this.nodes.some((v) => v.type === "determinant" && v.id === node.id);
		}

		if (node instanceof Facility) {
			return this.nodes.some((v) => v.type === "facility" && v.id === node.id);
		}

		return false;
	}

	/**
	 * Check if the association has at least one node of each given type
	 */
	hasTypeAll(types: NodeRef["type"][]) {
		return types.every((type) => this.types.has(type));
	}
}
