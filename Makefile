desktop-build:
	deno run build
	deno desktop --no-check --allow-read --allow-write ./desktop.ts
	cp -r ./dist ./bin/how-are-we-doing/dist/
