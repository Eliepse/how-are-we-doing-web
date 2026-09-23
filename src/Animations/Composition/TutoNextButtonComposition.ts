import { TickableComposition } from "../../Engine2D/Animate/Composition/TickableComposition";
import { domOrThrow } from "../../helpers";
import type { SceneChild } from "../../Engine2D/Animate/Scene/Scene";
import { FadeDomClip } from "../../Engine2D/Animate/Predefined/FadeDomClip";
import { YieldComposition } from "../../Engine2D/Animate/Composition/YieldComposition";
import { ActionComposition } from "../../Engine2D/Animate/Composition/ActionComposition";

const button = domOrThrow<HTMLButtonElement>("button[data-action='tuto:next-step']");

export function yieldNext() {
	return [
		new ActionComposition(() => (button.style.display = "")),
		new TickableComposition([[0, new FadeDomClip(button, "in", 350)]]),
		new YieldComposition(() => {
			button.disabled = false;
			return new Promise<void>((r) => {
				button.onclick = () => {
					button.disabled = false;
					r();
				};
			});
		}),
		new TickableComposition([[0, new FadeDomClip(button, "out", 350)]]),
		new ActionComposition(() => (button.style.display = "none")),
	] satisfies SceneChild[];
}
