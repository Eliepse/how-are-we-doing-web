import type db from "../../database.json";
import type { WithLifecycle } from "../Engine2D/Contract/WithLifecycle";
import type { Engine } from "../Engine2D/Engine";
import { NodeEvent } from "../Engine2D/Core/NodeEvent";
import { Node2D } from "../Engine2D/Node/Node2D";
import { Angle } from "../Engine2D/ValueObject/Angle";
import { Vector } from "../Engine2D/ValueObject/Vector";
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
import type { DeterminantKey } from "./types";
import type { Context } from "./Context";

export type SelectableNode = Pathology | Determinant | Facility;

export type PathologiesData = (typeof db)["pathologies"];
export type FacilitiesData = (typeof db)["facilities"];
export type DeterminantsData = (typeof db)["determinants"];

type Source = { source: string; doi: string };
type SourceList = Map<number, Array<Source>>;

export class Diagram extends Node2D implements WithLifecycle {
	private _selectedNode: SelectableNode | undefined = undefined;
	private _pathologies = new Map<number, Pathology>();
	private _determinants = new Map<number, Determinant>();
	private _facilities = new Map<number, Facility>();
	private _linksSources = new Map<
		Determinant["id"],
		{ pathologies: SourceList; facilities: SourceList }
	>();
	public backgroundBlobClock: number = 0;

	constructor(
		pathologiesData: PathologiesData,
		facilitiesData: FacilitiesData,
		determinantsData: DeterminantsData,
	) {
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

		this.addChildren(new FacilitiesRing(this.buildFacilityGroups(facilitiesData), 440));
		this.addChildren(new DeterminantsRing(this.buildDeterminantFamilies(determinantsData)));

		determinantsData.forEach((family) =>
			family.children.forEach((subFamily) =>
				subFamily.children.forEach((det) => {
					const pathologiesSources: SourceList = new Map();
					const facilitiesSources: SourceList = new Map();

					Object.entries(det.pathologies).forEach(([id, sources]) =>
						pathologiesSources.set(parseInt(id), sources.sources),
					);

					Object.entries(det.facilities).forEach(([id, sources]) =>
						facilitiesSources.set(parseInt(id), sources.sources),
					);

					this._linksSources.set(det.id, {
						pathologies: pathologiesSources,
						facilities: facilitiesSources,
					});
				}),
			),
		);

		pathologiesData.forEach((familyData, index) => {
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
		this.backgroundBlobClock += deltaTime;
	}

	onUnmount(engine: Engine): void {
		//
	}

	private buildFacilityGroups(groups: FacilitiesData): Array<ArcGroup<Facility>> {
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
						const facility = new Facility(
							child.id,
							child.name,
							{ determinants: associatedDeterminants },
							itemArc,
						);

						this._facilities.set(facility.id, facility);

						return facility;
					}),
					new Angle(),
					450,
				),
		);
	}

	private buildDeterminantFamilies(data: DeterminantsData): Array<DeterminantFamily> {
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
							child.name as DeterminantKey,
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

	getFacilities(): Map<number, Facility> {
		return this._facilities;
	}

	getActiveNodes(): {
		pathologies: Pathology[];
		determinants: Determinant[];
		facilities: Facility[];
	} {
		const selectedNode = this._selectedNode;

		if (undefined === selectedNode) {
			return { pathologies: [], determinants: [], facilities: [] };
		}

		let facilitiesId: number[] = [];
		let determinantsId: number[] = [];
		let pathologiesId: number[] = [];

		if (selectedNode instanceof Determinant) {
			facilitiesId = selectedNode.associations.facilities;
			determinantsId = [selectedNode.id];
			pathologiesId = selectedNode.associations.pathologies;
		} else if (selectedNode instanceof Facility) {
			facilitiesId = [selectedNode.id];
			determinantsId = selectedNode.associations.determinants;
			selectedNode.associations.determinants.forEach((id) => {
				const pathologies = this._determinants.get(id)?.associations?.pathologies;
				pathologies?.forEach((patId) => pathologiesId.push(patId));
			});
		} else if (selectedNode instanceof Pathology) {
			pathologiesId = [selectedNode.id];
			determinantsId = selectedNode.associations.determinants;
			selectedNode.associations.determinants.forEach((id) => {
				const facilities = this._determinants.get(id)?.associations?.facilities;
				facilities?.forEach((facId) => facilitiesId.push(facId));
			});
		}

		return {
			pathologies: pathologiesId
				.map((id) => this._pathologies.get(id))
				.filter((v) => undefined !== v),
			determinants: determinantsId
				.map((id) => this._determinants.get(id))
				.filter((v) => undefined !== v),
			facilities: facilitiesId
				.map((id) => this._facilities.get(id))
				.filter((v) => undefined !== v),
		};
	}

	getActiveLinksSources(): { pathologies: Source[]; facilities: Source[] } {
		const sources = { pathologies: [], facilities: [] } as {
			pathologies: Source[];
			facilities: Source[];
		};

		if (undefined === this._selectedNode) {
			return sources;
		}

		const activeNodes = this.getActiveNodes();

		activeNodes.determinants.forEach((determinant) => {
			const links = this._linksSources.get(determinant.id);

			if (undefined === links) {
				return;
			}

			activeNodes.facilities.forEach((facility) =>
				sources.facilities.push(...(links.facilities.get(facility.id) ?? [])),
			);

			activeNodes.pathologies.forEach((pathologies) =>
				sources.pathologies.push(...(links.pathologies.get(pathologies.id) ?? [])),
			);
		});

		return sources;
	}

	contextualizeDeterminants(context: Context): void {
		for (const determinant of this._determinants.values()) {
			const value = context.getValue(determinant.key);

			if (null === value) {
				continue;
			}

			determinant.setStep(value);
		}
	}
}
