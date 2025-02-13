import type { VirtualNode } from "../../Engine2D/Core/VirtualNode";
import type { Renderer } from "../../Engine2D/Renderer/Renderer";
import type { Engine } from "../../Engine2D/Engine";

export abstract class NodeRenderer<TRenderer extends Renderer> {
	constructor(protected _renderer: TRenderer, protected engine: Engine) {
	}

	abstract render(engineNode: VirtualNode): void;

	abstract accepts(engineNode: VirtualNode): boolean;
}
