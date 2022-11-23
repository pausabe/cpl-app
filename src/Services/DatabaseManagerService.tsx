import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Logger from "../Utils/Logger";
import {Asset} from "expo-asset";
import {FileSystemService} from "./FileSystemService";
import {SQLResultSet} from "expo-sqlite";

let CPLDataBase = undefined;

export function executeQueryAsync(query) : Promise<SQLResultSet>{
    return new Promise((resolve, reject) =>
        executeQuery(
            query,
            (result) => resolve(result),
            (error) => reject(error)
        )
    );
}

async function executeQuery(query, callback, errorCallback) {
    if (CPLDataBase === undefined) {
        await OpenDatabase()
            .catch((error) => errorCallback && errorCallback(error));
    }
    _executeQuery(query)
        .then((result) => callback && callback(result))
        .catch((error) => errorCallback && errorCallback(error));
}

async function OpenDatabase() {
    await CreateDirectory();
    const databaseName = await UpdateDatabaseFile();

    if(!await DatabaseExists(databaseName)) {
        throw 'There is no database to open';
    }
    Logger.Log(Logger.LogKeys.DatabaseManagerService, "OpenDatabase", `Opening database '${databaseName}'`);
    CPLDataBase = SQLite.openDatabase(databaseName);
}

async function DatabaseExists(databaseName){
    return databaseName && (await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/' + databaseName)).exists;
}

async function CreateDirectory(){
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
}

async function UpdateDatabaseFile(){
    const currentDatabaseFileName = await GetCurrentDatabaseFileName();
    const databaseCandidateToBeTheNewOneAsset = (await Asset.loadAsync(require('../Assets/db/cpl-app.db')))[0];
    const candidateDatabaseFileName = DatabaseNameFromUri(databaseCandidateToBeTheNewOneAsset.localUri);
    const isNecessaryToUpdateTheDatabase = currentDatabaseFileName !== candidateDatabaseFileName;

    Logger.Log(Logger.LogKeys.DatabaseManagerService, "UpdateDatabaseFile", `currentName = '${currentDatabaseFileName}' vs candidateName = '${candidateDatabaseFileName}' => ${isNecessaryToUpdateTheDatabase? "We need to update" : "No necessary to update"}`);

    if(isNecessaryToUpdateTheDatabase){
        // We delete all possible files just in case. It should only be one database
        await FileSystemService.DeleteFilesInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
        await FileSystemService.CopyFile(databaseCandidateToBeTheNewOneAsset.localUri, `${FileSystem.documentDirectory}SQLite/${candidateDatabaseFileName}`);
        return candidateDatabaseFileName;
    }
    return currentDatabaseFileName;
}

async function GetCurrentDatabaseFileName(){
    let currentDatabaseFileName = "";
    const listOfDatabaseFiles = await FileSystemService.GetFileUrisInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
    if(listOfDatabaseFiles.length > 0){
        // It should be just one database
        const currentDatabaseUri = listOfDatabaseFiles[0];
        currentDatabaseFileName = DatabaseNameFromUri(currentDatabaseUri);
    }
    return currentDatabaseFileName;
}

function DatabaseNameFromUri(uri){
    if(!uri){
        return "";
    }
    return uri.split("/").pop();
}

function _executeQuery(query) : Promise<SQLResultSet>{
    return new Promise((resolve, reject) => {
        CPLDataBase.transaction((tx) => {
            tx.executeSql(
                query,
                [],
                (SQLTransaction, SQLResultSet) => resolve(SQLResultSet),
                (SQLTransaction, SQLError) => {
                    Logger.LogError(Logger.LogKeys.DatabaseManagerService, "_executeQuery", new Error("error in query (" + query + "): " + SQLError.message));
                    reject(SQLError);
                });
        });
    });
}