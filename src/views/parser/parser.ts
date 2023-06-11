import { ipcRenderer } from "electron";
import { iSystemInfo } from "../../utils/index.ipcMain";

const cpu = document.getElementById('cpu');
const cpupercentage = document.getElementById('cpuPercent');
const memory = document.getElementById('memory');
const memorypercentage = document.getElementById('memPercent');

setInterval(() => {
	ipcRenderer.send("systemInfo");
	ipcRenderer.on("systemInfoResponse", (ev, arg: iSystemInfo) => {
		chartUpdate(arg)
	});
}, 5000);

function chartUpdate(update: iSystemInfo): void {
	const cpuUsage = update.cpu.usage;
	const usedMem = update.memory.total - update.memory.free;
	const percent = Number(((usedMem / update.memory.total ) * 100).toFixed(0));

	if(cpu && memory && cpupercentage && memorypercentage){
		cpu.style.background = `conic-gradient(#00A0F7 0%, #00A0F7 ${cpuUsage}%, #44447A 0%, #44447A 100%)`;
		cpupercentage.innerHTML = `${cpuUsage}%`;
		memory.style.background = `conic-gradient(#FF006E 0%, #FF006E ${percent}%, #44447A 0%, #44447A 100%)`;
		memorypercentage.innerHTML = `${percent}%`;
	}
}