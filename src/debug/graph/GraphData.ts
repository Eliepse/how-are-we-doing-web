type Draft = { value: number, count: number };

const agv = (draft: Draft) => draft.value / draft.count;
const DEFAULT_DRAFT = { value: 0, count: 0 };

export class GraphData {
	private index: number = 0;
	private draft = { ...DEFAULT_DRAFT };
	private readonly segments: Uint8Array;

	constructor(public readonly size: number) {
		this.segments = new Uint8Array(size);
	}

	getValues() {
		const values = new Uint8Array(this.size);
		values.set(this.segments.subarray(this.index), 0);
		values.set(this.segments.subarray(0, this.index), this.size - this.index);
		return values;
	}

	stage(value: number) {
		this.draft.value += value;
		this.draft.count++;
	}

	/**
	 * Append the current segment to the graph
	 */
	commit() {
		this.segments[this.index] = agv(this.draft);
		this.index = (this.index + 1) % this.size;
		this.draft = { ...DEFAULT_DRAFT };
	}
}