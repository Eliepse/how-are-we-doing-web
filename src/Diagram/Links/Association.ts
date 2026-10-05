import type { NodeRef } from "./AssociationManager";
import type { SelectableNode } from "../Diagram";
import { Pathology } from "../Items/Pathology/Pathology";
import { Determinant } from "../Items/Determinant/Determinant";
import { Facility } from "../Items/Facility/Facility";
import type { Source } from "./Source";

/**
 * An association between nodes without constraints
 * (there can be any number of nodes, of any type)
 */
export class Association {
	private readonly types = new Set<NodeRef["type"]>();

	constructor(
		public readonly nodes: NodeRef[],
		public readonly sources: Source[] = [],
	) {
		this.nodes.forEach((node) => this.types.add(node.type));
	}

	/**
	 * Check if the given node is included in the association
	 *
	 * @param node The node to search
	 * @param atPosition Match the node at a specific position in the association
	 */
	has(node: SelectableNode, atPosition?: number): boolean {
		const type = this.getNodeType(node);

		// Match at a specific position
		if (undefined !== atPosition) {
			const target = this.nodes[atPosition] ?? null;
			return target?.id === node.id && target?.type === type;
		}

		// Match at least one (no positional condition)
		return this.nodes.some((target) => target.type === type && target.id === node.id);
	}

	private getNodeType(node: SelectableNode): NodeRef["type"] {
		if (node instanceof Pathology) {
			return "pathology";
		}

		if (node instanceof Determinant) {
			return "determinant";
		}

		if (node instanceof Facility) {
			return "facility";
		}

		throw new Error("Unsupported node");
	}

	/**
	 * Check if the association has at least one node of each given type
	 */
	hasTypeAll(types: NodeRef["type"][]) {
		return types.every((type) => this.types.has(type));
	}

	/**
	 * Check if the association only exists between determinants
	 */
	hasOnlyDeterminant() {
		return 1 === this.types.size && this.types.has("determinant");
	}
}
