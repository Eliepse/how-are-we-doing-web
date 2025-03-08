import { Node2D } from "../../Engine2D/Node/Node2D";
import { SymbolAsset } from "../../Engine2D/ValueObject/Symbolic/SymbolAsset";
import { Vector } from "../../Engine2D/ValueObject/Vector";

export const genericAssets = [
	new SymbolAsset("/image/decorations/generic-1.png", new Vector(180)),
	new SymbolAsset("/image/decorations/generic-2.png", new Vector(180)),
] as const;

export const mentalAssets = [
	new SymbolAsset("/image/decorations/mental-1.png", new Vector(160)),
	new SymbolAsset("/image/decorations/mental-2.png", new Vector(160)),
	new SymbolAsset("/image/decorations/mental-3.png", new Vector(160)),
	new SymbolAsset("/image/decorations/mental-4.png", new Vector(160)),
	new SymbolAsset("/image/decorations/mental-5.png", new Vector(160)),
] as const;

export const physiqueAssets = [
	new SymbolAsset("/image/decorations/physique-1.png", new Vector(90)),
	new SymbolAsset("/image/decorations/physique-2.png", new Vector(90)),
	new SymbolAsset("/image/decorations/physique-3.png", new Vector(90)),
	new SymbolAsset("/image/decorations/physique-4.png", new Vector(90)),
	new SymbolAsset("/image/decorations/physique-5.png", new Vector(90)),
	new SymbolAsset("/image/decorations/physique-6.png", new Vector(90)),
] as const;

export const socialAssets = [
	new SymbolAsset("/image/decorations/social-1.png", new Vector(120)),
	new SymbolAsset("/image/decorations/social-2.png", new Vector(120)),
	new SymbolAsset("/image/decorations/social-3.png", new Vector(120)),
	new SymbolAsset("/image/decorations/social-4.png", new Vector(120)),
	new SymbolAsset("/image/decorations/social-5.png", new Vector(120)),
] as const;

export class BgDecoration extends Node2D {
	constructor(public readonly symbol: SymbolAsset, public readonly size: Vector, public scale: Vector = Vector.One) {
		super();
	}
}