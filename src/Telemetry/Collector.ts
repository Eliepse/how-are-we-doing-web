export class Collector {
	private connection?: IDBDatabase;

	async init() {
		this.connection = await this.connect();
	}

	private async connect() {
		const request = indexedDB.open("telemetry", 1);

		return new Promise<IDBDatabase>((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onblocked = () => reject();
			request.onerror = () => reject();
			request.onupgradeneeded = () => {
				this.createDB(request.result)
					.then(() => resolve(request.result))
					.catch(() => {
						throw new Error("upgrade failed");
					});
			};
		});
	}

	private async createDB(db: IDBDatabase) {
		const events = db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
		events.createIndex("id", "id", { unique: true });
		events.createIndex("fired_at", "fired_at");
		events.createIndex("type", "type");

		return new Promise<void>((res) => {
			events.transaction.oncomplete = () => res();
		});
	}

	logEvent(type: string, payload?: object, firedAt: Date = new Date()) {
		if(!this.connection) {
			return;
		}

		const transaction = this.connection.transaction("events", "readwrite");
		transaction.objectStore("events").add({
			type,
			fired_at: firedAt.getTime(),
			payload,
		});
	}
}