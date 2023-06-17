import { Block, Transaction as TransactionType, TxOutput, TxInput, address, script, payments, networks } from "bitcoinjs-lib";
import { parsedBlock as BLK, parsedTransaction as pTransaction, parsedTxOutput as pTxOutput, iTxOutputData, parsedTxInput as pTxInput, orderedBLK as oBLK } from "./blk.interface";
import { readFileSync } from "fs";
import { getLastBlock, getOrphans } from '../shared/files.module';

export function readBlocksFromBitcoinFile(filePath: string): BLK[] {
	try {
		// file reader as buffer
		const fileBuffer = readFileSync(filePath);

		// get file size
		const fileSize = fileBuffer.length;

		//get offset for each block
		let offset = 0;

		// create array of converted blocks
		let parsedData: BLK[] = [];

		// create and analyze block
		// data of every block is pushed to array of blocks
		while (offset < fileSize) {
			// Check if header is ok
			const magicBytes = fileBuffer.readUInt32LE(offset);
			if (magicBytes !== 0xd9b4bef9) {
				console.log("Error while compiling.");
				break;
			}
			offset += 4; // Move 4 bytes (magic bytes)

			const blockSize = fileBuffer.readUInt32LE(offset);
			offset += 4; // Move 4 bytes (Block size)

			// slice to get only one block per iteration
			const blockData = fileBuffer.slice(offset, offset + blockSize);

			// convert block as buffer to JSON object block
			const rawBlockData: BLK = convertBlockRAWData(Block.fromBuffer(blockData), blockSize);
			parsedData.push(rawBlockData);

			// move block size
			offset += blockSize;
		}
		return parsedData;
	} catch (e: any) {
		throw new Error(e);
	}
}

function convertBlockRAWData(blockData: Block, size: number): BLK {
	const blockJSON: BLK = {
		hash: blockData.getHash().reverse().toString("hex"),
		version: blockData.version,
		prevHash: blockData.prevHash?.reverse().toString("hex"),
		merkleRoot: blockData.merkleRoot?.reverse().toString("hex"),
		timestamp: blockData.timestamp,
		nonce: blockData.nonce,
		//witnessCommit: blockData.getWitnessCommit()?.toString('hex')
		diff: calculateBlockDifficulty(blockData.bits),
		weight: blockData.weight(),
		size: calculateBlockSizeInKB(size),
		virtualSize: calculateVirtualSize(blockData.weight()),
		bits: blockData.bits,
		transactions: blockData.transactions?.map((tx) => convertTransactionsToJson(tx, blockData.timestamp, blockData))
	};
	return blockJSON;
}

function convertTransactionsToJson(transaction: TransactionType, blkTimestamp: number, block: Block): pTransaction {
	const trans: pTransaction = {
		version: transaction.version,
		locktime: transaction.locktime,
		size: transaction.byteLength(),
		blockTimestamp: blkTimestamp,
		weight: transaction.weight(),
		vSize: transaction.virtualSize(),
		hash: transaction.getHash().reverse().toString("hex"),
		ins: transaction.ins.map((input) => convertTransactionInputToJson(input, transaction, block)),
		outs: transaction.outs.map((output) => convertTransactionOutputToJson(output))
		//fee: getTransactionFee(transaction),
		//senderAddress: getSenderAddress(transaction)
		// recipientAddress: getRecipientAddress(transaction),
		// status: getTransactionStatus(transaction),
		// transactionType: getTransactionType(transaction),
	};
	return trans;
}

function calculateBlockDifficulty(bits: number): number {
	const target: number = 0x00000000ffff0000000000000000000000000000000000000000000000000000;
	const exponent: number = (bits >>> 24) - 3;
	const mantissa: number = bits & 0x007fffff;

	const difficulty: number = target / Math.pow(2, 8 * exponent) / mantissa;
	const converted = Math.floor(difficulty);
	return converted;
}

function calculateVirtualSize(weight: number): number {
	const virtualSize: number = Math.ceil((weight + 3) / 4);
	return Math.ceil(virtualSize / 1000);
}

function calculateBlockSizeInKB(blockSizeInBytes: number): number {
	const blockSizeInKB = blockSizeInBytes / 1000;
	return Math.round(blockSizeInKB * 1000) / 1000;
}

function convertTransactionOutputToJson(output: TxOutput): pTxOutput {
	// Analyze the scriptPubKey of the output to extract additional data
	const OutputData: iTxOutputData = analyzeScriptPubKey(output);

	// Create the transaction output JSON object
	const transactionOutputJson: pTxOutput = {
		value: output.value,
		scriptPubKeyHex: output.script.toString("hex"),
		scriptPubKeyASM: OutputData.scriptPubKeyASM,
		address: OutputData.address,
		type: OutputData.type
	};

	return transactionOutputJson;
}

