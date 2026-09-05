import { contentType } from "jsr:@std/media-types";
import { extname } from "node:path";
import { DatabaseSync } from 'node:sqlite';
import type { DenoLogEvent } from "./src/Telemetry/DenoBindingsStore";

const db = new DatabaseSync("telemtry.db");

const win = new Deno.BrowserWindow({
	title: "How are we doing?",
	width: 960,
	height: 720,
});

win.bind("init", async () => {
	db.exec(
		`CREATE TABLE IF NOT EXISTS events (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  type TEXT,
		  firedAt INTEGER,
		  payload TEXT
		);`,
	);
	return true;
});

win.bind("logEvent", async (event: DenoLogEvent) => {
	db.prepare(`INSERT INTO events (type, firedAt, payload) VALUES (?, ?, ?);`)
		.run(event.type, event.firedAt.toFixed(0), JSON.stringify(event.payload));
});

Deno.serve(async (req) => {
	// sers les fichiers statiques de dist/ (build Vite),
	// avec fallback sur index.html pour le client-side routing
	const url = new URL(req.url);
	let path = `./dist${url.pathname}`;
	const mimetype = contentType(extname(path))?.split(";")[0] ?? "";

	try {
		console.debug(`Serving: ${path} - ` + mimetype);
		const file = await Deno.readFile(path);
		return new Response(file, { headers: { "Content-Type": mimetype } });
	} catch {
		const index = await Deno.readFile("./dist/index.html");
		return new Response(index, { headers: { "content-type": "text/html" } });
	}
});
