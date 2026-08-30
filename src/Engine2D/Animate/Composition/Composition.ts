export interface Composition {
	/**
	 * @internal
	 */
	onstarted: (() => void);

	/**
	 * @internal
	 */
	onended: (() => void);
}