function analyzeScriptPubKey(output: TxOutput): iTxOutputData {
	const scriptPubKey = output.script;
	const scriptPubKeyASM = script.toASM(scriptPubKey);

	if (scriptPubKeyASM.startsWith("OP_RETURN")) {
		// Output script is OP_RETURN, skipping it and not obtaining an address
		const data: iTxOutputData = {
			address: null,
			type: "OP_RETURN",
			scriptPubKeyASM: scriptPubKeyASM
		};
		return data;
	} else {
		// Output script is P2PKH (Pay-to-Public-Key-Hash)
		if (scriptPubKeyASM.startsWith("OP_DUP OP_HASH160")) {
			const decompiledScript = script.decompile(scriptPubKey);
			if (decompiledScript && decompiledScript.length >= 3) {
				const publicKeyHashBuffer = decompiledScript[2] as Buffer;
				const address = payments.p2pkh({
					hash: publicKeyHashBuffer,
					network: networks.bitcoin
				}).address;
				const data: iTxOutputData = {
					address: address || null,
					type: "P2PKH",
					scriptPubKeyASM: scriptPubKeyASM
				};
				return data;
			}
		}

		// Output script is P2SH (Pay-to-Script-Hash)
		else if (scriptPubKeyASM.startsWith("OP_HASH160")) {
			const addressh = address.fromOutputScript(scriptPubKey);
			const data: iTxOutputData = {
				address: addressh,
				type: "P2SH",
				scriptPubKeyASM: scriptPubKeyASM
			};
			return data;
		}

		// Output script is P2WPKH (Pay-to-Witness-Public-Key-Hash)
		else if (scriptPubKeyASM.startsWith("OP_0 OP_PUSHBYTES20")) {
			const addressh = address.fromOutputScript(scriptPubKey);
			const data: iTxOutputData = {
				address: addressh,
				type: "P2WPKH",
				scriptPubKeyASM: scriptPubKeyASM
			};
			return data;
		}

		// Output script is P2WSH (Pay-to-Witness-Script-Hash)
		else if (scriptPubKeyASM.startsWith("OP_0 OP_PUSHBYTES32")) {
			const addressh = address.fromOutputScript(scriptPubKey);
			const data: iTxOutputData = {
				address: addressh,
				type: "P2WSH",
				scriptPubKeyASM: scriptPubKeyASM
			};
			return data;
		}

		// Output script is P2PK (Pay-to-Public-Key)
		else if (scriptPubKeyASM.startsWith("OP_PUSHBYTES")) {
			const publicKeyBuffer = scriptPubKey.slice(1);
			const publicKey = publicKeyBuffer.toString("hex");
			const data: iTxOutputData = {
				address: publicKey,
				type: "P2PK",
				scriptPubKeyASM: scriptPubKeyASM
			};
			return data;
		}

		//others output scripts
		const data: iTxOutputData = {
			address: null,
			type: "OTHER",
			scriptPubKeyASM: scriptPubKeyASM
		};
		return data;
	}
}

function convertTransactionInputToJson(input: TxInput, transaction: TransactionType, block: Block): pTxInput {
	const transactionInputJson: pTxInput = {
		txId: input.hash.reverse().toString("hex"),
		ind: input.index,
		scriptSig: input.script.toString("hex"),
		sequence: input.sequence,
		witness: input.witness.map((witnessItem) => witnessItem.toString("hex"))
	};
	return transactionInputJson;
}

export function setBlockOrder(blocks: BLK[]): oBLK {
	const lastBlock = getLastBlock();

	if (lastBlock != undefined) {
		let sortedBlocks: BLK[] = [];
		sortedBlocks.push(lastBlock);
		let orphanBlocks: BLK[] = [];
		let lastOrpahnBlocks = getOrphans();
		let combinedBlocks: BLK[] = [...blocks, ...lastOrpahnBlocks];

		while (combinedBlocks.length > 0) {
			let blkFound = false;
			for (let i = 0; i < combinedBlocks.length; i++) {
				const currentBlock = combinedBlocks[i];
				const previousBlock = currentBlock.prevHash;

				if (sortedBlocks[sortedBlocks.length - 1].hash === previousBlock) {
					sortedBlocks.push(currentBlock);
					combinedBlocks.splice(i, 1);
					blkFound = true;
					break;
				}
			}
			if (!blkFound) {
				orphanBlocks = combinedBlocks;
				break;
			}
		}

		sortedBlocks.shift();

		let height = Number(lastBlock.height);
		sortedBlocks.forEach((val) => {
			val.height = height + 1;
			height++;
		});
                const sortedBlocksAndOrphans: oBLK = {
			ordered: sortedBlocks,
			orphans: orphanBlocks
		}
		return sortedBlocksAndOrphans;
	} else {
		let sortedBlocks: BLK[] = [];
		let orphanBlocks: BLK[] = [];

		while (blocks.length > 0) {
			let blkFound = false;
			for (let i = 0; i < blocks.length; i++) {
				const currentBlock = blocks[i];
				if (currentBlock.hash === "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f") {
					sortedBlocks.push(currentBlock);
					blocks.splice(i, 1);
					blkFound = true;
					break;
				}
				const previousBlock = currentBlock.prevHash;
				if (sortedBlocks[sortedBlocks.length - 1].hash === previousBlock) {
					sortedBlocks.push(currentBlock);
					blocks.splice(i, 1);
					blkFound = true;
					break;
				}
			}
			if (!blkFound) {
				orphanBlocks = blocks;
				break;
			}
		}
		sortedBlocks.forEach((val, ind) => {
			val.height = ind;
		});
                const sortedBlocksAndOrphans: oBLK = {
                        ordered: sortedBlocks,
                        orphans: orphanBlocks
                }
		return sortedBlocksAndOrphans;
	}
}
