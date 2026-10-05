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
import { LinkManager } from "./Items/Link/LinkManager";
import { AssociationManager } from "./Links/AssociationManager";
import { linkGradient } from "./Shape/LinkGradient";
import { App } from "../App";
import { Animator } from "../Engine2D/Animate/Animator";
import { TickableComposition } from "../Engine2D/Animate/Composition/TickableComposition";
import { FadeNodeClip } from "../Engine2D/Animate/Predefined/FadeNodeClip";
import type { AssociationView } from "./Links/AssociationView";
import type { Source } from "./Links/Source";

export type SelectableNode = Pathology | Determinant | Facility;

export type PathologiesData = (typeof db)["pathologies"];
export type FacilitiesData = (typeof db)["facilities"];
export type DeterminantsData = (typeof db)["determinants"];
export type AssociationsData = (typeof db)["associations"];

type SourceList = Map<number, Array<Source>>;

export class Diagram extends Node2D {
	private _selectedNode: SelectableNode | undefined = undefined;
	private _previewedNode: SelectableNode | undefined = undefined;
	private _selectedView: AssociationView | undefined = undefined;
	private _previewView: AssociationView | undefined = undefined;
	private _pathologies = new Map<number, Pathology>();
	private _determinants = new Map<number, Determinant>();
	private _facilities = new Map<number, Facility>();
	private _linksSources = new Map<Determinant["id"], { pathologies: SourceList; facilities: SourceList }>();
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

			if (target instanceof Determinant && !App.featuresAll("determinant", "select:determinant")) {
				this.selectNode(undefined);
				return;
			} else if (target instanceof Pathology && !App.featuresAll("pathology", "select:pathology")) {
				this.selectNode(undefined);
				return;
			} else if (target instanceof Facility && !App.featuresAll("facility", "select:facility")) {
				this.selectNode(undefined);
				return;
			}

			if (target instanceof Pathology || target instanceof Determinant || target instanceof Facility) {
				this.selectNode(target);
				e.stopPropagation();
				return;
			}

