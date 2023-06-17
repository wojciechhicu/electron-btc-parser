import { readdirSync, readFileSync } from "fs";
import { appConfig } from "../../data/config.interface";
import { addLogs } from "../../utils/logs.write";
import { parentPort } from "node:worker_threads";
import { getConfig } from "../shared/files.module";
import { parsedBlock as BLK } from "./blk.interface";

let work = true;

parentPort?.on("message", (ev) => {
	work = false;
});

parentPort?.on('close', () =>{
        parentPort?.postMessage('stoped');
})
addLogs('Validater started,', Date.now());
validater();
async function validater() {
	try {
		const config = getConfig();
		const filesToCheck = getConvertedFiles(config.parsedBlocksDirPath);
		let lastBlock!: BLK;
		while (work) {
			if (filesToCheck.length === 0) {
                                addLogs('Validation finished. Data is stored correctly.', Date.now());
                                //parentPort?.postMessage('stoped');
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                parentPort?.postMessage('stoped');
				return;
			}

			const rawBlocksFile = readFileSync(`${config.parsedBlocksDirPath}/${filesToCheck[0]}`, "utf8");
			const parsedBlockFile: BLK[] = JSON.parse(rawBlocksFile);
			filesToCheck.shift();
			parsedBlockFile.forEach((val, ind) => {
                                if(val.hash === '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'){
                                        return;
                                };
                                if( ind + 1 === parsedBlockFile.length){
                                        return;
                                }
                                const previousBlock = parsedBlockFile[ind];
                                const currentBlock = parsedBlockFile[ind + 1];
                
                                if (previousBlock.hash !== currentBlock.prevHash) {
                                        addLogs(`Validation error between blocks: ${previousBlock.hash} and ${currentBlock.prevHash}`, Date.now());
                                }
                                lastBlock = parsedBlockFile[ind + 1];
                        });
                        await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		addLogs("Validater stoped by user", Date.now());
                parentPort?.postMessage('stoped');
	} catch (e: any) {
		addLogs("Cannot validate", Date.now());
		throw new Error(e);
	}
}
function getConvertedFiles(path: string): string[] {
	const files = readdirSync(path, "utf8");
	return files;
}
