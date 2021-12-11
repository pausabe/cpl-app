
import { CPLDataBase } from './DatabaseOpenerService';
import { Timeout } from '../Utils/Timeout'

//Resolves true when all changes went ok or false otherwise
export function UpdateDatabase(currentDatabaseVersion){
    return new Promise((resolve) => {
        if(currentDatabaseVersion == undefined){
            resolve();
        }
        else{
            GetOnlineChanges(currentDatabaseVersion).then((json_updates) => {
                if (json_updates == undefined || json_updates == "") {
                    resolve();
                }
                else{
                    MakeChanges(json_updates).then((someChangedDoneCorrectly) => {
                        resolve(someChangedDoneCorrectly);
                    })
                    .catch((error) => {
                        console.log("[EXCEPTION Check_For_Updates] 1", error);
                        resolve()
                    });
                }
            })
            .catch((error) => {
                console.log("[EXCEPTION Check_For_Updates] 2", error);
                resolve()
            });
        }
    });
}

function GetOnlineChanges(version) {
    // TODO: rethink
    return "";
    /*var url = GLOBAL.server_url + version;
    return Timeout(
        2000,
        fetch(url, { headers: { 'Cache-Control': 'no-cache' } } )
        .then((response) => response.json())
        .then((responseJson) => {
            console.log("[EXCEPTION GetOnlineChanges] Correct fetch");
            return responseJson;
        })
        .catch((error) => {
            console.log("[EXCEPTION GetOnlineChanges] Fetch error:", error);
        })
    );*/
}
  
function MakeChanges(json_updates){
    return new Promise((resolve, reject) => {
        let promises = [];
        let sql;
        for (var i = 0; i < json_updates.length; i++) {
            var change = json_updates[i]
            switch (change.action) {
                //UPDATE
                case "2":
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
                case "1":
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
                case "3":
                    sql =  "DELETE FROM " + change.table_name + " WHERE id = " + change.row_id;
                    promises.push(ExecuteQuery(sql))
                break;
            }
        }
        console.log("[ONLINE_UPDATES MakeChanges] promises.length: ", promises.length);
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
                        console.log("[ONLINE_UPDATES MakeChanges] promise " + i + " result:", res[i]);
                        if (!res[i]){
                            total_res = false;
                        }
                    }
                    resolve(total_res)
                }
            })
            .catch((error) => {
                console.log("[EXCEPTION ONLINE_UPDATES MakeChanges]", error);
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
                    console.log("[ONLINE_UPDATES ExecuteQuery] error in query (" + query + "): ", SQLError);
                    resolve(false)
                });
            });
        } 
        catch (error) {
            console.log("[ONLINE_UPDATES ExecuteQuery] error: ", error);
        }
    });
}