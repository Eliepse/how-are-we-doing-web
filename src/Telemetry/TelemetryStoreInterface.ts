export interface TelemetryStoreInterface {
	open(): Promise<void>;
	store(type: string, firedAt: Date, payload?: object): Promise<void>;
}
