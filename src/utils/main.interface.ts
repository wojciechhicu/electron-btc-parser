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