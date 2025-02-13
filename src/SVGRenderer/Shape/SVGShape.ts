export abstract class SVGShape {
	abstract mount(container: Element): void;

	abstract unmount(): void;
}