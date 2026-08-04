import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	root: "src/",
	plugins: [handlebars({ partialDirectory: resolve(__dirname, "src/partials") })],
	build: {
		outDir: "../dist/",
		rollupOptions: {
			input: {
				main: resolve(__dirname, "src/index.html"),
			},
		},
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{ name: "threejs", test: "three", priority: 110 },
						{ name: "vendor", test: "node_modules", priority: 100 },
						{ name: "engine", test: "Engine2D", priority: 50 },
						{ name: "renderer", test: "SVGRenderer", priority: 30 },
					],
				},
			},
		},
		emptyOutDir: true,
	},
});
