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
import { AssociationManager, type AssoNodeType, Dir } from "./AssociationManager";
import { linkGradient } from "./Shape/LinkGradient";
import { App } from "../App";

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

			if (target instanceof Determinant && !App.feature("determinant")) {
				this.selectNode(undefined);
				return;
			} else if (target instanceof Pathology && !App.feature("pathology")) {
				this.selectNode(undefined);
				return;
			} else if (target instanceof Facility && !App.feature("facility")) {
				this.selectNode(undefined);
				return;
			}

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
			const target = e.target;

			if (target instanceof Determinant && !App.feature("determinant")) {
				return;
			} else if (target instanceof Pathology && !App.feature("pathology")) {
				return;
			} else if (target instanceof Facility && !App.feature("facility")) {
				return;
			}

			if (target instanceof Determinant) {
				this.previewNode(target);
				return;
			}

			if ("determinants" !== this.links && (target instanceof Pathology || target instanceof Facility)) {
				this.previewNode(target);
				return;
			}
		});
		this.addListener("mouseleave", (e: NodeEvent) => {
			const target = e.target;

			if (target instanceof Determinant && !App.feature("determinant")) {
				return;
			} else if (target instanceof Pathology && !App.feature("pathology")) {
				return;
			} else if (target instanceof Facility && !App.feature("facility")) {
				return;
			}

			if (target instanceof Determinant || target instanceof Pathology || target instanceof Facility) {
				this.previewNode(undefined);
			}
		});

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
					true,
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
				false,
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
							true,
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
							true,
						));
						assoFacilities.forEach((id) => AssociationManager.register(
							{ type: "determinant", id: child.id },
							{ type: "facility", id },
							true,
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

		if ("determinants" === this.links && node instanceof Determinant) {
			linkGradient.setCenter(node.getGlobalPosition().get());
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

		this._previewedNode = node;
		this.updateNodesHighlight();
		this.dispatchEvent(new NodeEvent("nodePreviewed", this._previewedNode));
	}

	public updateNodesHighlight() {
		const linkManager = Engine.nodeByUname<LinkManager>("link:manager");
		const determinants = Engine.nodesByTag<Determinant>("determinant");
		const facilities = Engine.nodesByTag<Facility>("facility");
		const pathologies = Engine.nodesByTag<Pathology>("pathology");
		const detMode = App.feature("focus-determinant");
		const hasActiveNode = undefined !== (this._previewedNode || this._selectedNode);
		let previewAssoc, selectionAssoc = null;

		if (this._previewedNode instanceof Determinant && this._previewedNode !== this._selectedNode) {
			previewAssoc = AssociationManager.getAllAssociations(this._previewedNode, detMode ? Dir.Source : undefined);
		}

		if (this._selectedNode) {
			selectionAssoc = AssociationManager.getAllAssociations(this._selectedNode, detMode ? Dir.Source : undefined);
		}

		linkManager?.clearLinks();

		const withDetailedAssocs = App.feature("detailed-relations");
		for (const determinant of determinants) {
			if (false === App.feature("determinant")) {
				determinant.setStatus("dimmed");
				continue;
			}

			if (this._selectedNode === determinant) {
				determinant.setStatus("selected");
				continue;
			}

			if (selectionAssoc?.determinant?.has(determinant.id)) {
				if (!(this._selectedNode instanceof Determinant)) {
					determinant.setStatus("selected");
					continue;
				}

				if (withDetailedAssocs) {
					determinant.setStatus("n+1");
					continue;
				}
			}

			if (this._previewedNode === determinant) {
				determinant.setStatus("preview");
				continue;
			}

			if (previewAssoc?.determinant?.has(determinant.id) && withDetailedAssocs) {
				determinant.setStatus("n+1");
				continue;
			}

			determinant.setStatus(hasActiveNode && this._previewedNode instanceof Determinant ? "dimmed" : false);
		}

		const isPreviewSecondary = "n+1" === this._previewedNode?.status?.get();

		const withFacilities = App.feature("facility");
		const withFacilityAssocs = App.feature("det-links:facility");
		for (const facility of facilities) {
			if (false === withFacilities) {
				facility.setStatus("dimmed");
				continue;
			}

			if (this._selectedNode === facility) {
				facility.setStatus("selected");
				continue;
			} else if (this._previewedNode === facility) {
				facility.setStatus("preview");
				continue;
			} else if (withFacilityAssocs) {
				if (selectionAssoc?.facility?.has(facility.id)) {
					facility.setStatus("selected");
					continue;
				} else if (previewAssoc?.facility?.has(facility.id)) {
					facility.setStatus("preview");
					continue;
				}
			}

			facility.setStatus(hasActiveNode && this._previewedNode instanceof Facility ? "dimmed" : false);
		}

		const withPathologies = App.feature("pathology");
		const withPathologyAssocs = App.feature("det-links:pathology");
		for (const pathology of pathologies) {
			if (false === withPathologies) {
				pathology.setStatus("dimmed");
				continue;
			}

			if (this._selectedNode === pathology || selectionAssoc?.pathology?.has(pathology.id)) {
				pathology.setStatus("selected");
				continue;
			} else if (this._previewedNode === pathology || previewAssoc?.pathology?.has(pathology.id)) {
				pathology.setStatus(isPreviewSecondary ? "n+1" : "preview");
				continue;
			} else if (withPathologyAssocs) {
				if (selectionAssoc?.pathology?.has(pathology.id)) {
					pathology.setStatus("selected");
					continue;
				} else if (previewAssoc?.pathology?.has(pathology.id)) {
					pathology.setStatus("preview");
					continue;
				}
			}

			pathology.setStatus(hasActiveNode && this._previewedNode instanceof Pathology ? "dimmed" : false);
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

		if (false === App.feature("determinant")) {
			return;
		}

		// Update links
		if (App.feature("focus-determinant")) {
			if (this._previewedNode instanceof Determinant) {
				linkManager?.showInterDeterminantLinks(this._previewedNode, true);
			}

			if (this._selectedNode instanceof Determinant) {
				linkManager?.showInterDeterminantLinks(this._selectedNode);
			}

			return;
		}

		if (App.feature("det-links:pathology")) {
			const noSelection = !this._selectedNode;

			// Only display links for hovered node for secondary nodes, or if there's no selection
			if (this._previewedNode instanceof Determinant && (noSelection || isPreviewSecondary)) {
				linkManager?.showDeterminantPathologyLinks(this._previewedNode, true);
			}

			if (this._selectedNode instanceof Determinant) {
				linkManager?.showDeterminantPathologyLinks(this._selectedNode);
			} else if (this._selectedNode instanceof Pathology) {
				linkManager?.showPathologyLinks(this._selectedNode);
			} else if (this._selectedNode instanceof Facility) {
				linkManager?.showDeterminantPathologyLinksFromFacility(this._selectedNode);
			}
		}
	}

	getSelectedNode(): SelectableNode | undefined {
		return this._selectedNode;
	}

	getPreviewNode(): SelectableNode | undefined {
		return this._previewedNode;
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
		} else {
			// noinspection SuspiciousTypeOfGuard
			if (selectedNode instanceof Pathology) {
				pathologiesId = [selectedNode.id];
				determinantsId = selectedNode.associations.determinants;
				selectedNode.associations.determinants.forEach((id) => {
					const facilities = this._determinants.get(id)?.associations?.facilities;
					facilities?.forEach((facId) => facilitiesId.push(facId));
				});
			}
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

	updateRingsOpacity() {
		const families = {
			pathology: Engine.nodeByUname("group:pathology"),
			determinant: Engine.nodeByUname("group:determinant"),
			facility: Engine.nodeByUname("group:facility"),
		};

		if (App.feature("pathology")) {
			transitionNodeOpacity(families.pathology, 500, Opacity.Opaque);
			transitionNodeOpacity(this.decorations, 500, Opacity.Opaque);
		} else {
			transitionNodeOpacity(families.pathology, 500, new Opacity(.1));
			transitionNodeOpacity(this.decorations, 500, new Opacity(.1));
		}

		if (App.feature("facility")) {
			transitionNodeOpacity(families.facility, 500, Opacity.Opaque);
		} else {
			transitionNodeOpacity(families.facility, 500, new Opacity(.1));
		}

		if (App.feature("determinant")) {
			transitionNodeOpacity(families.determinant, 500, Opacity.Opaque);
		} else {
			transitionNodeOpacity(families.determinant, 500, Opacity.Opaque);
			this.selectNode(this._selectedNode instanceof Determinant ? this._selectedNode : undefined);
			this.previewNode(this._previewedNode instanceof Determinant ? this._previewedNode : undefined);
		}
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
