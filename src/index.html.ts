import { ipcRenderer } from "electron";

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
                maxWindow?.classList.toggle('hide');
                exitMaxWindow?.classList.toggle('hide');
        }
        function exitMaxWindowF() {
                ipcRenderer.send("exitMaxWindow");
                maxWindow?.classList.toggle('hide');
                exitMaxWindow?.classList.toggle('hide');
        }
        
        function closeWindow() {
                ipcRenderer.send("closeWindow");
        }
        
});


