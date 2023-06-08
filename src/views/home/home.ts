import { ipcRenderer } from "electron";
import { appConfig } from "../../data/config.interface";

const blkFilesBtn = document
	.getElementById("chooseBlkFiles")
	?.addEventListener("click", chooseDirectory);

async function chooseDirectory() {
	ipcRenderer.send("choose-directory-blk");
}

ipcRenderer.on("folderPath-blk", (event, folderPath) => {
	console.log(`ścieżka: ${folderPath}`);
});

const parsedblkFilesBtn = document
	.getElementById("chooseParsedBlkFiles")
	?.addEventListener("click", chooseParsedDirectory);
        
async function chooseParsedDirectory() {
	ipcRenderer.send("choose-directory-parsed-blk");
}

ipcRenderer.on("folderPath-parsed-blk", (event, folderPath) => {
	console.log(`ścieżka skonwertowana: ${folderPath}`);
});