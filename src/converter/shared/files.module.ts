import { readFileSync, readdirSync, writeFileSync } from "fs";
import { appConfig } from "../../data/config.interface";
import * as path from "path";
import { addLogs } from "../../utils/logs.write";
import { parsedBlock as BLK, parsedTransaction as pTransaction, parsedTxOutput as pTxOutput, iTxOutputData, parsedTxInput as pTxInput } from "../blcks/blk.interface";
import { unlinkSync } from "original-fs";

const MAX_FILE_SIZE = 450 * 1024 * 1024; // 450 MB

export function getConfig(): appConfig {
	try {
		const rawConfig = readFileSync(path.join(__dirname, "../../data/config.json"), "utf8");
		const parsedConfig: appConfig = JSON.parse(rawConfig);
		return parsedConfig;
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}

export function getBlkFiles(directory: string): string[] {
	try {
		const files = readdirSync(directory);

		const blkFiles = files.filter((file) => {
			return file.endsWith(".dat") && file.startsWith("blk");
		});
		return blkFiles;
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}

export function setNewConfig(config: appConfig) {
	try {
		const strConfig = JSON.stringify(config, null, 2);
		writeFileSync(path.join(__dirname, "../../data/config.json"), strConfig, "utf8");
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}

export function saveNewBlkFile(filename: string, data: BLK[]): void {
	const testData = JSON.stringify(data);
	const testDataSize = Buffer.byteLength(testData);

	if (testDataSize <= MAX_FILE_SIZE) {
	}
}

export function saveLastBlock(data: BLK): void {
	try {
		const lBlock = JSON.stringify(data, null, 2);
		const lBlockPath = getConfig().lastBlockFilePath;
		writeFileSync(`${lBlockPath}/lastBlk.json`, lBlock, "utf8");
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}
export function getLastBlock(): BLK | undefined {
	try {
		const lastBlockFilePath = getConfig().lastBlockFilePath;
		const blockFileData = readFileSync(`${lastBlockFilePath}/lastBlk.json`, "utf8");
		if (blockFileData.length > 4) {
			const lastBlock: BLK = JSON.parse(blockFileData);
                        return lastBlock;
		} else {
			return undefined;
		}
	} catch (e: any) {
                addLogs("Cannot read last block info", Date.now());
		throw new Error(e);
	}
}

export function getOrphans(): BLK[] {
	try {
		const config = getConfig().orphanBlocksPath
		const orphansFilesBlocks: BLK[] = [];
		const orphanFiles = readdirSync(config, 'utf8');
		orphanFiles.forEach((val)=>{
			const rawFile = readFileSync(`${config}/${val}`, 'utf8');
			const pFile: BLK[] = JSON.parse(rawFile);
			orphansFilesBlocks.push(...pFile);
		})

		return orphansFilesBlocks !== undefined ? orphansFilesBlocks : [];
	} catch(e: any){
		addLogs("Cannot read orphan blocks files", Date.now());
		throw new Error(e);
	}
}

export function saveOrderedBlocks(blocks: BLK[], fileName: string): void{
	try {
		let file  = removeFileExtension(fileName);
		const config = getConfig();
		const strBlocks = JSON.stringify(blocks);
		const strSize = Buffer.byteLength(strBlocks, 'utf8');

		if(strSize <= MAX_FILE_SIZE){
			writeFileSync(`${config.parsedBlocksDirPath}/${file}-1.json`, strBlocks, 'utf8');
			return;
		}

		const numPartitions = Math.ceil(strSize / MAX_FILE_SIZE) + 1;
		const indexes = Math.ceil(blocks.length / numPartitions) + 1;
		for(let i = 0; i < numPartitions; i ++){
			const start = i * indexes;
			const end = (i + 1) * indexes;
			const partition = blocks.slice(start, end);
			const strPartition = JSON.stringify(partition);
			writeFileSync(`${config.parsedBlocksDirPath}/${file}-${i + 1}.json`, strPartition, 'utf8');
		}

	} catch(e: any){
		addLogs("Cannot save blocks files", Date.now());
		throw new Error(e);
	}
}

export function saveOrphanBlocks(orphans: BLK[]): void {
	try {
		const oldOrphans = getOrphans();
		// dodac polaczenie podanych blokow orphanicznych i wyeliminowanie duplikatów
		const allOrphans: BLK[] = [...orphans, ...oldOrphans]
		const config = getConfig();
		const strOrphans = JSON.stringify(allOrphans);
		const strSize = Buffer.byteLength(strOrphans, 'utf8');
		deleteAllOrphans(config.orphanBlocksPath);
		if(strSize <= MAX_FILE_SIZE){
			writeFileSync(`${config.orphanBlocksPath}/orphans-1.json`, strOrphans, 'utf8');
			return;
		}

		const numPartitions = Math.ceil(strSize / MAX_FILE_SIZE) + 1;
		const indexes = Math.ceil(allOrphans.length / numPartitions) + 1;
		for(let i = 0; i < numPartitions; i ++){
			const start = i * indexes;
			const end = (i + 1) * indexes;
			const partition = allOrphans.slice(start, end);
			const strPartition = JSON.stringify(partition);
			writeFileSync(`${config.orphanBlocksPath}/orphans-${i + 1}.json`, strPartition, 'utf8');
		}
	} catch(e: any){
		addLogs("Cannot save orphans blocks files", Date.now());
		throw new Error(e);
	}
}

export function removeFileExtension(fileName: string): string {
	const dot = fileName.lastIndexOf(".");
	if (dot !== -1) {
		return fileName.slice(0, dot);
	} else {
		return fileName;
	}
}

function deleteAllOrphans(orphansPath: string): void {
	try {
		const orphanFiles = readdirSync(orphansPath);
		orphanFiles.forEach((val)=>{
			unlinkSync(`${orphansPath}/${val}`);
		})
	} catch(e: any){
		addLogs("Cannot delete orphan files", Date.now());
		throw new Error(e);
	}
}