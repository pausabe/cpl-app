import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Logger from "../Utils/Logger";

let CPLDataBase = undefined;

export function executeQueryAsync(query){
    return new Promise((resolve, reject) =>
        executeQuery(
            query,
            (result) => resolve(result),
            (error) => reject(error)
        )
    );
}

// TODO: refactor and obsolete?
export function executeQuery(query, callback, errorCallback) {
    if(CPLDataBase === undefined) {
        openDatabase()
            .then((result) => {
                _executeQuery(query)
                    .then((result) => {
                        if(callback !== undefined){
                            callback(result);
                        }
                    })
                    .catch((error) => {
                        if(errorCallback !== undefined){
                            errorCallback(error);
                        }
                    });
            })
            .catch((error) => {
                if(errorCallback !== undefined){
                    errorCallback(error);
                }
            });
    }
    else{
        _executeQuery(query)
            .then((result) => {
                if(callback !== undefined){
                    callback(result);
                }
            })
            .catch((error) => {
                if(errorCallback !== undefined){
                    errorCallback(error);
                }
            });
    }
}

//TODO: dont export
export async function openDatabase() {
    await createDirectory();
    CPLDataBase = SQLite.openDatabase('cpl-app.db');
    //TODO: remove return
    return CPLDataBase;
}

async function createDirectory(){
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
}

// TODO: dont export
export function _executeQuery(query){
    return new Promise((resolve, reject) => {
        CPLDataBase.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (SQLTransaction, SQLResultSet) => resolve(SQLResultSet),
                (SQLTransaction, SQLError) => {
                    Logger.LogError(Logger.LogKeys.DatabaseManagerService, "executeQuery", "error in query (" + query + "): ", SQLError);
                    reject(SQLError);
                });
        });
    });
}