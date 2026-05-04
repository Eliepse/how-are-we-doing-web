// @ts-ignore
import svg from "../../assets/link-arrow.svg?raw";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { SymbolShape } from "../../Engine2D/ValueObject/Symbolic/SymbolShape";

const size = new Vector(14, 14);
const svgDom = document.createElement("div");
svgDom.innerHTML = svg;

export const linkArrow = new SymbolShape(
	"link-arrow",
	Array.from((svgDom.querySelector("svg") as SVGElement).children),
	size,
	size,
	size.div(2),
);