import type { Cell } from "./Cell";

export class Layout {
	constructor(
		public readonly maxFill: number,
		public readonly cells: Cell[],
	) {
	}

	withPriority(min = 0): Cell[] {
		return this.cells.filter((cell) => cell.priority >= min);
	}
}