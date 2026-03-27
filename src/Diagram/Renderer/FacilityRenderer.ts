import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { SVGSymbol } from "../../SVGRenderer/Shape/SVGSymbol";
import type { SVGRenderer } from "../../SVGRenderer/SVGRenderer";
import { colors } from "../colors";
import { Facility } from "../Items/Facility/Facility";
import type { Engine } from "../../Engine2D/Engine";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import type { App } from "../../App";

const shapeStyle = {
	default: new SVGStyle({ fill: Color.White }),
	selected: new SVGStyle({ fill: Color.Red }),
	dimmed: new SVGStyle({ fill: colors.dimmedWhite }),
	secondary: new SVGStyle({ fill: colors.secondary }),
} as const;

export class FacilityRenderer extends SVGNodeRenderer {
	constructor(renderer: SVGRenderer, engine: Engine, private app: App) {
		super(renderer, engine);
	}

	override render(vnode: VirtualNode<Facility>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();

		const element = shapes.get("sprite", () => new SVGSymbol(node.getShape()));

		if(position.hasChanged() || rotation.hasChanged()) {
			element.updateMesh(position.get(), rotation.get());
		}

		if ("selected" === node.active) {
			element.updateStyle(shapeStyle.selected);
		} else if ("preview" === node.active) {
			element.updateStyle(shapeStyle.secondary);
		} else if ("dimmed" === node.active) {
			element.updateStyle(shapeStyle.dimmed);
		} else {
			element.updateStyle(shapeStyle.default);
		}
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Facility;
	}
}
