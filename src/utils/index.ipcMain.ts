import * as oss from "os-utils";
import checkDiskSpace from "check-disk-space";
import { appConfig } from "../data/config.interface";
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, readdir, unlinkSync } from "fs";
import * as path from "path";
import { iSystemInfo } from "./main.interface";
import { addLogs } from "./logs.write";

/**
 * Format given number in bytes to GB
 * @param bytes file size in bytes
 * @returns file size in GB's
 */
export function formatBytes(bytes: number): number {
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return bytes / Math.pow(1024, i);
}

/**
 * Get system info
 * @returns system stat info
 */
export async function checkSystemInfoStats(): Promise<iSystemInfo> {
	const freeMem = formatBytes(oss.freemem());
	const totalMem = formatBytes(oss.totalmem());
	const disks = getDisks();
	const disk1 = await getDiskUsagePercentage(disks[0]);
	const disk2 = await getDiskUsagePercentage(disks[1]);
	const parsed = getParsedFilesPerentege();
	const info: iSystemInfo = {
		cpu: {
			usage: 0 //data is updated in index.ts by python script
		},
		memory: {
			total: totalMem,
			free: freeMem
		},
		disk: {
			first: disk1,
			second: disk2
		},
		converted: parsed
	};
	return info;
}

/**
 * Get disk usage
 * @param disk disk to check
 * @returns disk usage in %
 */
export function getDiskUsagePercentage(disk: string): Promise<number> {
	return new Promise((resolve) => {
		checkDiskSpace(disk).then((v) => {
			const usage = v.size - v.free;
			const res = Math.ceil((usage / v.size) * 100);
			resolve(res);
		});
	});
}

/**
 * Get disks from config.json
 * @returns disks array
 */
function getDisks(): string[] {
	try {
		const config = readFileSync(path.join(__dirname, "../data/config.json"), "utf8");
		const parsedConfig: appConfig = JSON.parse(config);
		let disks: string[] = [];
		disks.push(parsedConfig.blocksDirPath);
		disks.push(parsedConfig.parsedBlocksDirPath);
		return disks;
	} catch (e: any) {
		throw new Error(e);
	}
}

/**
 * How much % of blockchain is parsed
 * @returns % of parsed files
 */
function getParsedFilesPerentege(): number {
	const files = getBlkFiles();
	const parsedFiles = getParsedBlkFiles();
	const percent = Math.ceil((parsedFiles / files) * 100);
	if (files == 0 && parsedFiles == 0) {
		return 100;
	} else {
		return percent;
	}
}

/**
 * How much blk files is in folder
 * @returns number of blk files
 */
function getBlkFiles(): number {
	try {
		const config = readFileSync(path.join(__dirname, "../data/config.json"), "utf8");
		const parsedConfig: appConfig = JSON.parse(config);
		const files = readdirSync(parsedConfig.blocksDirPath);
		const filteredFiles = files.filter((file) => {
			const fileExtension = path.extname(file); // Pobierz rozszerzenie pliku
			const fileName = path.basename(file, fileExtension); // Pobierz nazwę pliku bez rozszerzenia

			return fileName.startsWith("blk") && fileExtension === ".dat";
		});
		return filteredFiles.length;
	} catch (e: any) {
		throw new Error(e);
	}
}

/**
 * How much blocks are parsed
 * @returns number of parsed files
 */
function getParsedBlkFiles(): number {
	try {
		const config = readFileSync(path.join(__dirname, "../data/config.json"), "utf8");
		const parsedConfig: appConfig = JSON.parse(config);
		return parsedConfig.parsedBlocksFiles.length;
	} catch (e: any) {
		throw new Error(e);
	}
}

/**
 * Check if folder exist.
 *
 * If not create it
 * @param path path to directory
 */
export function createDirectory(path: string): void {
	try {
		if (!existsSync(path)) {
			mkdirSync(path, { recursive: true });
		}
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}

/**
 * Create last block json file with given path
 * @param path path to last block file
 */
export function createLastBlockFile(path: string): void {
	try {
		if (!existsSync(path + "/lastBlk.json")) {
			const emptyData = {};
			const jsonData = JSON.stringify(emptyData, null, 2);
			writeFileSync(path + "/lastBlk.json", jsonData, "utf8");
		}
	} catch (e: any) {
		addLogs(e, Date.now());
		throw new Error(e);
	}
}

export async function deleteParsedData(): Promise<void> {
	try{
		const config = readFileSync(path.join(__dirname, "../data/config.json"), "utf8");
		const parsedConfig: appConfig = JSON.parse(config);
		parsedConfig.parsedBlocksFiles = [];
		parsedConfig.parsedRevsFiles = [];
		deleteLastBlock(parsedConfig.lastBlockFilePath);
		await deleteFullJSONDir(parsedConfig.parsedBlocksDirPath);
		await deleteFullJSONDir(parsedConfig.transactionsRevsPath);
		await deleteOrphansDir(parsedConfig.orphanBlocksPath);
		addLogs('Deleted all converted data successfuly', Date.now());
	} catch(e: any){
		addLogs(e, Date.now());
		throw new Error(e)
	}
}

function deleteLastBlock(path: string): void {
	const fullPath = path + "/lastBlk.json";
	const emptyObj = {};
	const emptyJson = JSON.stringify(emptyObj, null, 2);
	writeFileSync(fullPath, emptyJson, "utf8");
}

async function deleteFullJSONDir(path: string): Promise<void> {
	try{
		new Promise((resolve, reject)=>{
			readdir(path, (e, data) => {
				if(e){
					reject(e)
				} else {
					data.forEach((val)=>{
						unlinkSync(`${path}/${val}`);
					})
				}
			});
		})
	} catch(e: any){
		addLogs(e, Date.now());
		throw new Error(e)
	}
}

async function deleteOrphansDir(path: string): Promise<void> {
	try{
		new Promise((resolve, reject)=>{
			readdir(path, (e, data) => {
				if(e){
					reject(e)
				} else {
					const emptyArr: any[] = [];
					const arr = JSON.stringify(emptyArr, null, 2);
					data.forEach((val)=>{
						writeFileSync(`${path}/${val}`, arr, 'utf8')
					})
				}
			});
		})
	} catch(e: any){
		addLogs(e, Date.now());
		throw new Error(e)
	}
}
