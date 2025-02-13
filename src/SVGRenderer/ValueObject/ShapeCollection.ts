import type { SVGShape } from "../Shape/SVGShape";

export class ShapeCollection {
	private shapes = new Map<string, SVGShape>();

	get<TShape extends SVGShape>(key: string, fallbackMaker: () => TShape): TShape {
		let shape = this.shapes.get(key) as TShape | undefined;

		if (undefined === shape) {
			shape = fallbackMaker();
			this.shapes.set(key, shape);
		}

		return shape;
	}
}