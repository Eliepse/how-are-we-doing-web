import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import { Color } from "../../Engine2D/ValueObject/Color";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { SVGSymbol } from "../../SVGRenderer/Shape/SVGSymbol";
import { Facility } from "../Items/Facility/Facility";
import { SVGNodeRenderer } from "../../SVGRenderer/NodeRenderer/SVGNodeRenderer";
import type { ActiveStatus } from "../types";

export class FacilityRenderer extends SVGNodeRenderer {
	override render(vnode: VirtualNode<Facility>): void {
		const node = vnode.node;
		const shapes = this.getShapes(vnode);
		const position = node.getGlobalPosition();
		const rotation = node.getGlobalRotation();
		const opacity = node.getGlobalOpacity();
		const status = node.status;

		const element = shapes.get("sprite", () => new SVGSymbol(node.getShape()));

		if (position.hasChanged() || rotation.hasChanged()) {
			element.updateMesh(position.get(), rotation.get());
		}

		if (status.hasChanged() || opacity.hasChanged()) {
			element.updateStyle(new SVGStyle({ fill: this.getStatusColor(status.get()), opacity: opacity.get() }));
		}

	}

	private getStatusColor(status: ActiveStatus | false): Color {
		if ("selected" === status) {
			return Color.Red;
		}

		if ("dimmed" === status) {
			return new Color(158, 185, 200);
		}

		return Color.White;
	}

	override accepts(vnode: VirtualNode): boolean {
		return vnode.node instanceof Facility;
	}
}
