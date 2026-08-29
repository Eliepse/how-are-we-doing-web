import { type ClipTuple } from "../../Engine2D/Animate/Composition/TickableComposition";
import { FadeNodeClip } from "../../Engine2D/Animate/Predefined/FadeNodeClip";
import { Engine } from "../../Engine2D/Engine";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";

const CONFIG = { min: new Opacity(0.1), max: Opacity.Opaque };

export function makeDiagramFadeClips(
	direction: "in" | "out",
	duration: number,
) {
	const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
	const determinants = Engine.nodeByUnameOrThrow("group:determinant");
	const facilities = Engine.nodeByUnameOrThrow("group:facility");
	const decorations = Engine.nodeByUnameOrThrow("decoration:main:background");

	return [
		[0, new FadeNodeClip(pathologies, direction, duration, CONFIG)],
		[0, new FadeNodeClip(determinants, direction, duration, CONFIG)],
		[0, new FadeNodeClip(facilities, direction, duration, CONFIG)],
		[0, new FadeNodeClip(decorations, direction, duration, CONFIG)],
	] satisfies ClipTuple[];
}
