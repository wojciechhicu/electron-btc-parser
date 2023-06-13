import { ipcRenderer } from "electron";
import { iSystemInfo } from "../../utils/main.interface";
import { logs } from "../../data/logs.interface";

// console object
const consoleTextarea = document.getElementById("console") as HTMLInputElement;

// stats objects
const cpu = document.getElementById("cpu") as HTMLElement;
const cpupercentage = document.getElementById("cpuPercent") as HTMLElement;
const memory = document.getElementById("memory") as HTMLElement;
const memorypercentage = document.getElementById("memPercent") as HTMLElement;
const disk1 = document.getElementById("disk1") as HTMLElement;
const disk1percentage = document.getElementById("disk1Percent") as HTMLElement;
const disk2 = document.getElementById("disk2") as HTMLElement;
const disk2percentage = document.getElementById("disk2Percent") as HTMLElement;
const converted = document.getElementById("parsed") as HTMLElement;
const convertedpercentage = document.getElementById("parsedPercent") as HTMLElement;

// tooltips and cards for main menu
const cards: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".card");
const tooltips: NodeListOf<HTMLElement> = document.querySelectorAll(".tooltip");

// add listeners for cards / buttons
cards.forEach((card, index) => {
	const tooltip = tooltips[index];

	card.addEventListener("mouseenter", () => {
		tooltipFadeIn(tooltip);
	});

	card.addEventListener("focusin", () => {
		tooltipFadeIn(tooltip);
	});

	card.addEventListener("mouseleave", () => {
		tooltipFadeOut(tooltip);
	});

	card.addEventListener("focusout", () => {
		tooltipFadeOut(tooltip);
	});
});

/**
 * Add fadein animation to object
 * @param tooltip tooltip object
 */
function tooltipFadeIn(tooltip: HTMLElement) {
	tooltip.style.visibility = "visible";
	tooltip.classList.remove("fadeOut");
	tooltip.classList.add("fadeIn");
}

/**
 * Add fadeout animation to object
 * @param tooltip tooltip object
 */
function tooltipFadeOut(tooltip: HTMLElement) {
	tooltip.classList.remove("fadeIn");
	tooltip.classList.add("fadeOut");
	setTimeout(() => {
		tooltip.style.visibility = "hidden";
	}, 300);
}

// every 5s update charts and remove loader if exist
setInterval(() => {
	ipcRenderer.send("systemInfo");
	ipcRenderer.on("systemInfoResponse", (ev, arg: iSystemInfo) => {
		chartUpdate(arg);
		removeLoader();
	});
}, 5000);

// when loaded get logs for console
ipcRenderer.send("getLogsInit");

// listen on getlogs channel and put data into console
ipcRenderer.on("getLogs", async (ev, arg: logs[]) => {
	if (consoleTextarea) {
		if (arg.length === 0) {
			consoleTextarea.value = "/console";
			return;
		}
		consoleTextarea.value = "/console \n";
		arg.forEach((v) => {
			const logTime = new Date(v.time);
			const formattedTime = `${logTime.getFullYear()}/${(
				logTime.getMonth() + 1
			)
				.toString()
				.padStart(2, "0")}/${logTime
				.getDate()
				.toString()
				.padStart(2, "0")} - ${logTime
				.getHours()
				.toString()
				.padStart(2, "0")}:${logTime
				.getMinutes()
				.toString()
				.padStart(2, "0")}:${logTime
				.getSeconds()
				.toString()
				.padStart(2, "0")}`;
			const log = v.log;
			consoleTextarea.value += `${formattedTime} > ${log}\n`;
		});
		consoleTextarea.scrollTop = consoleTextarea.scrollHeight;
	}
});

// sts charts update every 5s
function chartUpdate(update: iSystemInfo): void {
	const cpuUsage = update.cpu.usage;
	const usedMem = update.memory.total - update.memory.free;
	const percent = Number(
		((usedMem / update.memory.total) * 100).toFixed(0)
	);

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


// When data about stats is loaded remove loaders from charts
function removeLoader(): void{
	const loaders: NodeListOf<HTMLElement> = document.querySelectorAll(".loader-container");
	loaders.forEach((val)=>{
		val.style.display = 'none'
	})
}