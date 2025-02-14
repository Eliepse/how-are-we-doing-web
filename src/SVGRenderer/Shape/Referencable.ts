export interface Referencable {
	getRefID(): string;

	getRefDOM(): SVGElement;
}