import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { readFileSync, writeFileSync, watch} from "fs";
import { appConfig } from "./data/config.interface";
import { cpus } from "os";
import { exec } from "child_process";
import { checkSystemInfoStats, createDirectory, createLastBlockFile } from "./utils/index.ipcMain";
import { quote } from "shell-quote";
import { logs } from "./data/logs.interface";

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

// Execute the callback function when the Electron app is ready.
app.on("ready", () => {
	// Create the browser window.
	const mainWindow: BrowserWindow = new BrowserWindow({
		width: 1110,
		height: 650,
		minWidth: 1110,
		minHeight: 650,
		title: "Bitcoin parser",
		icon: path.join(__dirname, "./assets/api_FILL0_wght400_GRAD0_opsz48.png"),
		skipTaskbar: false,
		frame: false,
		focusable: true,
		center: true,
		backgroundMaterial: "mica",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			preload: path.join(__dirname, "preload.js")
		}
	});

	// Load an HTML file into the main window.
	// @param {string} filePath - The path to the HTML file.
	mainWindow.loadFile(path.join(__dirname, "index.html"));

	// Listen for the "numThreads" event from the renderer process.
	// Sends the number of available CPU threads back to the renderer process.
	// @param {Electron.IpcMainEvent} event - The event object.
	// @param {any} arg - The argument passed from the renderer process (if any).
	const CPUS = cpus().length;
	ipcMain.on("numThreads", (event, arg) => {
		event.sender.send("numThreadsRes", CPUS);
	});

	// Open devtools. Just for testing function.
	mainWindow.webContents.openDevTools();

	// Listen for the "minimize" event from the renderer process.
	// Minimizes the main window.
	ipcMain.on("minimize", () => {
		mainWindow.minimize();
	});

	// Listen for the "maximize" event from the renderer process.
	// Maximizes the main window.
	ipcMain.on("maximize", () => {
		mainWindow.setFullScreen(true);
	});

	// Listen for the "checkConfig" event from the renderer process.
	// Reads the configuration file and sends it back to the renderer process.
	// @param {Electron.IpcMainEvent} event - The event object.
	// @param {any} arg - The argument passed from the renderer process (if any).
	ipcMain.on("checkConfig", (event, arg) => {
		const configFile = readFileSync(path.join(__dirname, "./data/config.json"), "utf8");
		const parsedConfig: appConfig = JSON.parse(configFile);
		event.sender.send("checkConfigResponse", parsedConfig);
	});

	// Listen for the "exitMaxWindow" event from the renderer process.
	// Disables full screen mode for the main window.
	ipcMain.on("exitMaxWindow", () => {
		mainWindow.setFullScreen(false);
	});

	// Listen for the "closeWindow" event from the renderer process.
	// Closes the application window.
	ipcMain.on("closeWindow", () => {
		app.quit();
	});

	// Listen for the "restart" event from the renderer process.
	// Reloads the main window.
	ipcMain.on("restart", () => {
		mainWindow.reload();
	});

	// Listen for the "choose-directory-blk" event from the renderer process.
	// Opens a dialog for selecting a directory and saves the chosen directory path in the configuration file.
	// @param {Electron.IpcMainEvent} event - The event object.
	ipcMain.on("choose-directory-blk", (event) => {
		// Open a dialog for selecting a directory.
		dialog.showOpenDialog({
			properties: ["openDirectory"]
		})
			.then((result) => {
				// Check if the dialog was not canceled and a directory path was selected.
				if (!result.canceled && result.filePaths.length > 0) {
					const folderPath = result.filePaths[0];

					// Read the configuration file.
					const configFile = readFileSync(path.join(__dirname, "./data/config.json"), "utf8");
					const parsedConfig: appConfig = JSON.parse(configFile);

					// Update the blocks directory path in the configuration.
					parsedConfig.blocksDirPath = folderPath.replace(/\\/g, "/");
					// Convert the updated configuration object to a string.
					const stringConfig = JSON.stringify(parsedConfig, null, 2);

					// Write the updated configuration to the configuration file.
					writeFileSync(path.join(__dirname, "./data/config.json"), stringConfig, "utf8");

					// Show a success message box.
					dialog.showMessageBox(mainWindow, {
						type: "info",
						title: "Success",
						message: "Blocks dir saved",
						buttons: ["OK"]
					}).then((v) => {
						// Send the updated blocks directory path back to the renderer process.
						event.sender.send("pickedBlkDirectory", parsedConfig.blocksDirPath);
					});
				}
			})
			.catch((err: any) => {
				// Show an error message box.
				dialog.showMessageBox({
					type: "error",
					title: "Error",
					message: String(err),
					buttons: ["OK"]
				});
			});
	});

	ipcMain.on("systemInfo", (event, arg) => {
		const scriptPath = path.resolve(__dirname, "scripts", "cpu_usage.py");
		const quotedScriptPath = quote([scriptPath]);
		exec(`python ${quotedScriptPath}`, async (err, stdout, stderr) => {
			if (err) {
				dialog.showMessageBox({
					type: "error",
					title: "Error",
					message: String(err),
					buttons: ["OK"]
				});
				return;
			} else if (stderr) {
				dialog.showMessageBox({
					type: "error",
					title: "Error",
					message: String(stderr),
					buttons: ["OK"]
				});
			} else {
				let stats = await checkSystemInfoStats();
				stats.cpu.usage = Number(stdout) * 10;
				event.sender.send("systemInfoResponse", stats);
			}
		});
	});

	// Listen for the "choose-directory-parsed-blk" event from the renderer process.
	// Opens a dialog for selecting a directory and saves the chosen directory path in the configuration file for parsed blocks.
	// @param {Electron.IpcMainEvent} event - The event object.
	ipcMain.on("choose-directory-parsed-blk", (event) => {
		// Open a dialog for selecting a directory.
		dialog.showOpenDialog({
			properties: ["openDirectory"]
		})
			.then((result) => {
				// Check if the dialog was not canceled and a directory path was selected.
				if (!result.canceled && result.filePaths.length > 0) {
					const folderPath = result.filePaths[0];

					// Read the configuration file.
					const configFile = readFileSync(path.join(__dirname, "./data/config.json"), "utf8");
					const parsedConfig: appConfig = JSON.parse(configFile);
					const directory = folderPath.replace(/\\/g, "/");

					// Update the directory paths in the configuration for parsed blocks.
					parsedConfig.parsedBlocksDirPath = directory + '/blocks';
					createDirectory(directory + '/blocks');
					parsedConfig.orphanBlocksPath = directory + '/orphans';
					createDirectory(directory + '/orphans');
					parsedConfig.lastBlockFilePath = directory;
					parsedConfig.transactionsRevsPath = directory + '/revs';
					createDirectory(directory + '/revs');
					createLastBlockFile(directory);

					// Convert the updated configuration object to a string.
					const stringConfig = JSON.stringify(parsedConfig, null, 2);

					// Write the updated configuration to the configuration file.
					writeFileSync(path.join(__dirname, "./data/config.json"), stringConfig, "utf8");

					// Show a success message box.
					dialog.showMessageBox(mainWindow, {
						type: "info",
						title: "Success",
						message: "Parsed blocks dir saved",
						buttons: ["OK"]
					}).then((v) => {
						// Send the updated parsed blocks directory path back to the renderer process.
						event.sender.send("pickedParsedBlkDirectory", parsedConfig.parsedBlocksDirPath);
					});
				}
			})
			.catch((err: any) => {
				// Show an error message box.
				dialog.showMessageBox({
					type: "error",
					title: "Error",
					message: String(err),
					buttons: ["OK"]
				});
			});
	});

	// On page loaded send logs file
	ipcMain.on("getLogsInit", () => {
		const logs = readFileSync(path.join(__dirname, "data/logs.json"), "utf8");

		//sometimes watch run 2 times and one of this is with empty data.
		//this will protect json.parse for empty arrays.
		if (logs.length >= 2) {
			const parsedLogs: logs[] = JSON.parse(logs);
			mainWindow.webContents.send("getLogs", parsedLogs);
		}
	});

	// Listen on file change.
	// On any file change send to renderer new logs file
	watch(path.join(__dirname, "data/logs.json"), (event, filename) => {
		if (event === "change") {
			const logs = readFileSync(path.join(__dirname, "data/logs.json"), "utf8");

			//sometimes watch run 2 times and one of this is with empty data.
			//this will protect json.parse for empty arrays.
			if (logs.length >= 2) {
				const parsedLogs: logs[] = JSON.parse(logs);
				mainWindow.webContents.send("getLogs", parsedLogs);
			}
		}
	});
	// Show a warning dialog box if there is a submission error
	ipcMain.on("submit-error", () => {
		dialog.showMessageBox({
			type: "warning",
			title: "Submission error",
			message: "Please enter all the data. The path to the blk*.dat blocks must be entered along with the field of converted blocks.",
			buttons: ["OK"]
		});
	});
});

// Listen for the "window-all-closed" event from the Electron app.
// Quit the app when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
	// Check if the platform is not macOS.
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// Listen for the "activate" event from the Electron app.
// Create a new window if no windows are currently open.
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
