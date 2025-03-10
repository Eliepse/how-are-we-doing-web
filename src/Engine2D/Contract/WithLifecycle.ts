import type { Engine } from "../Engine";

export interface WithLifecycle {
	/**
	 * Called when the node is mounted in the tree,
	 * but before any rendering.
	 * Returned function is executed when unmounted.
	 */
	onMount(engine: Engine): void | (() => void);

	onUnmount(engine: Engine): void;
}