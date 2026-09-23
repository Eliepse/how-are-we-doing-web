del /f /q .\bin
deno run build
deno desktop --no-check --allow-read --allow-write ./desktop.ts
xcopy /S /Q .\dist\ .\bin\HowAreWeDoing\dist\
