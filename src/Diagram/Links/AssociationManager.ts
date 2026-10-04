import type { SelectableNode } from "../Diagram";
import type { Association } from "./Association";
import { AssociationView } from "./AssociationView";

export const Dir = {
	Source: 0,
	Target: 2,
	Bidirectional: 4,
} as const;
export type Direction = (typeof Dir)[keyof typeof Dir];
export type AssoNodeType = "facility" | "determinant" | "pathology";
export type NodeRef = { type: AssoNodeType; id: number };

/**
 * Singleton responsible for all associations (links) between elements in the diagram
 */
export class AssociationManager {
	private static registry: Association[] = [];

	static register(association: Association) {
		this.registry.push(association);
	}

	static filterByNode(source: SelectableNode): AssociationView {
		return new AssociationView(this.registry.filter((association) => association.has(source)));
	}

	static all(): AssociationView {
		return new AssociationView(this.registry);
	}
}
