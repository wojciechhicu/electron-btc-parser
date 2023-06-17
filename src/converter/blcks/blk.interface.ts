export interface parsedBlock {
	hash: string;
	version: number;
	prevHash?: string;
	height?: number;
	merkleRoot?: string;
	timestamp: number;
	nonce: number;
	witnessCommit?: string;
	diff: number;
	transactions?: parsedTransaction[];
	size: number;
	weight: number;
	bits: number;
	virtualSize: number;
}

export interface parsedTransaction {
	version: number;
	locktime: number;
	size: number;
	blockTimestamp: number;
	weight: number;
	hash: string;
	vSize: number;
	ins: parsedTxInput[];
	outs: parsedTxOutput[];
	//fee: number;
	//senderAddress: string;
	//recipientAddress: string;
	//inputCount: number;
	//outputCount: number;
	//status: string;
	//transactionType: string;
}

export interface parsedTxInput {
	txId: string;
	ind: number;
	scriptSig: string;
	sequence: number;
	value?: number;
	witness?: string[];
}

export interface parsedTxOutput {
	value: number;
	address: string | null;
	type: string;
	scriptPubKeyASM: string;
	scriptPubKeyHex: string;
}

export interface iTxOutputData {
	address: string | null;
	type: string;
	scriptPubKeyASM: string;
}

export interface orderedBLK {
        ordered: parsedBlock[];
        orphans?: parsedBlock[];
}

export interface converterToSaverData {
	blocks: parsedBlock[];
	fileName: string;
}