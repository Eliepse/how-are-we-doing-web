import { app, BrowserWindow, Display, ipcMain, screen } from "electron";
import path from "node:path";

// const baseUrl = "https://how-are-we-doing-git-picture-wall-eliepses-projects.vercel.app";
const baseUrl = "http://localhost:5173";

const createWindow = (url: string, screen?: Display): BrowserWindow => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		x: (screen?.bounds?.x ?? 0) + 64,
		y: 64,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js"),
		},
		fullscreenable: true,
	});

	mainWindow.loadURL(url);

	mainWindow.on("ready-to-show", () => {
		mainWindow.setKiosk(true);
	})

	ipcMain.on("kiosk", () => {
		mainWindow.setKiosk(true);
	});

	return mainWindow;
};

function openWindows() {
	const screens = screen.getAllDisplays()

	if(1 < screens.length) {
		createWindow(baseUrl, screens[0]);
		createWindow(`${baseUrl}/wall/`, screens[1]);
	} else {
		createWindow(baseUrl, screens[0]);
	}
}

app.on("ready", () => {
	openWindows();
});

app.on("window-all-closed", () => {
	app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		openWindows();
	}
});

