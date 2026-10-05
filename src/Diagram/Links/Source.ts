export class Source {
	public readonly reference: string | undefined;

	constructor(
		public readonly author: string,
		reference: string | null | undefined = undefined,
	) {
		this.reference = reference?.trim() ? reference.trim() : undefined;
	}
}
