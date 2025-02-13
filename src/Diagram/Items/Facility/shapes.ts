// @ts-ignore
import svg from "../../../assets/facility.svg?raw";
import { SymbolShape } from "../../../Engine2D/ValueObject/Symbolic/SymbolShape";
import { Vector } from "../../../Engine2D/ValueObject/Vector";

const size = new Vector(24, 25);
const svgDom = document.createElement("div");
svgDom.innerHTML = svg;

export const facilityShape = new SymbolShape(
  "facilityShape",
  Array.from((svgDom.querySelector("svg") as SVGElement).children),
  size,
  size,
  size.div(2)
);
