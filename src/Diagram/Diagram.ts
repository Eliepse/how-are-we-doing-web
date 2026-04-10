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
import { Engine } from "../Engine2D/Engine";
import { Opacity } from "../Engine2D/ValueObject/Opacity";
import { easeOutCubic, interpolateOpacity } from "../Engine2D/Time/interpolations";
import { Transition } from "../Engine2D/Time/Transition";
import { LinkManager } from "./Items/Link/LinkManager";
import { AssociationManager, type AssoNodeType } from "./AssociationManager";

export type Family = "pathology" | "determinant" | "facility";
export type SelectableNode = Pathology | Determinant | Facility;

export type PathologiesData = (typeof db)["pathologies"];
export type FacilitiesData = (typeof db)["facilities"];
export type DeterminantsData = (typeof db)["determinants"];
export type AssociationsData = (typeof db)["associations"];

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
	public links: "pathologies" | "determinants" = "pathologies";

	constructor(
		pathologiesData: PathologiesData,
		facilitiesData: FacilitiesData,
		determinantsData: DeterminantsData,
		associationData: AssociationsData,
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
		facilities.setUname("group:facility");
		this.addChildren(facilities);

		const determinants = new DeterminantsRing(this.buildDeterminantFamilies(
			determinantsData,
			associationData.filter((asso) => "determinant" === asso.from.type)),
		);
		determinants.setUname("group:determinant");
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
		pathologies.setUname("group:pathology");
		pathologiesData.forEach((familyData, index) => {
			const children = familyData.children.map((child) => {
				const assoDeterminants = Object.keys(child.determinants).map((v) => parseInt(v));

				// Register assocations
				assoDeterminants.forEach((id) => AssociationManager.register(
					{ type: "facility", id: child.id },
					{ type: "determinant", id },
				));

				const pathology = new Pathology(child.id, child.name, {
					determinants: assoDeterminants,
				});
				this._pathologies.set(pathology.id, pathology);
				return pathology;
			});

			const family = new PathologyFamily(familyData.name, children, 96);
			family.setPosition(Vector.Right.mul(100).rot((-index * Math.PI * (2 / 3)) + (Math.PI * .75)));
			pathologies.addChildren(family);
		});
		this.addChildren(pathologies);

		// Register associations
		associationData.forEach((asso) => {
			AssociationManager.register(
				{ type: asso.from.type as AssoNodeType, id: asso.from.id },
				{ type: asso.to.type as AssoNodeType, id: asso.to.id },
			);
		});

		this.addChildren(this.decorations = new BgDecorationManager());
		this.addChildren(new LinkManager(this._pathologies, this._determinants));
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
						const assoDeterminants = Object.keys(child.determinants).map((v) =>
							parseInt(v),
						);

						// Register associations
						assoDeterminants.forEach((id) => AssociationManager.register(
							{ type: "facility", id: child.id },
							{ type: "determinant", id },
						));

						const facility = new Facility(
							child.id,
							child.name,
							{ determinants: assoDeterminants },
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

	private buildDeterminantFamilies(data: DeterminantsData, associations: AssociationsData): Array<DeterminantFamily> {
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

						// Register associations
						assoPathologies.forEach((id) => AssociationManager.register(
							{ type: "determinant", id: child.id },
							{ type: "pathology", id },
						));
						assoFacilities.forEach((id) => AssociationManager.register(
							{ type: "determinant", id: child.id },
							{ type: "facility", id },
						));

						const determinant = new Determinant(
							child.id,
							child.name as DeterminantKey,
							child.name,
							asset,
							{ arc: itemArc },
							{
								facilities: assoFacilities,
								pathologies: assoPathologies,
								determinants: associations.filter(asso => child.id === asso.from.id && "determinant" === asso.to.type).map(asso => asso.to.id),
							},
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

		if (undefined === node) {
			this._selectedNode = undefined;
			this.updateNodesHighlight();
			this.dispatchEvent(new NodeEvent("nodeSelected", undefined));
			return;
		}

		if ("determinants" === this.links && !(node instanceof Determinant)) {
			return;
		}

		// Stop pathology movement
		if (this._selectedNode instanceof Pathology) {
			const parent = this._selectedNode.getParent() as PathologyFamily;
			parent.paused = false;
		}

		this._selectedNode = node;
		this.updateNodesHighlight();
		this.dispatchEvent(new NodeEvent("nodeSelected", this._selectedNode));
	}

	previewNode(node: SelectableNode | undefined): void {
		if (this._previewedNode === node) {
			return;
		}

		if (undefined === node || node instanceof Determinant) {
			this._previewedNode = node;
			this.updateNodesHighlight();
			this.dispatchEvent(new NodeEvent("nodePreviewed", this._previewedNode));
		}
	}

	private updateNodesHighlight() {
		const isDetsMode = "determinants" === this.links;
		const linkManager = Engine.nodeByUname<LinkManager>("link:manager");
		const determinants = Engine.nodesByTag<Determinant>("determinant");
		const facilities = Engine.nodesByTag<Facility>("facility");
		const pathologies = Engine.nodesByTag<Pathology>("pathology");
		const previewAssoc = this._previewedNode ? AssociationManager.getAllAssociations(this._previewedNode) : null;
		const selectionAssoc = this._selectedNode ? AssociationManager.getAllAssociations(this._selectedNode) : null;
		const hasActiveNode = undefined !== (this._previewedNode || this._selectedNode);

		linkManager?.clearLinks();

		for (const determinant of determinants) {
			if (this._selectedNode === determinant) {
				determinant.setStatus("selected");
				continue;
			}

			if (selectionAssoc?.determinant?.has(determinant.id)) {
				determinant.setStatus(isDetsMode ? "selected" : "preview");
				continue;
			}

			if (this._previewedNode === determinant) {
				determinant.setStatus("preview");
				continue;
			}

			if (this._selectedNode instanceof Determinant && !isDetsMode) {
				determinant.setStatus(selectionAssoc?.determinant?.has(determinant.id) ? "preview" : "dimmed");
				continue;
			}

			if(previewAssoc?.determinant?.has(determinant.id)) {
				determinant.setStatus("preview");
				continue;
			}

			determinant.setStatus(hasActiveNode ? "dimmed" : false);
		}

		for (const facility of facilities) {
			if (isDetsMode) {
				facility.setStatus(false);
				continue;
			}

			if (this._selectedNode === facility || selectionAssoc?.facility?.has(facility.id)) {
				facility.setStatus("selected");
				continue;
			}

			if (this._previewedNode === facility || previewAssoc?.facility?.has(facility.id)) {
				facility.setStatus("preview");
				continue;
			}

			facility.setStatus(hasActiveNode ? "dimmed" : false);
		}

		for (const pathology of pathologies) {
			if (isDetsMode) {
				pathology.setStatus(false);
				continue;
			}

			if (this._selectedNode === pathology || selectionAssoc?.pathology?.has(pathology.id)) {
				pathology.setStatus("selected");
				continue;
			}

			if (this._previewedNode === pathology || previewAssoc?.pathology?.has(pathology.id)) {
				pathology.setStatus("preview");
				continue;
			}

			pathology.setStatus(hasActiveNode ? "dimmed" : false);
		}

		// Update decoration
		if (this._selectedNode instanceof Pathology) {
			const parent = this._selectedNode.getParent() as PathologyFamily;
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

		// Update links
		if (isDetsMode) {
			if (this._previewedNode instanceof Determinant) {
				linkManager?.showInterDeterminantLinks(this._previewedNode, true);
			}

			if (this._selectedNode instanceof Determinant) {
				linkManager?.showInterDeterminantLinks(this._selectedNode);
			}

			return;
		}

		if (this._previewedNode instanceof Determinant) {
			linkManager?.showDeterminantPathologyLinks(this._previewedNode, true);
		}

		if (this._selectedNode instanceof Determinant) {
			linkManager?.showDeterminantPathologyLinks(this._selectedNode);
		} else if (this._selectedNode instanceof Pathology) {
			linkManager?.showPathologyLinks(this._selectedNode);
		}
	}

	getSelectedNode(): SelectableNode | undefined {
		return this._selectedNode;
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

	setLinksMode(type: "determinants" | "pathologies") {
		this.links = type;
		const families = {
			pathology: Engine.nodeByUname("group:pathology"),
			determinant: Engine.nodeByUname("group:determinant"),
			facility: Engine.nodeByUname("group:facility"),
		};

		if ("determinants" === type) {
			transitionNodeOpacity(families.pathology, 500, new Opacity(.1));
			transitionNodeOpacity(families.determinant, 500, Opacity.Opaque);
			transitionNodeOpacity(families.facility, 500, new Opacity(.1));
			transitionNodeOpacity(this.decorations, 500, new Opacity(.1));

			this._selectedNode = this._selectedNode instanceof Determinant ? this._selectedNode : undefined;
			this._previewedNode = this._previewedNode instanceof Determinant ? this._previewedNode : undefined;

			this.updateNodesHighlight();
			return;
		}

		// Default
		transitionNodeOpacity(families.pathology, 500, Opacity.Opaque);
		transitionNodeOpacity(families.determinant, 500, Opacity.Opaque);
		transitionNodeOpacity(families.facility, 500, Opacity.Opaque);
		transitionNodeOpacity(this.decorations, 500, Opacity.Opaque);

		this.updateNodesHighlight();
	}

	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.backgroundBlobClock.commit();
	}

	override shouldRerender(): boolean {
		return super.shouldRerender() || this.backgroundBlobClock.hasChanged();
	}
}

function transitionNodeOpacity(node: Node2D | undefined, duration: number, to: Opacity) {
	if (!node) {
		return;
	}

	const from = node.getOpacity().get();
	Engine.registerTransition(
		new Transition(duration, (v) => node.setOpacity(interpolateOpacity(v, from, to)), { easeFn: easeOutCubic }),
	);
}
