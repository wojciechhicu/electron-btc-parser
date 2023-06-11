import * as oss from "os-utils";
import checkDiskSpace from "check-disk-space";
import { appConfig } from "../data/config.interface";
import { readFileSync, readdirSync } from "fs";
import * as path from "path";
import { BrowserWindow } from "electron";
import { logs } from "../data/logs.interface";

export function formatBytes(bytes: number): number {
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return bytes / Math.pow(1024, i);
}

export interface iSystemInfo {
	cpu: {
		usage: number;
	};
	memory: {
		total: number;
		free: number;
	};
	disk: {
		first: number;
		second: number;
	};
	converted: number;
}
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

export function getDiskUsagePercentage(disk: string): Promise<number> {
	return new Promise((resolve) => {
		checkDiskSpace(disk).then((v) => {
			const usage = v.size - v.free;
			const res = Math.ceil((usage / v.size) * 100);
			resolve(res);
		});
	});
}

function getDisks(): string[] {
	try {
		const config = readFileSync(
			path.join(__dirname, "../data/config.json"),
			"utf8"
		);
		const parsedConfig: appConfig = JSON.parse(config);
		let disks: string[] = [];
		disks.push(parsedConfig.blocksDirPath);
		disks.push(parsedConfig.parsedBlocksDirPath);
		return disks;
	} catch (e: any) {
		throw new Error(e);
	}
}

function getParsedFilesPerentege(): number {
	const files = getBlkFiles();
	const parsedFiles = getParsedBlkFiles();
	const percent = Math.ceil((parsedFiles / files) * 100);
	if(files == 0 && parsedFiles == 0){
		return 100
	} else {
		return percent
	}
}

function getBlkFiles(): number {
	try {
		const config = readFileSync(
			path.join(__dirname, "../data/config.json"),
			"utf8"
		);
		const parsedConfig: appConfig = JSON.parse(config);
		const files = readdirSync(parsedConfig.blocksDirPath);
		const filteredFiles = files.filter((file) => {
			const fileExtension = path.extname(file); // Pobierz rozszerzenie pliku
			const fileName = path.basename(file, fileExtension); // Pobierz nazwę pliku bez rozszerzenia

			return (
				fileName.startsWith("blk") &&
				fileExtension === ".dat"
			);
		});
		return filteredFiles.length
	} catch (e: any) {
		throw new Error(e);
	}
}

function getParsedBlkFiles(): number {
	try{
		const config = readFileSync(
			path.join(__dirname, "../data/config.json"),
			"utf8"
		);
		const parsedConfig: appConfig = JSON.parse(config);
		return parsedConfig.parsedBlocksFiles.length
	} catch(e: any){
		throw new Error(e);
	}
}