export abstract class SVGShape {
	protected constructor(public readonly layer: number) {
	}

	abstract mount(container: Element): void;

	abstract unmount(): void;
}