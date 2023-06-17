import { ipcRenderer } from "electron";
import { iSystemInfo } from "../../utils/main.interface";
import { logs } from "../../data/logs.interface";
//import { navigateTo as navTo} from "../../utils/navigateto";

// console object
const consoleTextarea = document.getElementById("console") as HTMLInputElement;

// stats objects
const cpu = document.getElementById("cpu") as unknown as SVGCircleElement;
const cpupercentage = document.getElementById("cpuPercent") as HTMLElement;
const memory = document.getElementById("memory") as unknown as SVGCircleElement;
const memorypercentage = document.getElementById("memPercent") as HTMLElement;
const disk1 = document.getElementById("disk1") as unknown as SVGCircleElement;
const disk1percentage = document.getElementById("disk1Percent") as HTMLElement;
const disk2 = document.getElementById("disk2") as unknown as SVGCircleElement;
const disk2percentage = document.getElementById("disk2Percent") as HTMLElement;
const converted = document.getElementById("parsed") as unknown as SVGCircleElement;
const convertedpercentage = document.getElementById("parsedPercent") as HTMLElement;
const converted2 = document.getElementById("parsed2") as unknown as SVGCircleElement;
const convertedpercentage2 = document.getElementById("parsedPercent2") as HTMLElement;

// tooltips and cards for main menu
const cards: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".card");
const tooltips: NodeListOf<HTMLElement> = document.querySelectorAll(".tooltip");

// cards click events
const settings = document.getElementById("card4") as HTMLButtonElement;
const deleteParsedData = document.getElementById("card3") as HTMLButtonElement;
const startConverting = document.getElementById("card2") as HTMLButtonElement;
const honey = document.getElementById("honey") as HTMLElement;
const stop = document.getElementById("stop") as HTMLElement;

settings.addEventListener("click", navigateSettings);
deleteParsedData.addEventListener("click", deleteData);
startConverting.addEventListener("click", convertStart);
stop.addEventListener('click', convertStop);

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
			consoleTextarea.value = "logs";
			return;
		}
		consoleTextarea.value = "logs \n";
		arg.forEach((v) => {
			const logTime = new Date(v.time);
			const formattedTime = `${logTime.getFullYear()}/${(logTime.getMonth() + 1).toString().padStart(2, "0")}/${logTime.getDate().toString().padStart(2, "0")} - ${logTime.getHours().toString().padStart(2, "0")}:${logTime.getMinutes().toString().padStart(2, "0")}:${logTime.getSeconds().toString().padStart(2, "0")}`;
			const log = v.log;
			consoleTextarea.value += `${formattedTime} > ${log}\n`;
		});
		consoleTextarea.scrollTop = consoleTextarea.scrollHeight;
	}
});

// stats charts update every 5s
function chartUpdate(update: iSystemInfo): void {
	const cpuUsage = update.cpu.usage;
	const usedMem = update.memory.total - update.memory.free;
	const percent = Number(((usedMem / update.memory.total) * 100).toFixed(0));

	cpu.setAttribute("stroke-dasharray", `${cpuUsage},100`);
	cpupercentage.innerHTML = `${cpuUsage}%`;

	memory.setAttribute("stroke-dasharray", `${percent},100`);
	memorypercentage.innerHTML = `${percent}%`;

	disk1.setAttribute("stroke-dasharray", `${update.disk.first},100`);
	disk1percentage.innerHTML = `${update.disk.first}%`;

	disk2.setAttribute("stroke-dasharray", `${update.disk.second},100`);
	disk2percentage.innerHTML = `${update.disk.second}%`;

	converted.setAttribute("stroke-dasharray", `${update.converted},100`);
	convertedpercentage.innerHTML = `${update.converted}%`;

	converted2.setAttribute("stroke-dasharray", `${update.convertedRevs},100`);
	convertedpercentage2.innerHTML = `${update.convertedRevs}%`;
}

/**
 * When data about stats is loaded remove loaders from charts
 */
function removeLoader(): void {
	const loaders: NodeListOf<HTMLElement> = document.querySelectorAll(".loader-container");
	loaders.forEach((val) => {
		val.style.display = "none";
	});
}

function navigateSettings(): void {
	navigateTo("./views/home/home");
}

function navigateTo(baseFilesPath: string) {
	const viewFrame = document.getElementById("content") as HTMLElement;

	Promise.all([fetch(`${baseFilesPath}.html`).then((response) => response.text()), fetch(`${baseFilesPath}.css`).then((response) => response.text()), fetch(`${baseFilesPath}.js`).then((response) => response.text())])
		.then(([html, css, js]) => {
			viewFrame.innerHTML = html;

			const styles = document.createElement("style");
			styles.textContent = css;
			viewFrame.appendChild(styles);

			const script = document.createElement("script");
			script.textContent = js;
			viewFrame.appendChild(script);
		})
		.catch((err) => {
			console.error("Error while loading files: ", err);
		});
}

function deleteData(): void {
	ipcRenderer.send("deleteParsedData");
}

function convertStart(): void {
	ipcRenderer.send("startConverting");
	honey.style.display = "flex";
	cards.forEach((v)=>{
		v.style.visibility = "hidden"
	})
}
function convertStop(): void {
	honey.style.display = "none";
	cards.forEach((v)=>{
		v.style.visibility = "visible"
	})
	ipcRenderer.send("stopConverting");
}
