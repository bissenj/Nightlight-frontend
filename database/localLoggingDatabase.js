/*
    Utility which manages a sqlite database on the device used for logging.  Since there is not
    a way to debug a prod build.      

    Ideally these are temporary, more debugging in nature.  Expecting user or system to clear them off routinely.
    
    Format of data is as follows:
    {
        id: int        
        timestamp: datetime        
        area: string - "location", "setting", etc
        message: string
    }

    Methods:
        writeToLog(area, message, type, writeToConsole, writeToDb) -> This will replace all console.log and console.error statements.
            - area:  Some description of where this is being called, ex. function name, or file name
            - message:  Message that should be written to console and optionally the db.
            - type [0, 1]:  0 = console.log, 1 = console.error
            - writeToConsole [true/false]: should message be written to console?
            - writeToDb [true/false]: should message be written to database?

*/

import { getCurrentDateTimeForDatabase } from '../util/calculations';

import * as SQLite from 'expo-sqlite'
let db = SQLite.openDatabase('offlinelogs2.db');  


// Summary:  Writes a message to the console and/or database.  This can replace all 
//           console.log messages in the app.
//
export function writeToLog(area = "", message = "", type = 0, writeToConsole = true, writeToDb = true) {

    if (writeToConsole) {
        if (type == 0) {
            console.log(area, ": ", message);
        }
        else if (type == 1) {
            console.error(area, ": ",  message);
        }
    }

    if (writeToDb) {
        addLog(area, message, type);
    }

}


export async function createLoggingTable() {
    return new Promise((resolve, reject) => {
        db.transaction(
            function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, timestamp TEXT, area TEXT, message TEXT, type NUMBER)");                                              
            },
            function (txObj, error) {
                console.log('database NOT OK', error);
                reject(error.message);
            },                       
            function (txObj, rs) {
                console.log('Logs table exists');
                resolve();                
            },            
        );
   });
}


export function getLogData() {
    //console.log('getLogData(): ');
    return new Promise((resolve, reject) => {
        let data = [];
        db.transaction(
            function (tx) {                
                tx.executeSql(
                    'SELECT * FROM logs ORDER BY id DESC',
                    [],
                    (tx, resultSet) => {                        
                        //console.log('resultSet: ', resultSet);
                        
                        for (let i = 0, c = resultSet.rows.length;i < c;i++) {
                            data.push(resultSet.rows.item(i));
                        }
                        resolve(data);
                    }
                )
            },
            function (tx, error) {
                console.error('Error getting logs', error);
                reject(error.message);
            }               
        );

        //console.log('after getting log data');                 
    });
}


export function addLog(area, message, type = 0) {
    //console.log('addLog: ', area, message, type);

    return new Promise((resolve, reject) => {

        // Validate parameter 1
        if (typeof area !== 'string') {
            //console.log('addLog(): area needs to be a string');
            reject('addLog(): area needs to be a string');
        }
        // Validate parameter 2
        if (typeof message !== 'string') {
            if (typeof message === 'object') {
                message = JSON.stringify(message);
            }
            else {
                //console.log('addLog(): message needs to be a string but is', typeof message);
                reject('addLog(): message needs to be a string');
            }
        }
        // Validate parameter 3
        if (typeof type !== 'number') {
            //console.log('addLog(): type needs to be a number');
            reject('addLog(): type needs to be a number');
        }

        db.transaction(
            function (tx) {
                const timestamp = getCurrentDateTimeForDatabase();                                
                tx.executeSql(`INSERT INTO logs(timestamp, area, message, type) VALUES(?,?,?,?)`, [timestamp, area, message, type]);
                //console.log('logs - after executing insert');
            },
            function (tx, error) {
                console.error('Error adding log ', tx, error);
                reject(error);
            },
            function (tx, success) { 
                console.log("successfully added log.", tx);
                resolve(success);
            },  
        );        
    });
}



export function deleteAllLoggingData() {
    return new Promise((resolve, reject) => {
        db.transaction(
            function (tx) {                          
                tx.executeSql(`DELETE FROM logs`);                              
            },
            function (tx, error) {
                console.error('Error deleting logs');
                reject(error.message);
            },
            function (tx, resultSet) {                        
                resolve();
            },                    
        );
    });
}




