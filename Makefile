desktop-build:
	deno run build
	deno desktop --no-check --allow-read --allow-write ./desktop.ts