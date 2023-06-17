interface BlockHeader {
	version: number;
	previousBlockHash: string;
	merkleRoot: string;
	timestamp: number;
	difficulty: number;
	nonce: number;
}

interface TransactionInput {
	previousOutput: string;
	scriptSig: string;
	sequence: number;
}

interface TransactionOutput {
	value: number;
	scriptPubKey: string;
}

interface Transaction {
	id: string;
	inputs: TransactionInput[];
	outputs: TransactionOutput[];
}

interface AddressIndex {
	address: string;
	transactions: string[];
}

interface OutputIndex {
	outputId: string;
	value: number;
	recipientAddress: string;
}

export interface BitcoinRevFiles {
	blockIndex: BlockHeader[];
	transactionIndex: Transaction[];
	addressIndex: AddressIndex[];
	outputIndex: OutputIndex[];
}
