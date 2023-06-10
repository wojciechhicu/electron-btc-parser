import { ipcRenderer } from "electron";
import { appConfig } from "../../data/config.interface";
import { tsParticles } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";

document.getElementById("chooseBlkFiles")?.addEventListener(
	"click",
	chooseDirectory
);

document.getElementById("chooseParsedBlkFiles")?.addEventListener(
	"click",
	chooseParsedDirectory
);

async function chooseDirectory() {
	ipcRenderer.send("choose-directory-blk");
}

async function chooseParsedDirectory() {
	ipcRenderer.send("choose-directory-parsed-blk");
}

particles();

async function particles() {
	await loadFull(tsParticles);
	await loadLinksPreset(tsParticles);
	tsParticles.load("tsparticles", {
		fpsLimit: 60,
		fullScreen: false,
		particles: {
			number: {
				value: 160,
				density: {
					enable: true,
					value_area: 800
				}
			},
			color: {
				value: "#ff0000",
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
				},
				image: {
					src: "https://cdn.matteobruni.it/images/particles/github.svg",
					width: 100,
					height: 100
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
		retina_detect: true,
	});
}
