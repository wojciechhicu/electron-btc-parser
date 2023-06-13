import { ipcRenderer } from "electron";
import { tsParticles } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";

// Event listener for choosing block files directory
document.getElementById("chooseBlkFiles")?.addEventListener(
	"click",
	chooseDirectory
);

// Element references
const pickedBlkdir = document.getElementById("input1") as HTMLInputElement;
const pickedParsedBlkdir = document.getElementById(
	"input2"
) as HTMLInputElement;
const submit = document.getElementById("submit-form") as HTMLButtonElement;

// Event listener for form submission
submit.addEventListener("click", submitFunction);

// Event listener for choosing parsed block files directory
document.getElementById("chooseParsedBlkFiles")?.addEventListener(
	"click",
	chooseParsedDirectory
);

const btns: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".dirButton");
const tooltips: NodeListOf<HTMLElement> = document.querySelectorAll(".tooltip");

// Add animation which depends on maus / focus event
btns.forEach((btn, index)=>{
	const tooltip = tooltips[index];
	btn.addEventListener("mouseenter", () => {
		tooltipFadeIn(tooltip);
	});

	btn.addEventListener("focusin", () => {
		tooltipFadeIn(tooltip);
	});

	btn.addEventListener("mouseleave", () => {
		tooltipFadeOut(tooltip);
	});

	btn.addEventListener("focusout", () => {
		tooltipFadeOut(tooltip);
	});
})

// Function for choosing block files directory
async function chooseDirectory() {
	ipcRenderer.send("choose-directory-blk");
}

// Function for choosing parsed block files directory
async function chooseParsedDirectory() {
	ipcRenderer.send("choose-directory-parsed-blk");
}

// Function for form submission
async function submitFunction() {
	if (pickedBlkdir.value !== "" && pickedParsedBlkdir.value !== "") {
		ipcRenderer.send("restart");
	} else {
		ipcRenderer.send("submit-error")
	}
}

// fadein animation for tooltip
function tooltipFadeIn(tooltip: HTMLElement) {
	tooltip.style.visibility = "visible";
	tooltip.classList.remove("fadeOut");
	tooltip.classList.add("fadeIn");
}

// fadeout animation for tooltip
function tooltipFadeOut(tooltip: HTMLElement) {
	tooltip.classList.remove("fadeIn");
	tooltip.classList.add("fadeOut");
	setTimeout(() => {
		tooltip.style.visibility = "hidden";
	}, 200);
}

// Initialize particles
particles();

// Load particles configuration
async function particles() {
	await loadFull(tsParticles);
	await loadLinksPreset(tsParticles);

	tsParticles.load("tsparticles", {
		fpsLimit: 60,
		background: {
			color: {
				value: "#0d47a1"
			}
		},
		fullScreen: false,
		particles: {
			number: {
				value: 80,
				density: {
					enable: true,
					value_area: 800
				}
			},
			color: {
				value: "#ffffff",
				animation: {
					enable: true,
					speed: 20,
					sync: true
				}
			},
			shape: {
				type: "circle",
				stroke: {
					width: 0,
					color: "#000000"
				},
				polygon: {
					nb_sides: 5
				}
			},
			opacity: {
				value: 0.5,
				random: false,
				anim: {
					enable: false,
					speed: 3,
					opacity_min: 0.1,
					sync: false
				}
			},
			size: {
				value: 3,
				random: true,
				anim: {
					enable: false,
					speed: 20,
					size_min: 0.1,
					sync: false
				}
			},
			line_linked: {
				enable: true,
				distance: 100,
				color: "random",
				opacity: 0.4,
				width: 1,
				triangles: {
					enable: true,
					color: "#ffffff",
					opacity: 0.1
				}
			},
			move: {
				enable: true,
				speed: 3,
				direction: "none",
				random: false,
				straight: false,
				out_mode: "out",
				attract: {
					enable: false,
					rotateX: 600,
					rotateY: 1200
				}
			}
		},
		retina_detect: true
	});
}

// Event listener for receiving picked block directory path
ipcRenderer.on("pickedBlkDirectory", (ev, arg) => {
	if (pickedBlkdir !== null) {
		pickedBlkdir.value = arg;
	}
});

// Event listener for receiving picked parsed block directory path
ipcRenderer.on("pickedParsedBlkDirectory", (ev, arg) => {
	if (pickedParsedBlkdir !== null) {
		pickedParsedBlkdir.value = arg;
	}
});
