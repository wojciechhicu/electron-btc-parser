import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

const createWindow = () => {
	// Create the browser window.
	const mainWindow: BrowserWindow = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
		focusable: false,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js")
		}
	});

	//Menu.setApplicationMenu(null);

	mainWindow.loadFile(path.join(__dirname, "index.html"));

	mainWindow.webContents.openDevTools();
};

app.on("ready", () => {
	// Create the browser window.
	const mainWindow: BrowserWindow = new BrowserWindow({
		width: 640,
		height: 480,
		minWidth: 640,
		minHeight: 480,
		title: 'Bitcoin parser',
		icon: path.join(__dirname, './assets/api_FILL0_wght400_GRAD0_opsz48.png'),
		skipTaskbar: false,
		frame: false,
		focusable: true,
		center: true,
		backgroundMaterial: 'mica',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			preload: path.join(__dirname, "preload.js")
		}
	});

	mainWindow.show();

	//Menu.setApplicationMenu(null);

	mainWindow.loadFile(path.join(__dirname, "index.html"));

	//mainWindow.webContents.openDevTools();

	ipcMain.on("minimize", () => {
		mainWindow.minimize();
	});

	ipcMain.on("maximize", () => {
		mainWindow.setFullScreen(true);
	});

	ipcMain.on("exitMaxWindow", () => {
		mainWindow.setFullScreen(false);
	});

	ipcMain.on("closeWindow", () => {
		app.quit();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
