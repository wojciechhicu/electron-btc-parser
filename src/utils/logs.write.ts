import { writeFileSync, readFileSync } from 'fs';
import { logs } from '../data/logs.interface';
import * as path from 'path';

/**
 * Add log to logs json file displayed in console.
 * @param message message as log
 * @param timestamp timestamp when log is created
 */
export function addLogs(message: string, timestamp: number): void {
        try{
                let logObj: logs = {
                        log: message,
                        time: timestamp
                }
                const filePath = path.join(__dirname, '../data/logs.json')
                const file = readFileSync( filePath, 'utf8');
                const fileData: logs[] = JSON.parse(file);

                if(fileData.length >= 30){
                        fileData.shift();
                }

                fileData.push(logObj);
                const strData = JSON.stringify(fileData, null, 2);
                writeFileSync(filePath, strData, 'utf8');
        } catch(e: any){
                throw new Error(e)
        }
}