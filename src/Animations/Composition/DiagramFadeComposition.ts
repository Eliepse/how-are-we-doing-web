import { type ClipTuple } from "../../Engine2D/Animate/Composition/TickableComposition";
import { FadeNodeClip } from "../../Engine2D/Animate/Predefined/FadeNodeClip";
import { Engine } from "../../Engine2D/Engine";
import { Opacity } from "../../Engine2D/ValueObject/Opacity";

const CONFIG = { min: new Opacity(0.1) };

export function makeDiagramFadeClips(
	direction: "in" | "out",
	duration: number,
	skipOnNoChange = true,
) {
	const pathologies = Engine.nodeByUnameOrThrow("group:pathology");
	const determinants = Engine.nodeByUnameOrThrow("group:determinant");
	const facilities = Engine.nodeByUnameOrThrow("group:facility");
	const decorations = Engine.nodeByUnameOrThrow("decoration:main:background");

	const target = "in" === direction ? Opacity.Opaque : CONFIG.min;

	if (
		skipOnNoChange &&
		pathologies.getOpacity().get().isEqual(target) &&
		determinants.getOpacity().get().isEqual(target) &&
		facilities.getOpacity().get().isEqual(target) &&
		decorations.getOpacity().get().isEqual(target)
	) {
		return [];
	}

	return [
		[0, new FadeNodeClip(pathologies, direction, duration, CONFIG)],
		[0, new FadeNodeClip(determinants, direction, duration, CONFIG)],
		[0, new FadeNodeClip(facilities, direction, duration, CONFIG)],
		[0, new FadeNodeClip(decorations, direction, duration, CONFIG)],
	] satisfies ClipTuple[];
}
