import { App } from "./App";

const appDom = document.querySelector("#app");

if (null === appDom) {
	throw new Error("App DOM missing");
}

const app = new App(appDom);

await app.load(console.debug);

void app.launch();

