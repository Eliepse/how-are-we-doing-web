type Checker<TValue> = (previous: TValue, current: TValue) => boolean;

/**
 * Store a value and keep track if a change occured.
 * Really useful for rendering to prevent useless render
 */
export class Attribute<TValue> {
	private previous: TValue;
	private current: TValue;
	private readonly checker: Checker<TValue> = (a, b) => a !== b;

	/**
	 * @param value The initial value
	 * @param check Custom function to check inequality (returns true if changed)
	 */
	constructor(value: TValue, check: Checker<TValue> | undefined = undefined) {
		this.previous = this.current = value;
		this.checker = check ? check : this.checker;
	}

	/**
	 * Change the current value
	 */
	set(value: TValue) {
		this.current = value;
		return this;
	}

	/**
	 * Get the current value
	 */
	get(): TValue {
		return this.current;
	}

	/**
	 * Check if a changed occured since the last 'commit'
	 */
	hasChanged(): boolean {
		return this.checker(this.previous, this.current);
	}

	/**
	 * Commit the new value and don't consider as changed anymore.
	 * Returns the current value
	 */
	commit(): TValue {
		this.previous = this.current;
		return this.current;
	}

	/**
	 * Restore the previous value and don't consider as changed anymore.
	 * Returns the previous value
	 */
	revert(): TValue {
		this.current = this.previous;
		return this.current;
	}
}