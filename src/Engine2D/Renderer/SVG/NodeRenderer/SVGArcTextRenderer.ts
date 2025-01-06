import { Config } from "../../../../config";
import { ArcGroup } from "../../../../Diagram/ArcGroup";
import { DeterminantSubFamily } from "../../../../Diagram/Items/Determinant/DeterminantSubFamily";
import { Vector } from "../../../Vector";
import { TreeNode } from "../TreeNode";
import { SVGNodeRenderer } from "./SVGNodeRenderer";

const arcIndexGenerator = (function* () {
	let i = 0;
	while (true) {
		yield `internal:arc-${i}`;
		i++;
	}
})();

export class SVGArcTextRenderer extends SVGNodeRenderer<ArcGroup> {
	private margin = 32;

	private describeArc(
		center: Vector,
		radius: number,
		angle: number,
		angleOffset: number = 0
	): string {
		const start = new Vector(Math.cos(angleOffset) * radius, Math.sin(angleOffset) * radius);
		const end = new Vector(
			Math.cos(angle + angleOffset) * radius,
			Math.sin(angle + angleOffset) * radius
		);
		const sa = center.add(start).toAttributes();
		const se = center.add(end).toAttributes();
		const largeArc = angle <= Math.PI ? "0" : "1";

		return ["M", sa.x, sa.y, "A", radius, radius, 0, largeArc, 1, se.x, se.y].join(" ");
	}

	override create(): void {
		const id = arcIndexGenerator.next().value;
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.id = id;
		path.setAttribute("stroke", "none");
		path.setAttribute("fill", "none");

		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
		textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
		textPath.setAttribute("text-anchor", "middle");
		textPath.setAttribute("startOffset", "50%");
		text.append(textPath);

		if (Config.Render.debug) {
			path.setAttribute("stroke", "#ff0000");
		}

		const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.setAttribute("stroke", "#fff");
		line.setAttribute("stroke-width", "1");

		this.elements.set("text:path", path);
		this.elements.set("text:text", text);
		this.elements.set("text:textPath", textPath);
		this.elements.set("separator", line);

		this.getContainer()?.append(path);
		this.getContainer()?.append(text);
		this.getContainer()?.append(line);

		super.create();
	}

	override update(): void {
		super.update();

		const element = this.node.element;
		const position = element.getGlobalPosition();
		const rotation = element.getGlobalRotation();
		const angleShift = element.getItemArc().div(2);

		// Draw text

		const path = this.elements.get("text:path") as SVGTextPathElement;
		path.setAttribute(
			"d",
			this.describeArc(
				position,
				element.getRadius() + this.margin,
				element.getArc().rad,
				rotation.sub(angleShift).rad
			)
		);

		const textPath = this.elements.get("text:textPath") as SVGTextElement;
		textPath.textContent = element.getName();

		// Draw separator

		let torusWidth = 12;

		if (element instanceof DeterminantSubFamily) {
			torusWidth = element.getTorusWidth();
		}

		const endAngle = rotation.add(element.getArc()).sub(angleShift);
		const separator = this.elements.get("separator") as SVGLineElement;
		const lineCos = Math.cos(endAngle.rad);
		const lineSin = Math.sin(endAngle.rad);
		const lineA = position
			.add(
				new Vector(
					lineCos * (element.getRadius() - torusWidth),
					lineSin * (element.getRadius() - torusWidth)
				)
			)
			.toAttributes();
		const lineB = position
			.add(
				new Vector(lineCos * (element.getRadius() + 48), lineSin * (element.getRadius() + 48))
			)
			.toAttributes();

		separator.setAttribute("x1", lineA.x);
		separator.setAttribute("y1", lineA.y);
		separator.setAttribute("x2", lineB.x);
		separator.setAttribute("y2", lineB.y);
	}

	static override accepts(node: TreeNode): boolean {
		return node.element instanceof ArcGroup && node.element.visible();
	}
}
