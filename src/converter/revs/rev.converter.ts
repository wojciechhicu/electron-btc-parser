import { Worker, parentPort } from 'node:worker_threads';
import { address } from 'bitcoinjs-lib';

function workerFunction(): void {
	let result = 2
	parentPort?.postMessage(result)
}

workerFunction()