			this.selectNode(undefined);
		});

		this.addListener("mouseenter", (e: NodeEvent) => {
			const target = e.target;

			if (target instanceof Determinant && !App.featuresAll("determinant", "hover:determinant")) {
				return;
			} else if (target instanceof Pathology && !App.featuresAll("pathology", "hover:pathology")) {
				return;
			} else if (target instanceof Facility && !App.featuresAll("facility", "hover:facility")) {
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

		const determinants = new DeterminantsRing(
			this.buildDeterminantFamilies(
				determinantsData,
				associationData.filter((asso) => "determinant" === asso.from.type),
			),
		);
		determinants.setUname("group:determinant");
		determinants.setRotation(Angle.fromDeg(266));
		this.addChildren(determinants);

		const pathologies = new Node2D();
		pathologies.setUname("group:pathology");
		pathologiesData.forEach((familyData, index) => {
			const children = familyData.children.map((child) => {
				const pathology = new Pathology(child.id, child.name, { determinants: [] });
				pathology.setUname(`pathology:${child.id}`);
				this._pathologies.set(pathology.id, pathology);
				return pathology;
			});

			const family = new PathologyFamily(familyData.name, children, 96);
			family.setPosition(Vector.Right.mul(100).rot(-index * Math.PI * (2 / 3) + Math.PI * 0.75));
			pathologies.addChildren(family);
		});
		this.addChildren(pathologies);

		this.decorations = new BgDecorationManager();
		this.decorations.setUname("decoration:main:background");
		this.addChildren(this.decorations);

		const linksManager = new LinkManager(this._pathologies, this._determinants);
		linksManager.setUname("link:manager");
		this.addChildren(linksManager);
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
						const facility = new Facility(child.id, child.name, { determinants: [] }, itemArc);
						facility.setUname(`facility:${child.id}`);
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
			(sum, family) => family.children.reduce((sum, subFamily) => sum + subFamily.children.length, sum),
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
						const determinant = new Determinant(
							child.id,
							child.name as DeterminantKey,
							child.name,
							asset,
							{ arc: itemArc },
							{
								facilities: [],
								pathologies: [],
								determinants: associations
									.filter((asso) => child.id === asso.from.id && "determinant" === asso.to.type)
									.map((asso) => asso.to.id),
							},
						);
						determinant.setUname(`determinant:${child.id}`);
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

	get selectedView() {
		return this._selectedView;
	}

	get previewView() {
		return this._previewView;
	}

	selectNode(node: SelectableNode | undefined): void {
		if (this._selectedNode === node) {
			return;
		}

		if (undefined === node) {
			this._selectedNode = undefined;
			this._selectedView = undefined;
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
		this._selectedView = AssociationManager.filterByNode(node);
		this.updateNodesHighlight();
		this.dispatchEvent(new NodeEvent("nodeSelected", this._selectedNode));
	}

	previewNode(node: SelectableNode | undefined): void {
		if (this._previewedNode === node) {
			return;
		}

		this._previewedNode = node;

		if (node && this._previewedNode instanceof Determinant && this._previewedNode !== this._selectedNode) {
			this._previewView = AssociationManager.filterByNode(this._previewedNode);
		} else {
			this._previewView = undefined;
		}

		this.updateNodesHighlight();
		this.dispatchEvent(new NodeEvent("nodePreviewed", this._previewedNode));
	}

	public updateNodesHighlight() {
		const linkManager = Engine.nodeByUname<LinkManager>("link:manager");
		const determinants = Engine.nodesByTag<Determinant>("determinant");
		const facilities = Engine.nodesByTag<Facility>("facility");
		const pathologies = Engine.nodesByTag<Pathology>("pathology");
		const hasActiveNode = undefined !== (this._previewedNode || this._selectedNode);
		const determinantViewSelected = this?._selectedView?.filterByOnlyDeterminants();
		const determinantViewPreview = this?._selectedView?.filterByOnlyDeterminants();

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

			if (this._selectedView?.has(determinant) && !(this._selectedNode instanceof Determinant)) {
				determinant.setStatus("selected");
				continue;
			} else if (withDetailedAssocs && this._selectedView?.has(determinant, 1)) {
				// Check position "1" to get only associations where the determinant is the target
				determinant.setStatus("n+1");
				continue;
			}

			if (this._previewedNode === determinant) {
				determinant.setStatus("preview");
				continue;
			}

			// Check position "1" to get only associations where the determinant is the target
			if (withDetailedAssocs && this._previewView?.has(determinant, 1)) {
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
				if (this._selectedView?.has(facility)) {
					facility.setStatus("selected");
					continue;
				} else if (this._previewView?.has(facility)) {
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

			if (this._selectedNode === pathology || this._selectedView?.has(pathology)) {
				pathology.setStatus("selected");
				continue;
			} else if (this._previewedNode === pathology) {
				pathology.setStatus(isPreviewSecondary ? "n+1" : "preview");
				continue;
			} else if (withPathologyAssocs) {
				if (this._selectedView?.has(pathology)) {
					pathology.setStatus("selected");
					continue;
				} else if (this._previewView?.has(pathology) && isPreviewSecondary) {
					pathology.setStatus("n+1");
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
		if (App.feature("focus-determinant") && linkManager) {
			if (this._previewedNode && this._previewView) {
				linkManager.showViewInterDeterminantsLinks(
					// Check position "0" to get only associations where the determinant is the source
					this._previewView.filterByNode(this._previewedNode, 0),
					true,
				);
			}

			if (this._selectedNode && this._selectedView) {
				linkManager.showViewInterDeterminantsLinks(
					// Check position "0" to get only associations where the determinant is the source
					this._selectedView.filterByNode(this._selectedNode, 0),
					false,
				);
			}

			return;
		}

		if (App.feature("det-links:pathology") && linkManager) {
			const noSelection = !this._selectedNode;

			// Only display links for hovered node for secondary nodes, or if there's no selection
			if (this._previewedNode && this._previewView && (noSelection || isPreviewSecondary)) {
				linkManager.showViewLinks(this._previewView, this._previewedNode.status.get(), true);
			}

			if (this._selectedNode && this._selectedView) {
				linkManager.showViewLinks(this._selectedView, this._selectedNode.status.get(), false);
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
		const view = this._selectedView;

		if (undefined === view) {
			return { pathologies: [], determinants: [], facilities: [] };
		}

		return {
			pathologies: Array.from(view.pathologies)
				.map((id) => this._pathologies.get(id))
				.filter((v) => undefined !== v),
			determinants: Array.from(view.determinants)
				.map((id) => this._determinants.get(id))
				.filter((v) => undefined !== v),
			facilities: Array.from(view.facilities)
				.map((id) => this._facilities.get(id))
				.filter((v) => undefined !== v),
		};
	}

	getActiveLinksSources(): { pathologies: Source[]; facilities: Source[] } {
		const view = this._selectedView;
		const sources = { pathologies: [] as Source[], facilities: [] as Source[] };

		if (undefined === view) {
			return sources;
		}

		for (const association of view.associations) {
			if (association.hasTypeAll(["pathology", "determinant"])) {
				sources.pathologies.push(...association.sources);
			}

			if (association.hasTypeAll(["determinant", "facility"])) {
				sources.facilities.push(...association.sources);
			}
		}

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

	async updateRingsOpacity() {
		const conf = { min: new Opacity(0.1) };
		const families = {
			pathology: Engine.nodeByUnameOrThrow("group:pathology"),
			determinant: Engine.nodeByUnameOrThrow("group:determinant"),
			facility: Engine.nodeByUnameOrThrow("group:facility"),
		};

		return new Promise<void>((resolve) => {
			if (!App.feature("determinant")) {
				this.selectNode(this._selectedNode instanceof Determinant ? this._selectedNode : undefined);
				this.previewNode(this._previewedNode instanceof Determinant ? this._previewedNode : undefined);
			}

			Animator.play(
				new TickableComposition([
					[0, new FadeNodeClip(families.pathology, App.feature("pathology") ? "in" : "out", 500, conf)],
					[0, new FadeNodeClip(families.facility, App.feature("facility") ? "in" : "out", 500, conf)],
					[0, new FadeNodeClip(families.determinant, App.feature("determinant") ? "in" : "out", 500, conf)],
					[0, new FadeNodeClip(this.decorations, App.feature("pathology") ? "in" : "out", 500, conf)],
				]),
				resolve,
			);
		});
	}

	override onRendered(_deltaTime: number) {
		super.onRendered(_deltaTime);
		this.backgroundBlobClock.commit();
	}

	override shouldRerender(): boolean {
		return super.shouldRerender() || this.backgroundBlobClock.hasChanged();
	}
}
