import { Pattern } from "../../SVGRenderer/Shape/Pattern";
import { extractSVGContent } from "../Items/Determinant/shapes";
// @ts-ignore
import blobPatternSVG from "../../assets/pattern.svg?raw";
import { Vector } from "../../Engine2D/ValueObject/Vector";

export const blobPattern = new Pattern(
	"blobPattern",
	new Vector(20, 24).div(2),
	new Vector(20, 24),
	extractSVGContent(blobPatternSVG),
);