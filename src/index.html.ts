import { ipcRenderer } from "electron";
import { appConfig } from "./data/config.interface";

document.addEventListener("DOMContentLoaded", () => {
	const minWindow = document.getElementById("min-window");
	const maxWindow = document.getElementById("max-window");
	const exitMaxWindow = document.getElementById("exit-max-window");
	const closeWindowEl = document.getElementById("close-window");

	minWindow?.addEventListener("click", minimizeWindow);
	maxWindow?.addEventListener("click", toggleFullScreen);
	exitMaxWindow?.addEventListener("click", exitMaxWindowF);
	closeWindowEl?.addEventListener("click", closeWindow);

	function minimizeWindow() {
		ipcRenderer.send("minimize");
	}

	function toggleFullScreen() {
		ipcRenderer.send("maximize");
		maxWindow?.classList.toggle("hide");
		exitMaxWindow?.classList.toggle("hide");
	}
	function exitMaxWindowF() {
		ipcRenderer.send("exitMaxWindow");
		maxWindow?.classList.toggle("hide");
		exitMaxWindow?.classList.toggle("hide");
	}

	function closeWindow() {
		ipcRenderer.send("closeWindow");
	}

	ipcRenderer.send("numThreads");
	ipcRenderer.on("numThreadsRes", (e, arg: number) => {
		if (arg < 4) {
			alert("Not enough CPU cores to run this program");
			closeWindow();
		}
	});

	initCheck();
	function initCheck() {
		ipcRenderer.send("checkConfig");

		ipcRenderer.on(
			"checkConfigResponse",
			(event, arg: appConfig) => {
				arg.blocksDirPath === "" ||
				arg.parsedBlocksDirPath === ""
					? navigateTo("./views/home/home")
					: navigateTo("./views/parser/parser");
			}
		);
	}
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

	async function chooseDirectory() {
		try {
			const sciezkaDoFolderu = await ipcRenderer.invoke(
				"choose-directory"
			);
			if (sciezkaDoFolderu) {
				console.log(
					"Wybrano folder:",
					sciezkaDoFolderu
				);
				
			}
		} catch (error) {
			console.error(error);
		}
	}
});
