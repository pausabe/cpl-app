import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Logger from "../Utils/Logger";
import {Asset} from "expo-asset";
import {FileSystemService} from "./FileSystemService";

let CPLDataBase = undefined;

export async function OpenDatabase(databaseAsset: Asset) {
    await CreateDirectory();
    const databaseName = await UpdateDatabaseFile(databaseAsset);

    if (!await DatabaseExists(databaseName)) {
        throw 'There is no database to open';
    }
    Logger.Log(Logger.LogKeys.DatabaseManagerService, "OpenDatabase", `Opening database '${databaseName}'`);
    CPLDataBase = await SQLite.openDatabaseAsync(databaseName);
}

export function executeQueryAsync(query): Promise<any> {
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
        throw new Error("You must call OpenDatabase function to execute queries")
    }

    try {
        const result = await _executeQuery(query);
        callback && callback(result);
    }
    catch (error) {
        errorCallback && errorCallback(error);
    }
}

async function DatabaseExists(databaseName) {
    return databaseName && (await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/' + databaseName)).exists;
}

async function CreateDirectory() {
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
}

async function UpdateDatabaseFile(databaseCandidateToBeTheNewOneAsset: Asset) {
    const currentDatabaseFileName = await GetCurrentDatabaseFileName();
    const candidateDatabaseFileName = databaseCandidateToBeTheNewOneAsset? DatabaseNameFromUri(databaseCandidateToBeTheNewOneAsset.localUri) : '';
    const isNecessaryToUpdateTheDatabase = candidateDatabaseFileName !== '' && currentDatabaseFileName !== candidateDatabaseFileName;

    Logger.Log(Logger.LogKeys.DatabaseManagerService, "UpdateDatabaseFile", `currentName = '${currentDatabaseFileName}' vs candidateName = '${candidateDatabaseFileName}' => ${isNecessaryToUpdateTheDatabase ? "We need to update" : "No necessary to update"}`);

    if (isNecessaryToUpdateTheDatabase) {
        // We delete all possible files just in case. It should only be one database
        await FileSystemService.DeleteFilesInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
        await FileSystemService.CopyFile(databaseCandidateToBeTheNewOneAsset.localUri, `${FileSystem.documentDirectory}SQLite/${candidateDatabaseFileName}`);
        return candidateDatabaseFileName;
    }
    return currentDatabaseFileName;
}

async function GetCurrentDatabaseFileName() {
    let currentDatabaseFileName = "";
    const listOfDatabaseFiles = await FileSystemService.GetFileUrisInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
    if (listOfDatabaseFiles.length > 0) {
        // It should be just one database
        const currentDatabaseUri = listOfDatabaseFiles[0];
        currentDatabaseFileName = DatabaseNameFromUri(currentDatabaseUri);
    }
    return currentDatabaseFileName;
}

function DatabaseNameFromUri(uri) {
    if (!uri) {
        return "";
    }
    return uri.split("/").pop();
}

async function _executeQuery(query: string): Promise<any> {
    try {
        return await CPLDataBase.getAllAsync(query);
    } catch (error) {
        Logger.LogError(Logger.LogKeys.DatabaseManagerService, "_executeQuery", new Error(`Error in query (${query}): ${error.message}`));
        throw error;
    }
}
