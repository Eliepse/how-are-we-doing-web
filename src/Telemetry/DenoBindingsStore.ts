import type { TelemetryStoreInterface } from "./TelemetryStoreInterface";

export type DenoLogEvent = { type: string; firedAt: number; payload?: object };

type DenoBindings = {
	init: () => Promise<boolean>;
	logEvent: (event: DenoLogEvent) => Promise<void>;
};

/**
 * When the app is bundled in a Deno "Desktop app," sends the telemetry
 * through the "bindings" feature to let Deno stores it in a SQLite database
 * @see https://docs.deno.com/runtime/desktop/
 */
export class DenoBindingsStore implements TelemetryStoreInterface {
	private bindings?: DenoBindings = undefined;

	async open(): Promise<void> {
		if ("bindings" in window && "logEvent" in (window.bindings as DenoBindings)) {
			this.bindings = window.bindings as DenoBindings;
			const success = await this.bindings.init();

			console.log("Deno backend: " + (success ? "ok" : "failed"));
		}
	}

	async store(type: string, firedAt: Date, payload?: object): Promise<void> {
		if (undefined === this.bindings) {
			return;
		}

		await this.bindings.logEvent({ type, firedAt: firedAt.getTime() / 1_000, payload });
	}
}
