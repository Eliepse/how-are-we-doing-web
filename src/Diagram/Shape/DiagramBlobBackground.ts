// @ts-ignore
import { Noise } from "noisejs";
import { SVGShape } from "../../SVGRenderer/Shape/SVGShape";
import { Vector } from "../../Engine2D/ValueObject/Vector";
import { SVGStyle } from "../../SVGRenderer/ValueObject/SVGStyle";
import { blobPattern } from "./BlobPattern";

const style = new SVGStyle({ fill: blobPattern });

export class DiagramBlobBackground extends SVGShape {
	private readonly dom: SVGPathElement;
	private noise: Noise;

	constructor(
		public radius: number,
		public steps: number = 32,
		public amplitude: number = 80,
		public speed: number = .2,
		public noiseScale: number = 1.25,
	) {
		super(-1);
		this.dom = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.noise = new Noise(Math.random() * 4321);
		this.updateStyle(style);
	}

	updateMesh(center: Vector, time: number): void {
		const step = (Math.PI * 2) / this.steps;
		const points = [];

		for (let i = 0; i < this.steps; i++) {
			const x = Math.cos(i * step);
			const y = Math.sin(i * step);

			const factor = this.noise.simplex3(x * this.noiseScale, y * this.noiseScale, time * this.speed);

			points.push(
				new Vector(x, y)
					.mul(this.radius + (this.amplitude * factor))
					.add(center),
			);
		}

		this.dom.setAttribute("d", `M ${points.join(" L ")} Z`);
	}

	updateStyle(style: SVGStyle): void {
		style.updateElement(this.dom);
	}

	override mount(container: Element): void {
		container.append(this.dom);
	}

	override unmount(): void {
		this.dom.remove();
	}
}