import type { SelectableNode } from "./Diagram";
import { Determinant } from "./Items/Determinant/Determinant";
import { Pathology } from "./Items/Pathology/Pathology";

export type AssoNodeType = "facility" | "determinant" | "pathology";
type AssociationDirection = "source" | "target" | "both";
type Associations = {
	facility: Set<number>,
	determinant: Set<number>,
	pathology: Set<number>,
};
type NodeRef = { type: AssoNodeType, id: number };
type Association = [NodeRef, NodeRef];

export class AssociationManager {
	static registry: Association[] = [];

	static register(source: NodeRef, target: NodeRef) {
		this.registry.push([source, target]);
	}

	static getNodeType(node: SelectableNode): AssoNodeType {
		if (node instanceof Determinant) {
			return "determinant";
		}

		if (node instanceof Pathology) {
			return "pathology";
		}

		return "facility";
	}

	static getAssociations(source: SelectableNode): Associations {
		const type = this.getNodeType(source);
		const associations = {
			facility: new Set<number>(),
			determinant: new Set<number>(),
			pathology: new Set<number>(),
		};

		for (const asso of this.registry) {
			if (type === asso[0].type && source.id === asso[0].id) {
				associations[asso[1].type].add(asso[1].id);
				continue;
			}

			if (type === asso[1].type && source.id === asso[1].id) {
				associations[asso[0].type].add(asso[0].id);
			}
		}

		return associations;
	}
}