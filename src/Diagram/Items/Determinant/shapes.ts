import { Angle } from "../../../Engine2D/ValueObject/Angle";
import { SymbolShape } from "../../../Engine2D/ValueObject/Symbolic/SymbolShape";
import { Vector } from "../../../Engine2D/ValueObject/Vector";
// @ts-ignore
import lifestyleSVG from "../../../assets/determinants/lifestyles.svg?raw";
// @ts-ignore
import pollutionSVG from "../../../assets/determinants/pollution-and-nuisances.svg?raw";
// @ts-ignore
import socioEconomySVG from "../../../assets/determinants/socio-economy.svg?raw";
// @ts-ignore
import biodiversitySVG from "../../../assets/determinants/territory-and-biodiversity.svg?raw";
// @ts-ignore
import functionalSVG from "../../../assets/determinants/functional-mixity.svg?raw";
// @ts-ignore
import buildingSVG from "../../../assets/determinants/building-quality.svg?raw";
// @ts-ignore
import landscapeSVG from "../../../assets/determinants/landscape-and-athmosphere.svg?raw";
// @ts-ignore
import outdoorSVG from "../../../assets/determinants/outdoor-usages.svg?raw";
// @ts-ignore
import intermodalitySVG from "../../../assets/determinants/intermodality.svg?raw";

export function extractSVGContent(raw: string): Array<SVGElement> {
	const container = document.createElement("div");
	container.innerHTML = raw;
	return Array.from((container.querySelector("svg") as SVGSVGElement).children) as SVGElement[];
}

const viewBox = new Vector(159, 256);
const detSize = viewBox.div(2);
const detPivot = new Vector(159 / 4, 16);
const angleShift = new Angle(Math.PI / 2);

function makeDeterminantShape(id: string, rawSVG: string): SymbolShape {
	return new SymbolShape(id, extractSVGContent(rawSVG), viewBox, detSize, detPivot, angleShift);
}

export const determinantAssets = {
	"territory and biodiversity": makeDeterminantShape("det-biodiversity", biodiversitySVG),
	"buildings quality": makeDeterminantShape("det-building", buildingSVG),
	"functional mixity": makeDeterminantShape("det-functional", functionalSVG),
	intermodality: makeDeterminantShape("det-intermodality", intermodalitySVG),
	"landscape and athmosphere": makeDeterminantShape("det-landscape", landscapeSVG),
	lifestyles: makeDeterminantShape("det-lifestyle", lifestyleSVG),
	"outdoor usages": makeDeterminantShape("det-outdoor", outdoorSVG),
	"pollution and nuisances": makeDeterminantShape("det-pollution", pollutionSVG),
	"socio-economy": makeDeterminantShape("det-socioEconomy", socioEconomySVG),
} as const;
