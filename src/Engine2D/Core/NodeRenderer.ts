import type { EngineNode } from "./EngineNode";
import type { Renderer } from "./Renderer";

export abstract class NodeRenderer<TRenderer extends Renderer> {
	constructor(protected _renderer: TRenderer) {}

	abstract render(engineNode: EngineNode): void;

	abstract accepts(engineNode: EngineNode): boolean;
}
