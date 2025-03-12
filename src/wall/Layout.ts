import type { Cells } from "./Cell";

export class Layout {
	constructor(
		public readonly maxFill: number,
		public readonly cells: Cells[],
	) {
	}
}