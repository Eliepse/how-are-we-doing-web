import { Layout } from "./Layout";
import { Cell } from "./Cell";
import { Vector } from "../Engine2D/ValueObject/Vector";

export const layouts = [
	// 8_cells_3
	new Layout(
		6,
		[
			new Cell(new Vector(0, 0), new Vector(4, 3)),
			new Cell(new Vector(4, 1), new Vector(2, 2)),
			new Cell(new Vector(6, 0), new Vector(4, 3)),
			new Cell(new Vector(0, 5), new Vector(2, 2)),
			new Cell(new Vector(2, 3), new Vector(2, 3)),
			new Cell(new Vector(4, 3), new Vector(3, 4)),
			new Cell(new Vector(8, 3), new Vector(3, 2)),
			new Cell(new Vector(7, 5), new Vector(3, 2)),
		],
	),

	// 8_cells_2
	new Layout(
		6,
		[
			new Cell(new Vector(0, 0), new Vector(2, 2)),
			new Cell(new Vector(2, 0), new Vector(3, 2)),
			new Cell(new Vector(5, 0), new Vector(2, 3)),
			new Cell(new Vector(7, 0), new Vector(4, 4)),
			new Cell(new Vector(0, 2), new Vector(5, 5)),
			new Cell(new Vector(5, 3), new Vector(2, 4)),
			new Cell(new Vector(7, 4), new Vector(2, 3)),
			new Cell(new Vector(9, 4), new Vector(2, 3)),
		],
	),

	// 8_cells_1
	new Layout(
		6,
		[
			new Cell(new Vector(0, 0), new Vector(3, 5)),
			new Cell(new Vector(0, 5), new Vector(3, 2)),
			new Cell(new Vector(3, 0), new Vector(2, 2)),
			new Cell(new Vector(5, 0), new Vector(3, 2)),
			new Cell(new Vector(8, 0), new Vector(3, 3)),
			new Cell(new Vector(3, 2), new Vector(5, 5), 1),
			new Cell(new Vector(9, 3), new Vector(2, 2)),
			new Cell(new Vector(8, 5), new Vector(2, 2)),
		],
	),

	// 7_cells_1
	new Layout(
		5,
		[
			new Cell(new Vector(0, 0), new Vector(3, 3)),
			new Cell(new Vector(3, 0), new Vector(2, 2)),
			new Cell(new Vector(5, 0), new Vector(2, 2)),
			new Cell(new Vector(7, 0), new Vector(3, 2)),
			new Cell(new Vector(0, 3), new Vector(3, 3)),
			new Cell(new Vector(3, 2), new Vector(5, 5), 1),
			new Cell(new Vector(8, 3), new Vector(3, 4)),
		],
	),

	// 5_cells_1
	new Layout(
		4,
		[
			new Cell(new Vector(3, 0), new Vector(4, 2)),
			new Cell(new Vector(7, 0), new Vector(4, 4)),
			new Cell(new Vector(0, 2), new Vector(5, 5), 1),
			new Cell(new Vector(5, 2), new Vector(2, 2)),
			new Cell(new Vector(5, 4), new Vector(5, 3)),
		],
	),

	// 14_cells_1
	new Layout(
		10,
		[
			new Cell(new Vector(0, 0), new Vector(3, 2)),
			new Cell(new Vector(3, 0), new Vector(2, 2)),
			new Cell(new Vector(5, 0), new Vector(3, 2)),
			new Cell(new Vector(8, 0), new Vector(2, 2)),
			new Cell(new Vector(1, 2), new Vector(2, 2)),
			new Cell(new Vector(3, 2), new Vector(2, 3)),
			new Cell(new Vector(5, 3), new Vector(2, 2)),
			new Cell(new Vector(7, 2), new Vector(2, 3)),
			new Cell(new Vector(9, 2), new Vector(2, 2)),
			new Cell(new Vector(0, 4), new Vector(2, 3)),
		],
	),
];