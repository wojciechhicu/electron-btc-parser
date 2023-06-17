import { addLogs } from "../../utils/logs.write";
import { parentPort } from "node:worker_threads";
import { parsedBlock as BLK, parsedTransaction as pTransaction, parsedTxOutput as pTxOutput, iTxOutputData, parsedTxInput as pTxInput } from "./blk.interface";
import { setBlockOrder } from "./blk.module";
import { converterToSaverData as DATA} from './blk.interface';
import { saveOrderedBlocks, saveOrphanBlocks, saveLastBlock } from '../shared/files.module';

parentPort?.addListener("message", (data: DATA) => {
	addLogs("Ordering blocks by hash...", Date.now());
	const orderedBlocksANDOrphans = setBlockOrder(data.blocks);
        
        addLogs("Writing blocks data to files", Date.now());
        saveOrderedBlocks(orderedBlocksANDOrphans.ordered, data.fileName);

        if(orderedBlocksANDOrphans.orphans){
                addLogs("Writing orphan blocks data to files", Date.now());
                saveOrphanBlocks(orderedBlocksANDOrphans.orphans);
        }

        saveLastBlock(orderedBlocksANDOrphans.ordered[orderedBlocksANDOrphans.ordered.length - 1])
        
        addLogs(`Blocks from height ${orderedBlocksANDOrphans.ordered[0].height} to ${orderedBlocksANDOrphans.ordered[orderedBlocksANDOrphans.ordered.length - 1].height} saved.`, Date.now());
});
