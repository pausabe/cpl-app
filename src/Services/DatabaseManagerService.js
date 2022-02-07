import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Logger from "../Utils/Logger";
import StorageKeys from './StorageKeys';
import * as StorageService from './StorageService';
import {Platform} from "react-native";
import Constants from "expo-constants";
import {Asset} from "expo-asset";

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

async function openDatabase() {
    await createDirectory();
    await UpdateDatabaseFile();
    CPLDataBase = SQLite.openDatabase('cpl-app.db');
}

async function createDirectory(){
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
}

async function UpdateDatabaseFile(){
    const savedAppVersion = await GetSavedAppVersion();
    const actualAppVersion = GetActualAppVersion();

    Logger.Log(Logger.LogKeys.DatabaseManagerService, "UpdateDatabaseFile", `saved (${savedAppVersion}) vs actual (${actualAppVersion}) -> ${actualAppVersion > savedAppVersion? 'Deleting current database' : 'No need to delete'}`);

    if(actualAppVersion > savedAppVersion){
        await StorageService.StoreData(StorageKeys.CurrentAppVersion, actualAppVersion);
        await DeleteFile(FileSystem.documentDirectory + 'SQLite/cpl-app.db');
    }

    let thereIsADatabaseInPlace = (await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/cpl-app.db')).exists;
    Logger.Log(Logger.LogKeys.DatabaseManagerService, "UpdateDatabaseFile", thereIsADatabaseInPlace? "There is a Database -> no need to place" : "No database -> we need to place");
    if (!thereIsADatabaseInPlace){
        await PlaceDatabase(FileSystem.documentDirectory + 'SQLite/cpl-app.db');
    }
}

async function GetSavedAppVersion(){
    const neverSavedValue = -1;
    let savedAppVersion = await StorageService.GetData(StorageKeys.CurrentAppVersion, neverSavedValue);
    if(savedAppVersion === neverSavedValue){
        Logger.Log(Logger.LogKeys.DatabaseManagerService, "GetSavedAppVersion",  "Value never saved before");
        savedAppVersion = GetActualAppVersion();
        await StorageService.StoreData(StorageKeys.CurrentAppVersion, savedAppVersion);
    }
    return parseInt(savedAppVersion);
}

async function DeleteFile(filePath) {
    if((await FileSystem.getInfoAsync(filePath)).exists){
        await FileSystem.deleteAsync(filePath);
    }
}

function GetActualAppVersion() {
    return parseInt(Platform.OS === "ios"? Constants.manifest.ios.buildNumber : Constants.manifest.android.versionCode);
}

async function PlaceDatabase(databaseFilePath){
    const databaseAsset = await Asset.loadAsync(require('../Assets/db/cpl-app.db'));
    const databaseAssetPath = databaseAsset[0].localUri;
    await FileSystem.copyAsync({from: databaseAssetPath, to: databaseFilePath});
}

function _executeQuery(query){
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