/**
 * Object can be 'ticked' by a clock, veryuseful for synchronized object such as animation,
 * physics, etc. that has to trigger with a fixed time value. Otherwise, a time-shift can
 * appear if a element takes longer to render in the queue
 */
export interface Tickable {
	/**
	 *
	 * @param deltaTime The time since the last tick (seconds)
	 * @param time The time since the first tick (milliseconds)
	 * @param timeUTC The UTC timestamp (milliseconds)
	 * @param deltaTimeMs The time since the last tick (milliseconds)
	 * @param ticks Ticks count that has been triggered
	 */
	tick(deltaTime: number, time: number, timeUTC: number, deltaTimeMs: number, ticks: number): void;
}