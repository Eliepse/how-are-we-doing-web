import type { Composition } from "../Composition/Composition";
import type { TickableComposition } from "../Composition/TickableComposition";
import type { YieldComposition } from "../Composition/YieldComposition";

type AnyComposition = Composition & (TickableComposition | YieldComposition);

export class Scene {
	constructor(
		private readonly compositions: AnyComposition[] = [],
	) {
	}

	add(composition: AnyComposition) {
		this.compositions.push(composition);
	}

	get(index: number): AnyComposition|undefined {
		return this.compositions[index];
	}
}