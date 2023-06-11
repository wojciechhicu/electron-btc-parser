import { ipcRenderer } from "electron";
import { iSystemInfo } from "../../utils/index.ipcMain";

const cpu = document.getElementById('cpu');
const cpupercentage = document.getElementById('cpuPercent');
const memory = document.getElementById('memory');
const memorypercentage = document.getElementById('memPercent');
const disk1 = document.getElementById('disk1');
const disk1percentage = document.getElementById('disk1Percent');
const disk2 = document.getElementById('disk2');
const disk2percentage = document.getElementById('disk2Percent');
const converted = document.getElementById('parsed');
const convertedpercentage = document.getElementById('parsedPercent');

setTimeout(async () =>{
	const loader = document.getElementById('loader');
	if(loader)
		loader.style.display = 'none'
}, 5000)

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

	if(cpu && memory && cpupercentage && memorypercentage && disk1 && disk1percentage && disk2 && disk2percentage && converted && convertedpercentage){
		cpu.style.background = `conic-gradient(#00A0F7 0%, #00A0F7 ${cpuUsage}%, #44447A 0%, #44447A 100%)`;
		cpupercentage.innerHTML = `${cpuUsage}%`;
		memory.style.background = `conic-gradient(#FF006E 0%, #FF006E ${percent}%, #44447A 0%, #44447A 100%)`;
		memorypercentage.innerHTML = `${percent}%`;
		disk1.style.background = `conic-gradient(#c0e006 0%, #c0e006 ${update.disk.first}%, #44447A 0%, #44447A 100%)`;
		disk1percentage.innerHTML = `${update.disk.first}%`;
		disk2.style.background = `conic-gradient(#c0e006 0%, #c0e006 ${update.disk.second}%, #44447A 0%, #44447A 100%)`;
		disk2percentage.innerHTML = `${update.disk.second}%`;
		converted.style.background = `conic-gradient(#00f7c2 0%, #00f7c2 ${update.converted}%, #44447A 0%, #44447A 100%)`;
		convertedpercentage.innerHTML = `${update.converted}%`;
	}
}