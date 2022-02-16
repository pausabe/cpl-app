import * as DatabaseManagerService from './DatabaseManagerService';
import * as Logger from '../Utils/Logger';
import  * as DatabaseDataService from './DatabaseDataService';

export async function UpdateDatabase(){
    const currentDatabaseVersion = await DatabaseDataService.getDatabaseVersion();
    Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "currentDatabaseVersion: " + currentDatabaseVersion);
    let json_updates = await GetUpdates(currentDatabaseVersion);
    await MakeChanges(json_updates);
    const databaseVersionAfter = await DatabaseDataService.getDatabaseVersion();
    Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "databaseVersionAfter: " + databaseVersionAfter);
    await FakeMissingUpdates(currentDatabaseVersion - databaseVersionAfter);
    return databaseVersionAfter;
}

function GetUpdates(currentDatabaseVersion) {
    if(currentDatabaseVersion !== undefined){
        const totalUpdates = require('../Assets/DatabaseUpdateScript/UpdateScript.json');
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "GetUpdates", "totalUpdates: " + totalUpdates.length);
        const necessaryUpdatesToExecute = totalUpdates.slice(currentDatabaseVersion)
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
            if(query !== ""){
                Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "query: " + query, undefined, 40);
                try {
                    await DatabaseManagerService.executeQueryAsync(query);
                }
                catch {
                    await FakeUpdate();
                }
            }
            else{
                Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "Empty query, we fake the update");
                await FakeUpdate();
            }
        }
    }
}

async function FakeMissingUpdates(missingUpdates) {
    if(missingUpdates > 0){
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "FakeMissingUpdates", missingUpdates + " missing updates. We fake them");
        for (let i = 0; i < missingUpdates; i++) {
            await FakeUpdate();
        }
    }
}

function GetQueryChange(change) {
    let query = "";
    const emptyValues = change.values === undefined || Object.entries(change.values).length === 0;
    if(emptyValues && (change.action === 1 || change.action === 2)){
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "GetQueryChange", "Values empty, we will fake the update");
    }
    switch (change.action) {
        case 1:
            if(!emptyValues){
                query = GetInsertQuery(change);
            }
            break;
        case 2:
            if(!emptyValues){
                query = GetUpdateQuery(change);
            }
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
            set_statement += key + " = '" + change.values[key].replace("'", "''") + "'"
            if(j < (Object.keys(change.values).length - 1))
                set_statement += ", "
            j += 1
        }
    }
    return "UPDATE " + change.table_name + " SET " + set_statement + " WHERE id = " + change.row_id;
}

function GetInsertQuery(change) {
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
        val_statement += ("'" + arr_aux[j].split(":")[1].replace("'", "''") + "'")
        if(j < (arr_aux.length - 1)){
            ref_statement += ", "
            val_statement += ", "
        }
    }
    return "INSERT INTO " + change.table_name + "(" + ref_statement + ") VALUES (" + val_statement + ")";
}

function GetDeleteQuery(change) {
    return "DELETE FROM " + change.table_name + " WHERE id = " + change.row_id;
}

async function FakeUpdate(){
    // This is necessary to update properly the updates count
    Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "FakeUpdate", "Faking update");
    await DatabaseManagerService.executeQueryAsync(GetFakeQuery());
}

function GetFakeQuery(){
    return "INSERT INTO _tables_log(table_name, row_id, action, date) VALUES('', 0, -1, date())";
}