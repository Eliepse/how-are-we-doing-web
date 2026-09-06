import type { TelemetryStoreInterface } from "./TelemetryStoreInterface";

class Collector {
	private stores = new Set<TelemetryStoreInterface>();

	register(stores: TelemetryStoreInterface[]) {
		stores.forEach((store) => this.stores.add(store));
	}

	async init() {
		await Promise.all(Array.from(this.stores).map((store) => store.open()));
	}

	logEvent(type: string, payload?: object, firedAt: Date = new Date()) {
		this.stores.forEach((store) => store.store(type, firedAt, payload));
	}
}

export default new Collector();
