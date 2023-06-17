import { Worker, parentPort } from "node:worker_threads";
import { Block, Transaction as Tx, TxInput, TxOutput } from "bitcoinjs-lib";
import { getConfig, getBlkFiles, setNewConfig, saveOrderedBlocks, saveOrphanBlocks, saveLastBlock } from "../shared/files.module";
import { addLogs } from "../../utils/logs.write";
import { readBlocksFromBitcoinFile, setBlockOrder } from "./blk.module";
import * as path from "path";
import { converterToSaverData as DATA} from './blk.interface';

/**
 * Helper variable to determine function should remain parsing or stop after switching to false.
 *
 * Webworker is closed after switching to false when full data in file is converted etc.
 */
let work = true;

/**
 * Listen on event from main process to turn off the parser.
 */
parentPort?.on("message", (ev) => {
	work = false;
});

/**
 * Add log for user that parser is running
 */
addLogs("Converter started.", Date.now());

/**
 * Start parser function
 */
blockConverter();

async function blockConverter() {
	try {
		while (work) {
			const config = getConfig();
			const rawBlkFiles = getBlkFiles(config.blocksDirPath);
			const parsedBlkFiles = config.parsedBlocksFiles;
			const filesToConvert = rawBlkFiles.filter((file) => !parsedBlkFiles.includes(file));
			if (filesToConvert.length === 0) {
				blockConverterWatch();
			}

			const filePath = path.join(config.blocksDirPath, filesToConvert[0]);
			const parsedData = await readBlocksFromBitcoinFile(filePath);
			addLogs(`Blocks file: ${filesToConvert[0]} converted to .json`, Date.now());
			config.parsedBlocksFiles.push(filesToConvert[0]);
			setNewConfig(config);

			addLogs("Ordering blocks by hash...", Date.now());
			const orderedBlocksANDOrphans = setBlockOrder(parsedData);
			
			addLogs("Writing blocks data to files", Date.now());
			saveOrderedBlocks(orderedBlocksANDOrphans.ordered, filesToConvert[0]);
		
			if(orderedBlocksANDOrphans.orphans){
				addLogs("Writing orphan blocks data to files", Date.now());
				saveOrphanBlocks(orderedBlocksANDOrphans.orphans);
			}
		
			saveLastBlock(orderedBlocksANDOrphans.ordered[orderedBlocksANDOrphans.ordered.length - 1])
			
			addLogs(`Blocks from height ${orderedBlocksANDOrphans.ordered[0].height} to ${orderedBlocksANDOrphans.ordered[orderedBlocksANDOrphans.ordered.length - 1].height} saved.`, Date.now());

                        // gives time for this thread to check if work = false because It cannot be readed while thread is constantly full
                        await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		addLogs("Converter stopped by user.", Date.now());
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}
function blockConverterWatch() {
	console.log("Watching for changes in block converter");
}

function stopConverter() {
	work = false;
}
