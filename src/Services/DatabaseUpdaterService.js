import { CPLDataBase } from './DatabaseOpenerService';
import * as Logger from '../Utils/Logger';
import GLOBAL from "../Globals/Globals";
import dataJson from "../Assets/DatabaseUpdateScript/UpdateScript.json";

export async function UpdateDatabase(){
    try {
        const currentDatabaseVersion = await GLOBAL.DBAccess.getDatabaseVersion();
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "currentDatabaseVersion: " + currentDatabaseVersion);
        let json_updates = await GetUpdates(currentDatabaseVersion);
        await MakeChanges(json_updates);
        const databaseVersionAfter = await GLOBAL.DBAccess.getDatabaseVersion();
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "databaseVersionAfter: " + databaseVersionAfter);
    }catch (error){
        Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "", error);
    }
}

function GetUpdates(currentDatabaseVersion) {
    if(currentDatabaseVersion !== undefined){
        // Refresh the script from expo OTA updates
        //TODO: Asset.fromModule(require('../Assets/DatabaseUpdateScript/UpdateScript.json'));

        const totalUpdates = require('../Assets/DatabaseUpdateScript/UpdateScript.json');
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "GetUpdates", "totalUpdates: " + totalUpdates.length);
        const necessaryUpdatesToExecute = dataJson.slice(currentDatabaseVersion)
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "GetUpdates", "necessaryUpdatesToExecute: " + necessaryUpdatesToExecute.length);
        return necessaryUpdatesToExecute;
    }
    return "";
}

async function MakeChanges(changes){
    if (changes !== undefined) {
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const query = GetQueryChange(change);
            Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "query: " + query, undefined, 20);
            const executionResult = await ExecuteQuery(query);
            if(!executionResult){
                await FakeUpdate();
            }
        }
    }
}

function GetQueryChange(change) {
    let query = "";
    switch (change.action) {
        case 1:
            query = GetInsertUpdate(change);
            break;
        case 2:
            query = GetUpdateQuery(change);
            break;
        case 3:
            query = GetDeleteQuery(change);
            break;
    }
    return query;
}

function GetUpdateQuery(change) {
    let j = 0;
    let set_statement = "";
    for (const key in change.values) {
        if (change.values.hasOwnProperty(key)) {
            set_statement += key + " = '" + change.values[key] + "'"
            if(j < (Object.keys(change.values).length - 1))
                set_statement += ", "
            j += 1
        }
    }
    return "UPDATE " + change.table_name + " SET " + set_statement + " WHERE id = " + change.row_id;
}

function GetInsertUpdate(change) {
    let j = 0;
    let aux = JSON.stringify(change.values);
    aux = aux.replace(/{/g, "")
    aux = aux.replace(/}/g, "")
    aux = aux.replace(/"/g, "")
    const arr_aux = aux.split(",");
    let ref_statement = "";
    let val_statement = "";
    for (j = 0; j < arr_aux.length; j++){
        ref_statement += arr_aux[j].split(":")[0]
        val_statement += ("'" + arr_aux[j].split(":")[1] + "'")
        if(j < (arr_aux.length - 1)){
            ref_statement += ", "
            val_statement += ", "
        }
    }
    return "INSERT INTO " + change.name + "(" + ref_statement + ") VALUES (" + val_statement + ")";
}

function GetDeleteQuery(change) {
    return "DELETE FROM " + change.table_name + " WHERE id = " + change.row_id;
}

async function FakeUpdate(){
    // This is necessary to update properly the updates count
    const query = "INSERT INTO _tables_log(table_name, row_id, action, date) VALUES('', 0, -1, date())";
    await ExecuteQuery(query);
}

function ExecuteQuery(query) {
    return new Promise((resolve) => {
        if(CPLDataBase === undefined){
            resolve(false);
        }
        else{
            CPLDataBase.transaction((tx) => {
                tx.executeSql(query, [], () => {
                    resolve(true)
                }, (SQLTransaction, SQLError) => {
                    Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "ExecuteQuery","error in query (" + query + ")", SQLError);
                    resolve(false)
                });
            });
        }
    });
}