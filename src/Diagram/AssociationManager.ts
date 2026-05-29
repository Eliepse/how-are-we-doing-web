import type { SelectableNode } from "./Diagram";
import { Determinant } from "./Items/Determinant/Determinant";
import { Pathology } from "./Items/Pathology/Pathology";

export const Dir = {
	Source: 0,
	Target: 2,
	Bidirectional: 4,
} as const;
export type Direction = (typeof Dir)[keyof typeof Dir];
export type AssoNodeType = "facility" | "determinant" | "pathology";
type Associations = {
	facility: Map<number, Direction>,
	determinant: Map<number, Direction>,
	pathology: Map<number, Direction>,
};
type NodeRef = { type: AssoNodeType, id: number };
type Association = [NodeRef, NodeRef];


export class AssociationManager {
	// Keep track of all associations to prevents duplicates
	private static index = new Set<string>();
	private static registry: Association[] = [];

	static register(source: NodeRef, target: NodeRef, addInverse = false) {
		const key = this.makeAssoKey(source, target);
		if (false === this.index.has(key)) {
			this.registry.push([source, target]);
			this.index.add(key);
		}

		// Also register inverse side for bi-direction
		if (addInverse) {
			const inverseKey = this.makeAssoKey(target, source);
			if (false === this.index.has(inverseKey)) {
				this.registry.push([target, source]);
				this.index.add(inverseKey);
			}
		}
	}

	private static makeAssoKey(source: NodeRef, target: NodeRef): string {
		return `${source.type[0]}${source.id}.${target.type[0]}${target.id}`;
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

	static getDirectAssociations(source: SelectableNode): Associations {
		const type = this.getNodeType(source);
		const associations = {
			facility: new Map<number, Direction>(),
			determinant: new Map<number, Direction>(),
			pathology: new Map<number, Direction>(),
		};

		for (const asso of this.registry) {
			// Check if match as a source
			if (type === asso[0].type && source.id === asso[0].id) {
				// Check if the relation exists in the other way
				// const isBidirectional = this.index.has(this.makeAssoKey(asso[1], asso[0]));
				const isBidirectional = false; // Do not support bidirectionnal links for now
				associations[asso[1].type].set(asso[1].id, isBidirectional ? Dir.Bidirectional : Dir.Source);
				continue;
			}

			// Check if it matches as a target
			if (type === asso[1].type && source.id === asso[1].id) {
				// Check if the relation exists in the other way
				// const isBidirectional = this.index.has(this.makeAssoKey(asso[1], asso[0]));
				const isBidirectional = false; // Do not support bidirectionnal links for now
				associations[asso[0].type].set(asso[0].id, isBidirectional ? Dir.Bidirectional : Dir.Target);
			}
		}

		return associations;
	}

	static getAllAssociations(source: SelectableNode): Associations {
		// Determinant is directly connected to other types
		if (source instanceof Determinant) {
			return this.getDirectAssociations(source);
		}

		const type = this.getNodeType(source);
		const associations = this.getDirectAssociations(source);

		// Use determinants as pivot to get the last connected type (n+2)
		for (const asso of this.registry) {
			// Skip reference to same circle (ex: determinant <-> determinant)
			if (asso[0].type === asso[1].type) {
				continue;
			}

			if ("determinant" === asso[0].type && associations.determinant.has(asso[0].id)) {
				// Only check last type, prevents looping back
				if (type === asso[1].type) {
					continue;
				}

				const inverseKey = this.makeAssoKey(asso[1], asso[0]);
				// const isBidirectional = this.index.has(inverseKey);
				const isBidirectional = false; // Do not support bidirectionnal links for now
				associations[asso[1].type].set(asso[1].id, isBidirectional ? Dir.Bidirectional : Dir.Target);
				continue;
			}

			if ("determinant" === asso[1].type && associations.determinant.has(asso[1].id)) {
				// Only check last type, prevents looping back
				if (type === asso[0].type) {
					continue;
				}

				const inverseKey = this.makeAssoKey(asso[0], asso[1]);
				// const isBidirectional = this.index.has(inverseKey);
				const isBidirectional = false; // Do not support bidirectionnal links for now
				associations[asso[0].type].set(asso[0].id, isBidirectional ? Dir.Bidirectional : Dir.Source);
			}
		}

		return associations;
	}
}