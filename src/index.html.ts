import { ipcRenderer } from "electron";
import { appConfig } from "./data/config.interface";

// Function to handle the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
	// Get the necessary DOM elements
	const minWindow = document.getElementById("min-window");
	const maxWindow = document.getElementById("max-window");
	const exitMaxWindow = document.getElementById("exit-max-window");
	const closeWindowEl = document.getElementById("close-window");

	// Attach event listeners to the window control buttons
	minWindow?.addEventListener("click", minimizeWindow);
	maxWindow?.addEventListener("click", toggleFullScreen);
	exitMaxWindow?.addEventListener("click", exitMaxWindowF);
	closeWindowEl?.addEventListener("click", closeWindow);

	/**
	 * Function to minimize the window
	 */
	function minimizeWindow() {
		ipcRenderer.send("minimize");
	}

	/**
	 * Function to toggle fullscreen mode
	 */
	function toggleFullScreen() {
		ipcRenderer.send("maximize");
		maxWindow?.classList.toggle("hide");
		exitMaxWindow?.classList.toggle("hide");
	}

	/**
	 * Function to exit fullscreen mode
	 */
	function exitMaxWindowF() {
		ipcRenderer.send("exitMaxWindow");
		maxWindow?.classList.toggle("hide");
		exitMaxWindow?.classList.toggle("hide");
	}

	/**
	 *  Function to close the window
	 */
	function closeWindow() {
		ipcRenderer.send("closeWindow");
	}

	// Send a request to get the number of CPU threads
	ipcRenderer.send("numThreads");

	// Event listener to handle the response for the number of CPU threads
	ipcRenderer.on("numThreadsRes", (e, arg: number) => {
		if (arg < 4) {
			alert("Not enough CPU cores to run this program");
			closeWindow();
		}
	});

	// Function to see which view must be loaded to main window
	initCheck();

	function initCheck() {
		ipcRenderer.send("checkConfig");

		// Event listener to handle the response for the initial configuration check
		ipcRenderer.on(
			"checkConfigResponse",
			(event, arg: appConfig) => {
				// Check if the required fields are empty or not
				// if fields are empty, thas mean its first app load or reconfiguring app
				if (
					arg.blocksDirPath === "" ||
					arg.parsedBlocksDirPath === "" ||
					(arg.blocksDirPath === "" &&
						arg.parsedBlocksDirPath === "")
				) {
					navigateTo("./views/home/home");
				} else {
					navigateTo("./views/parser/parser");
				}
			}
		);
	}

	// Function to navigate to a different view
	function navigateTo(baseFilesPath: string) {
		const viewFrame = document.getElementById("content");
		if (viewFrame !== null) {
			Promise.all([
				fetch(`${baseFilesPath}.html`).then(
					(response) => response.text()
				),
				fetch(`${baseFilesPath}.css`).then((response) =>
					response.text()
				),
				fetch(`${baseFilesPath}.js`).then((response) =>
					response.text()
				)
			])
				.then(([html, css, js]) => {
					viewFrame.innerHTML = html;

					const styles =
						document.createElement("style");
					styles.textContent = css;
					viewFrame.appendChild(styles);

					const script =
						document.createElement(
							"script"
						);
					script.textContent = js;
					viewFrame.appendChild(script);
				})
				.catch((err) => {
					console.error(
						"Error while loading files: ",
						err
					);
				});
		} else {
			alert("Frame is null");
		}
	}
});
