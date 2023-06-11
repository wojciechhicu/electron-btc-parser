import { ipcRenderer } from "electron";
import { iSystemInfo } from "../../utils/index.ipcMain";

const cpu = document.getElementById('cpu');
const memory = document.getElementById('memory');

setInterval(async () => {
	ipcRenderer.send("systemInfo");
	ipcRenderer.on("systemInfoResponse", (ev, arg: iSystemInfo) => {
		chartUpdate(arg)
	});
}, 5000);

function chartUpdate(update: iSystemInfo): void {
	const cpuUsage = update.cpu.usage;
	const usedMem = update.memory.total - update.memory.free;
	const percent = Number(((usedMem / update.memory.total ) * 100).toFixed(2));

	if(cpu && memory){
		cpu.style.background = `conic-gradient(#0C47A1 0%, #0C47A1 ${cpuUsage}%, gray 0%, gray 100%)`;
		memory.style.background = `conic-gradient(#0C47A1 0%, #647286 ${percent}%, gray 0%, gray 100%)`
	}
}