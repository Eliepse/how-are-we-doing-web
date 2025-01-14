import db from "../../database.json";
import type { WithLifecycle } from "../Engine2D/Contract/WithLifecycle";
import type { Engine } from "../Engine2D/Core/Engine";
import { NodeEvent } from "../Engine2D/Core/NodeEvent";
import { Node2D } from "../Engine2D/Node2D";
import { Angle } from "../Engine2D/Parameters/Angle";
import { Vector } from "../Engine2D/Vector";
import { ArcGroup } from "./ArcGroup";
import { Determinant } from "./Items/Determinant/Determinant";
import { DeterminantFamily } from "./Items/Determinant/DeterminantFamily";
import { DeterminantsRing } from "./Items/Determinant/DeterminantsRing";
import { DeterminantSubFamily } from "./Items/Determinant/DeterminantSubFamily";
import { determinantAssets } from "./Items/Determinant/shapes";
import { FacilitiesRing } from "./Items/Facility/FacilitiesRing";
import { Facility } from "./Items/Facility/Facility";
import { FacilityFamily } from "./Items/Facility/FacilityFamily";
import { Pathology } from "./Items/Pathology/Pathology";
import { PathologyFamily } from "./Items/Pathology/PathologyFamily";

export type SelectableNode = Pathology | Determinant | Facility;

export class Diagram extends Node2D implements WithLifecycle {
	private _selectedNode: SelectableNode | undefined = undefined;
	private _pathologies = new Map<number, Pathology>();
	private _determinants = new Map<number, Determinant>();

	constructor() {
		super();

		this.addListener("click", (e: NodeEvent) => {
			const target = e.target;

			if (
				target instanceof Pathology ||
				target instanceof Determinant ||
				target instanceof Facility
			) {
				this.selectNode(target);
				e.stopPropagation();
				return;
			}

			this.selectNode(undefined);
		});

		this.addChildren(new FacilitiesRing(this.buildFacilityGroups(db.facilities), 440));
		this.addChildren(new DeterminantsRing(this.buildDeterminantFamilies(db.determinants)));

		db.pathologies.forEach((familyData, index) => {
			const children = familyData.children.map((child) => {
				const associatedDeterminants = Object.keys(child.determinants).map((v) => parseInt(v));
				const pathology = new Pathology(child.id, child.name, {
					determinants: associatedDeterminants,
				});
				this._pathologies.set(pathology.id, pathology);
				return pathology;
			});

			const family = new PathologyFamily(children, 96);
			family.setPosition(Vector.Right.mul(100).rot(index * Math.PI * (2 / 3)));
			this.addChildren(family);
		});
	}

	onMount(engine: Engine): void | (() => void) {
		//
	}

	onRender(deltaTime: number): void {
		//
	}

	onUnmount(engine: Engine): void {
		//
	}

	private buildFacilityGroups(groups: typeof db.facilities): Array<ArcGroup<Facility>> {
		const totalFacilities = groups.reduce((sum, family) => sum + family.children.length, 0);
		const itemArc = new Angle(Math.PI * 2).div(totalFacilities);

		return groups.map(
			(group) =>
				new FacilityFamily(
					group.name,
					group.children.map((child) => {
						const associatedDeterminants = Object.keys(child.determinants).map((v) =>
							parseInt(v),
						);
						return new Facility(
							child.id,
							child.name,
							{ determinants: associatedDeterminants },
							itemArc,
						);
					}),
					new Angle(),
					450,
				),
		);
	}

	private buildDeterminantFamilies(data: typeof db.determinants): Array<DeterminantFamily> {
		const totalDeterminants = data.reduce(
			(sum, family) =>
				family.children.reduce((sum, subFamily) => sum + subFamily.children.length, sum),
			0,
		);
		const itemArc = new Angle(Math.PI * 2).div(totalDeterminants);
		let ringAngleCursor = new Angle();

		return data.map((familyData) => {
			let familyAngleCursor = new Angle();

			const subFamilies = familyData.children.map((subFamilyData) => {
				const determinants = subFamilyData.children;
				const subFamilyArc = itemArc.mul(determinants.length);
				const asset = determinantAssets[subFamilyData.name as keyof typeof determinantAssets];

				if (undefined === asset) {
					throw new Error("Cannot find the determinant asset");
				}

				const subFamily = new DeterminantSubFamily(
					subFamilyData.name,
					determinants.map((child) => {
						const assoPathologies = Object.keys(child.pathologies).map((v) => parseInt(v));
						const assoFacilities = Object.keys(child.facilities).map((v) => parseInt(v));
						const determinant = new Determinant(
							child.id,
							child.name,
							asset,
							{ arc: itemArc },
							{ facilities: assoFacilities, pathologies: assoPathologies },
						);

						this._determinants.set(determinant.id, determinant);

						return determinant;
					}),
					subFamilyArc,
					360,
				);

				subFamily.setRotation(familyAngleCursor);
				familyAngleCursor = familyAngleCursor.add(subFamilyArc);

				return subFamily;
			});

			const family = new DeterminantFamily(subFamilies);

			family.setRotation(ringAngleCursor);
			ringAngleCursor = ringAngleCursor.add(familyAngleCursor);

			return family;
		});
	}

	selectNode(node: SelectableNode | undefined): void {
		if (this._selectedNode === node) {
			return;
		}

		if (this._selectedNode instanceof Pathology) {
			const parent = this._selectedNode.getParent() as PathologyFamily;
			parent.paused = false;
		}

		if (node instanceof Pathology) {
			const parent = node.getParent() as PathologyFamily;
			parent.paused = true;
		}

		this._selectedNode = node;
		this.dispatchEvent(new NodeEvent("nodeSelected", this._selectedNode));
	}

	getSelectedNode(): SelectableNode | undefined {
		return this._selectedNode;
	}

	getPathologies(): Map<number, Pathology> {
		return this._pathologies;
	}

	getDeterminants(): Map<number, Determinant> {
		return this._determinants;
	}
}
