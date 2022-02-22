import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Logger from "../Utils/Logger";
import {Asset} from "expo-asset";
import {FileSystemService} from "./FileSystemService";

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

// TODO: refactor
export function executeQuery(query, callback, errorCallback) {
    if(CPLDataBase === undefined) {
        OpenDatabase()
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

async function OpenDatabase() {
    await CreateDirectory();
    await UpdateDatabaseFile();
    const databaseName = `${await GetCurrentDatabaseMD5()}.db`;
    Logger.Log(Logger.LogKeys.DatabaseManagerService, "GetCurrentDatabaseMD5", `Opening database '${databaseName}'`);
    CPLDataBase = SQLite.openDatabase(databaseName);
}

async function CreateDirectory(){
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
}

async function UpdateDatabaseFile(){
    const currentMD5 = await GetCurrentDatabaseMD5();
    const databaseCandidateToBeTheNewOneAsset = await Asset.loadAsync(require('../Assets/db/cpl-app.db'));
    const databaseCandidateToBeTheNewOneInfo = await FileSystem.getInfoAsync(databaseCandidateToBeTheNewOneAsset[0].localUri, { md5: true });
    const isNecessaryToUpdateTheDatabase = currentMD5 !== databaseCandidateToBeTheNewOneInfo.md5;
    Logger.Log(Logger.LogKeys.DatabaseManagerService, "UpdateDatabaseFile", `${isNecessaryToUpdateTheDatabase? "Deleting and copying" : "Not necessary to delete and copy"}`);
    if(isNecessaryToUpdateTheDatabase){
        // We delete all possible files just in case. It should only be one database
        await FileSystemService.DeleteFilesInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
        await FileSystemService.CopyFile(databaseCandidateToBeTheNewOneInfo.uri, `${FileSystem.documentDirectory}SQLite/${databaseCandidateToBeTheNewOneInfo.md5}.db`);
    }
}

async function GetCurrentDatabaseMD5(){
    let currentDatabaseMD5 = "";
    const listOfDatabaseFiles = await FileSystemService.GetFileUrisInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
    if(listOfDatabaseFiles.length > 0){
        // It should be just one database
        const currentDatabaseUri = listOfDatabaseFiles[0];
        const currentDatabaseInfo = await FileSystem.getInfoAsync(currentDatabaseUri, { md5: true });
        currentDatabaseMD5 = currentDatabaseInfo.md5;
    }
    Logger.Log(Logger.LogKeys.DatabaseManagerService, "GetCurrentDatabaseMD5", `currentDatabaseMD5: ${currentDatabaseMD5}`);
    return currentDatabaseMD5;
}

function _executeQuery(query){
    return new Promise((resolve, reject) => {
        CPLDataBase.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (SQLTransaction, SQLResultSet) => resolve(SQLResultSet),
                (SQLTransaction, SQLError) => {
                    Logger.LogError(Logger.LogKeys.DatabaseManagerService, "_executeQuery", "error in query (" + query + "): ", SQLError);
                    reject(SQLError);
                });
        });
    });
}