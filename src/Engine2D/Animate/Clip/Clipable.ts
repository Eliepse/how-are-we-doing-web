export interface Clipable {
	/**
	 * Return the total duration of the clip
	 */
	getDuration(): number;

	/**
	 * Force the clip to be process as if it was the very first frame
	 */
	applyStart(): void;

	/**
	 * Force the clip to be process as if it was the very last frame
	 */
	applyEnd(): void;
}