import { CPLDataBase } from './DatabaseOpenerService';
import * as Logger from '../Utils/Logger';

export function UpdateDatabase(currentDatabaseVersion){
    return new Promise((resolve) => {
        if(currentDatabaseVersion === undefined){
            resolve();
        }
        else{
            GetUpdates(currentDatabaseVersion).then((json_updates) => {
                if (json_updates === undefined || json_updates === "") {
                    resolve();
                }
                else{
                    resolve();
                    // TODO: refactor
                    /*MakeChanges(json_updates).then(() => {
                        resolve();
                    })
                    .catch((error) => {
                        Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "1", error);
                        resolve()
                    });*/
                }
            })
            .catch((error) => {
                Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "2", error);
                resolve()
            });
        }
    });
}

function GetUpdates(currentDatabaseVersion) {
    return new Promise((resolve) => {
        // Refresh the script from expo OTA updates
        //Asset.fromModule(require('../Assets/DatabaseUpdateScript/UpdateScript.json'));

        // Get the data from the file
        const dataJson = require('../Assets/DatabaseUpdateScript/UpdateScript.json');

        // Get only the new (diff between database version and updates count)
        const scriptsVersion = dataJson.length;
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "scriptsVersion = " + scriptsVersion);
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "UpdateDatabase", "currentDatabaseVersion = " + currentDatabaseVersion);

        // TODO:

        resolve(dataJson);
    });
}
  
function MakeChanges(json_updates){
    return new Promise((resolve, reject) => {
        let promises = [];
        let sql;
        for (let i = 0; i < json_updates.length; i++) {
            const change = json_updates[i];
            let j = 0;
            switch (change.action) {
                //UPDATE
                case 2:
                    Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "UPDATE");
                    let set_statement = "";
                    for (const key in change.values) {
                        if (change.values.hasOwnProperty(key)) {
                            set_statement += key + " = '" + change.values[key] + "'"
                            if(j < (Object.keys(change.values).length - 1))
                                set_statement += ", "
                            j += 1
                        }
                    } 
                    // UPDATE diversos SET 0 = '[object Object]' WHERE id = 1
                    sql = "UPDATE " + change.table_name + " SET " + set_statement + " WHERE id = " + change.row_id;
                    promises.push(ExecuteQuery(sql))
                break;

                //INSERT
                case 1:
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
                    sql = "INSERT INTO " + change.name + "(" + ref_statement + ") VALUES (" + val_statement + ")";
                    promises.push(ExecuteQuery(sql))
                break;
                    
                //DELETE
                case 3:
                    sql =  "DELETE FROM " + change.table_name + " WHERE id = " + change.row_id;
                    promises.push(ExecuteQuery(sql))
                break;
            }
        }
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "promises.length = " + promises.length);
        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "json_updates.length = " + json_updates.length);

        if(promises.length !== json_updates.length) {
            resolve(false);
        }
        else{
            Promise.all(promises).then(res => {
                if(res === undefined){
                    reject(new Error("Something is not right"));
                }
                else{
                    let total_res = true;
                    for (let i = 0; i < res.length; i++) {
                        Logger.Log(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "promise " + i + " result:", res[i]);
                        if (!res[i]){
                            total_res = false;
                        }
                    }
                    resolve(total_res)
                }
            })
            .catch((error) => {
                Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "MakeChanges", "", error);
                resolve(false);
            });
        }
    });
}

function ExecuteQuery(query) {
    return new Promise((resolve) => {
        try {
            CPLDataBase.transaction((tx) => {
                tx.executeSql(query, [], () => {
                    resolve(true)
                }, (SQLTransaction, SQLError) => {
                    Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "ExecuteQuery","error in query (" + query + ")", SQLError);
                    resolve(false)
                });
            });
        } 
        catch (error) {
            Logger.LogError(Logger.LogKeys.DatabaseUpdaterService, "ExecuteQuery", "", error);
        }
    });
}