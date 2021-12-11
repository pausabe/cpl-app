
import { CPLDataBase } from './DatabaseOpenerService.js';

//Resolves true if online_updates = false or it its true and all updates went ok
export function UpdateDatabase(currentDatabaseVersion){
    let promise = new Promise((resolve) => {

        if(G_VALUES.databaseVersion == undefined){
            resolve(false);
        }
        else{

            //Get json with changes
            GetOnlineChanges(G_VALUES.databaseVersion).then((json_updates) => {

            //Check json
            if (json_updates == undefined || json_updates == "") throw "Internet error"

            //Ask DB_Access to make the changes (if there where any)
            GLOBAL.DBAccess.MakeChanges(json_updates).then((someChangedDoneCorrectly) => {

                //Check result
                if(someChangedDoneCorrectly){
                    resolve(true);
                }
                else{
                    resolve(false)
                }
            })
            .catch((error) => {
                console.log("[EXCEPTION Check_For_Updates] 1", error);
                resolve(false)
            });
            })
            .catch((error) => {
                console.log("[EXCEPTION Check_For_Updates] 2", error);
                resolve(false)
            });

        }
    });
    return promise
}

function GetOnlineChanges(version) {
  
    console.log("[ONLINE_UPDATES GetOnlineChanges] version: ", version);
  
    var url = GLOBAL.server_url + version;
    console.log("[ONLINE_UPDATES GetOnlineChanges] url: ", url);
  
    return timeout(
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
    );
  }
  
  function timeout(ms, promise) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('TIMEOUT'))
      }, ms)
  
      promise
        .then(value => {
          clearTimeout(timer)
          resolve(value)
        })
        .catch(reason => {
          clearTimeout(timer)
          reject(reason)
        })
    })
  }