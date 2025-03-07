export abstract class SVGShape {
	protected constructor(public layer: number) {
	}

	abstract mount(container: Element): void;

	abstract unmount(): void;
}