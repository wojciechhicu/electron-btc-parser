import { ipcRenderer } from "electron";
import { appConfig } from "../../data/config.interface";

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