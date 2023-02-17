/*

    Utility method for managing a local sqlite database to house transactions while device is offline.  If
    a database transaction fails (fetch.js) it will be added to local database (if it does not already exist).
    
    Format of data is as follows:
    {
        id: int
        type: string - "location", "setting", etc
        timestamp: datetime
        status: int - 0 = "pending", 1 = "submitted"
        data: object
    }

    Methods:
        public init() - Creates the database
        public getOfflineTransactions() - Gets list of transactions (for UI);
        public addOfflineTransaction(txn) - Adds transaction to list;
        public updateOfflineTransaction(txn) - Updates transaction in db
        public processOfflineTransactions() - Runs down the list and attempts to save each over network;    

*/

import { getCurrentDateTimeForDatabase } from '../util/calculations';

import * as SQLite from 'expo-sqlite'
let db = SQLite.openDatabase('offline4.db');  


export async function createOfflineTable() {
    return new Promise((resolve, reject) => {
        db.transaction(
            function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, category TEXT, data TEXT, timestamp TEXT, status INTEGER)");               
            },
            function (txObj, error) {
                console.error('database NOT OK', error);
                reject(error.message);
            },                       
            function (txObj, rs) {
                console.log('Offline table exists');
                resolve();                
            },            
        );
   });
}

export function getOfflineData() {
    console.log('getOfflineData(): ');
    return new Promise((resolve, reject) => {
        let data = [];
        db.transaction(
            function (tx) {                
                tx.executeSql(
                    'SELECT * FROM items ORDER BY id DESC',
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
                console.error('Error getting items', error);
                reject(error.message);
            }               
        );
        //console.log('after getting data');                 
    });
}


export function addOfflineData(category, data) {
    //console.log('addOfflineData: ', category, data);

    return new Promise((resolve, reject) => {

        // Validate parameter 1
        if (typeof category !== 'string') {
            //console.log('addOfflineData(): category needs to be a string');
            reject('addOfflineData(): category needs to be a string');
        }
        // Validate parameter 2
        if (typeof data !== 'string') {
            //console.log('addOfflineData(): data needs to be a string');
            reject('addOfflineData(): data needs to be a string');
        }

        db.transaction(
            function (tx) {
                const timestamp = getCurrentDateTimeForDatabase();                
                tx.executeSql(`INSERT INTO items(category, data, timestamp, status) VALUES(?,?,?,?)`, [category, data, timestamp, 0]);
                //console.log('offline - after executing insert');
            },
            function (tx, error) {
                console.error('Error adding items ', tx, error);
                reject(error);
            },
            function (tx, success) { 
                console.log("successfully added item.", tx);
                resolve(success);
            },  
        );        
    });        
}


export function updateOfflineData(id, status) {
    return new Promise((resolve, reject) => {
        db.transaction(
            function (tx) { 
                tx.executeSql(`UPDATE items SET status = (?) WHERE id = (?)`, [status,id]);
            },
            function (tx, error) {
                console.error('Error updating item', id);
                reject(error.message);
            },
            function (tx, resultSet) {                        
                console.log("Updated data");                               
                resolve();
            },
                    
        );
        //console.log("Data Updated...after sql");                                       
    });
}


export function deleteOfflineData(id) {
    return new Promise((resolve, reject) => {
        db.transaction(
            function (tx) {                
                tx.executeSql(`DELETE FROM items WHERE id= (?)`, [id]);
            },
            function (tx, error) {
                console.error('Error deleting item', id);
                reject(error.message);
            },
            function (tx, resultSet) {                        
                resolve();
            },                    
        );
    });
}


export function deleteAllOfflineData(status = -1) {
    return new Promise((resolve, reject) => {
        db.transaction(
            function (tx) {           
                if (status == -1) {
                    tx.executeSql(`DELETE FROM items`);
                }
                else {                    
                    tx.executeSql(`DELETE FROM items WHERE status= (?)`, [status]);
                }                
            },
            function (tx, error) {
                console.error('Error deleting items');
                reject(error.message);
            },
            function (tx, resultSet) {                        
                resolve();
            },                    
        );
    });
}




