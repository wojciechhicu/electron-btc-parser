import * as oss from "os-utils";
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
}
export async function checkSystemInfoStats(): Promise<iSystemInfo> {
	const freeMem = formatBytes(oss.freemem());
	const totalMem = formatBytes(oss.totalmem());
	const info: iSystemInfo = {
		cpu: {
			usage: 0
		},
		memory: {
			total: totalMem,
			free: freeMem
		}
	};
	return info;
}