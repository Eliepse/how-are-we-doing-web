export abstract class Shape {
	abstract mount(container: Element): void;

	abstract unmount(): void;
}