import type db from "../public/data/database.json";
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
import { type Context } from "./Context";
import { BgDecorationManager } from "./Decoration/BgDecorationManager";
import { Attribute } from "../Engine2D/Core/Attribute";
import { type RenderType, RenderTypes } from "../Engine2D/Engine";
import { Opacity } from "../Engine2D/ValueObject/Opacity";

export type Family = "pathology" | "determinant" | "facility";
export type SelectableNode = Pathology | Determinant | Facility;

export type PathologiesData = (typeof db)["pathologies"];
export type FacilitiesData = (typeof db)["facilities"];
export type DeterminantsData = (typeof db)["determinants"];

type Source = { source: string; doi: string };
type SourceList = Map<number, Array<Source>>;

export class Diagram extends Node2D {
	private _selectedNode: SelectableNode | undefined = undefined;
	private _previewedNode: SelectableNode | undefined = undefined;
	private _pathologies = new Map<number, Pathology>();
	private _determinants = new Map<number, Determinant>();
	private _facilities = new Map<number, Facility>();
	private _linksSources = new Map<
		Determinant["id"],
		{ pathologies: SourceList; facilities: SourceList }
	>();
	public backgroundBlobClock = new Attribute(0);
	public decorations: BgDecorationManager;
	private families: { [key in Family]: Node2D };

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

		this.addListener("mouseenter", (e: NodeEvent) => {
			if (e.target instanceof Determinant) {
				this.previewNode(e.target);
			}
		});
		this.addListener("mouseleave", (e: NodeEvent) => e.target instanceof Determinant && this.previewNode(undefined));

		const facilities = new FacilitiesRing(this.buildFacilityGroups(facilitiesData));
		facilities.setRotation(Angle.fromDeg(156));
		this.addChildren(facilities);

		const determinants = new DeterminantsRing(this.buildDeterminantFamilies(determinantsData));
		determinants.setRotation(Angle.fromDeg(266));
		this.addChildren(determinants);

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

		const pathologies = new Node2D();
		pathologiesData.forEach((familyData, index) => {
			const children = familyData.children.map((child) => {
				const associatedDeterminants = Object.keys(child.determinants).map((v) => parseInt(v));
				const pathology = new Pathology(child.id, child.name, {
					determinants: associatedDeterminants,
				});
				this._pathologies.set(pathology.id, pathology);
				return pathology;
			});

			const family = new PathologyFamily(familyData.name, children, 96);
			family.setPosition(Vector.Right.mul(100).rot((-index * Math.PI * (2 / 3)) + (Math.PI * .75)));
			pathologies.addChildren(family);
		});
		this.addChildren(pathologies);

		this.addChildren(this.decorations = new BgDecorationManager());

		this.families = {
			determinant: determinants,
			facility: facilities,
			pathology: pathologies,
		};
	}

	override onProcess(deltaTime: number): void {
		super.onProcess(deltaTime);
		this.backgroundBlobClock.set((_, current) => current + deltaTime);
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
					480,
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

		// Stop pathology movement
		if (this._selectedNode instanceof Pathology) {
			const parent = this._selectedNode.getParent() as PathologyFamily;
			parent.paused = false;
		}

		// Update decoration
		if (node instanceof Pathology) {
			const parent = node.getParent() as PathologyFamily;
			parent.paused = true;

			if ("social" === parent.name) {
				this.decorations.select("social");
			} else if ("mental" === parent.name) {
				this.decorations.select("mental");
			} else if ("physical" === parent.name) {
				this.decorations.select("physical");
			}
		} else {
			this.decorations.select(undefined);
		}

		this._selectedNode = node;
		this.updateNodesHighlight();
		this.dispatchEvent(new NodeEvent("nodeSelected", this._selectedNode));
	}

	previewNode(previewNode: SelectableNode | undefined): void {
		if (this._previewedNode === previewNode) {
			return;
		}

		if (undefined !== previewNode && !(previewNode instanceof Determinant)) {
			return;
		}

		this._previewedNode = previewNode;
		this.updateNodesHighlight();
		this.dispatchEvent(new NodeEvent("nodePreviewed", this._previewedNode));
	}

	private updateNodesHighlight() {
		const nodes = [
			...this._determinants.values(),
			...this._facilities.values(),
			...this._pathologies.values(),
		];

		for (const node of nodes) {
			if (undefined !== this._selectedNode) {
				if (node === this._selectedNode || node.isConnected(this._selectedNode)) {
					node.setStatus("selected");
					continue;
				}
			}

			if (undefined !== this._previewedNode) {
				if (node === this._previewedNode || node.isConnected(this._previewedNode)) {
					node.setStatus("preview");
					continue;
				}

			}

			if (undefined == this._selectedNode && undefined == this._previewedNode) {
				node.setStatus(false);
			} else {
				node.setStatus("dimmed");
			}
		}
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
				determinant.notApplicable();
				continue;
			}

			determinant.setStep(value);
		}
	}

	focusFamily(type: Family | false) {
		if (false === type) {
			this.families.pathology.setOpacity(Opacity.Opaque);
			this.families.determinant.setOpacity(Opacity.Opaque);
			this.families.facility.setOpacity(Opacity.Opaque);
			this.decorations.setOpacity(Opacity.Opaque);
			return;
		}

		this.families.pathology.setOpacity("pathology" === type ? Opacity.Opaque : new Opacity(.1));
		this.families.determinant.setOpacity("determinant" === type ? Opacity.Opaque : new Opacity(.1));
		this.families.facility.setOpacity("facility" === type ? Opacity.Opaque : new Opacity(.1));
		this.decorations.setOpacity("facility" === type ? Opacity.Opaque : new Opacity(.1));
	}

	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.backgroundBlobClock.commit();
	}


	override renderState(): RenderType {
		const parent = super.renderState();

		if (RenderTypes.Breaking === parent) {
			return parent;
		}

		return this.backgroundBlobClock.hasChanged() ? RenderTypes.Paint : parent;
	}
}
