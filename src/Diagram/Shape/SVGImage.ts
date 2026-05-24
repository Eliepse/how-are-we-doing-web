import { Vector } from "../../Engine2D/ValueObject/Vector";
import type { SymbolAsset } from "../../Engine2D/ValueObject/Symbolic/SymbolAsset";
import { SVGShape } from "../../SVGRenderer/Shape/SVGShape";
import type { Angle } from "../../Engine2D/ValueObject/Angle";
import { Config } from "../../config";

export class SVGImage extends SVGShape {
	private readonly dom: SVGImageElement;

	constructor(private readonly symbol: SymbolAsset, layer?: number) {
		super(layer ?? 1);

		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "image");
		this.dom.setAttribute("href", symbol.getHref());
	}

	updateMesh(position: Vector, scale: Vector, rotation: Angle): void {
		const domPosition = position.sub(this.symbol.getPivot().mul(scale)).toAttributes();
		const degrees = rotation.add(this.symbol.getAngle()).deg.toFixed(Config.Render.precision);

		const attrSize = this.symbol.getSize().mul(scale).toAttributes();

		this.dom.setAttribute("x", domPosition.x);
		this.dom.setAttribute("y", domPosition.y);
		this.dom.setAttribute("width", attrSize.x);
		this.dom.setAttribute("height", attrSize.y);
		this.dom.setAttribute("transform", `rotate(${degrees}, ${position.toString(true)})`);
	}

	override mount(container: Element) {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}