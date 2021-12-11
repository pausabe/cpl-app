import { Asset } from 'expo-asset';
import { CPLDataBase } from './DatabaseOpenerService';

const vervoseDatabaseUpdater = true;

export function UpdateDatabase(currentDatabaseVersion){
    return new Promise((resolve) => {
        if(currentDatabaseVersion == undefined){
            resolve();
        }
        else{
            GetUpdates(currentDatabaseVersion).then((json_updates) => {
                if (json_updates == undefined || json_updates == "") {
                    resolve();
                }
                else{
                    MakeChanges(json_updates).then(() => {
                        resolve();
                    })
                    .catch((error) => {
                        LogError("1", "UpdateDatabase", error);
                        resolve()
                    });
                }
            })
            .catch((error) => {
                LogError("2", "UpdateDatabase", error);
                resolve()
            });
        }
    });
}

function GetUpdates(currentDatabaseVersion) {
    return new Promise((resolve, reject) => {
        // Refresh the script from expo OTA updates
        //Asset.fromModule(require('../Assets/DatabaseUpdateScript/UpdateScript.json'));

        // Get the data from the file
        var dataJson = require('../Assets/DatabaseUpdateScript/UpdateScript.json');

        // Get only the new (diff between database version and updates count)
        var scriptsVersion = dataJson.length;
        Log("scriptsVersion = " + scriptsVersion, "UpdateDatabase");
        Log("currentDatabaseVersion = " + currentDatabaseVersion, "UpdateDatabase");
        // TODO:

        resolve(dataJson);
    });
}
  
function MakeChanges(json_updates){
    return new Promise((resolve, reject) => {
        let promises = [];
        let sql;
        for (var i = 0; i < json_updates.length; i++) {
            var change = json_updates[i]
            //Log("change = ", "MakeChanges", change);
            switch (change.action) {
                //UPDATE
                case 2:
                    Log("UPDATE", "MakeChanges");
                    var set_statement = ""
                    var j = 0
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
                    var aux = JSON.stringify(change.values)
                    aux = aux.replace(/{/g, "")
                    aux = aux.replace(/}/g, "")
                    aux = aux.replace(/\"/g, "")
                    var arr_aux = aux.split(",")
                    var ref_statement = ""
                    var val_statement = ""
                    for (var j = 0; j < arr_aux.length; j++){
                        ref_statement += arr_aux[j].split(":")[0] 
                        val_statement += ("'" + arr_aux[j].split(":")[1] + "'")
                        if(j < (arr_aux.length - 1)){
                            ref_statement += ", "
                            val_statement += ", "
                        }
                    }
                    sql = "INSERT INTO " + change_name + "(" + ref_statement + ") VALUES (" + val_statement + ")";
                    promises.push(ExecuteQuery(sql))
                break;
                    
                //DELETE
                case 3:
                    sql =  "DELETE FROM " + change.table_name + " WHERE id = " + change.row_id;
                    promises.push(ExecuteQuery(sql))
                break;
            }
        }
        Log("promises.length = " + promises.length, "MakeChanges");
        Log("json_updates.length = " + json_updates.length, "MakeChanges");
        if(promises.length != json_updates.length) {
            resolve(false);
        }
        else{
            Promise.all(promises).then(res => {
                if(res == undefined){
                    reject(new Error("Something is not right"));
                }
                else{
                    let total_res = true;
                    for (var i = 0; i < res.length; i++) {
                        Log("promise " + i + " result:", "MakeChanges", res[i]);
                        if (!res[i]){
                            total_res = false;
                        }
                    }
                    resolve(total_res)
                }
            })
            .catch((error) => {
                LogError(error, "MakeChanges");
                resolve(false);
            });
        }
    });
}

function ExecuteQuery(query) {
    return new Promise((resolve) => {
        try {
            CPLDataBase.transaction((tx) => {
                tx.executeSql(query, [], (SQLTransaction, SQLResultSet) => {
                    resolve(true)
                }, (SQLTransaction, SQLError) => {
                    LogError("error in query (" + query + ")", "ExecuteQuery", SQLError);
                    resolve(false)
                });
            });
        } 
        catch (error) {
            LogError(error, "ExecuteQuery");
        }
    });
}

function Log(text, function_name, parameter){
    if(vervoseDatabaseUpdater){
        logText = "[DatebaseUpdaterService " + function_name + "] " + text;
        if(parameter == undefined){
            console.log(logText);
        }
        else{
            console.log(logText, parameter);
        }
    }
}

function LogError(text, function_name, parameter){
    logText = "[DatebaseUpdaterService " + function_name + "] ERROR: " + text;
        if(parameter == undefined){
            console.log(logText);
        }
        else{
            console.log(logText, parameter);
        }
}