import type { Shape } from "../Shape/Shape";

export class ShapeCollection {
	private shapes = new Map<string, Shape>();

	get<TShape extends Shape>(key: string, fallbackMaker: () => TShape): TShape {
		let shape = this.shapes.get(key) as TShape | undefined;

		if (undefined === shape) {
			shape = fallbackMaker();
			this.shapes.set(key, shape);
		}

		return shape;
	}
}