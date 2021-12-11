import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

export var CPLDataBase = undefined;

export function OpenDatabaseIfNotOpenedYet(){
  return new Promise((resolve) => {
      if(CPLDataBase == undefined){
        openDatabase(FileSystem.documentDirectory + "SQLite/cpl-app.db")
        .then((database) => {
            CPLDataBase = database;
            resolve();
        });
      }
      else{
        resolve();
      }
  });
}

async function openDatabase(filesystemDatabasePath) {
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
  await FileSystem.downloadAsync(
    Asset.fromModule(require('../Assets/db/cpl-app.db')).uri,
    filesystemDatabasePath
  );
  return SQLite.openDatabase('cpl-app.db');
}


        /*if(CPLDataBase == undefined){

            console.log("[DB-MANAGEMENT] FileSystem directory: " + FileSystem.documentDirectory);
            var filesystemDatabasePath = FileSystem.documentDirectory + "SQLite/cpl-app.db";
            DeleteDatabaseIfExists(filesystemDatabasePath).then(() => {
                openDatabase(filesystemDatabasePath)
                .then((database) => {
                    console.log("openDatabase 4", database);
                    CPLDataBase = database;
                    resolve();
                });
            });*/

            // Pre-load the database.
            // This only will be downloading the database from the cloud
            // if it's a new publication. Otherwise, returns the local cache path.
            /*Asset.loadAsync(require('../Assets/db/cpl-app.db'))
                .then((localUri) => {

                console.log("[DB-MANAGEMENT] DB downloaded", localUri[0].downloaded); // True/False
                console.log("[DB-MANAGEMENT] DB localUri", localUri[0].localUri); // Mobile folder for cache assets

                // Save the cached database into FileSystem/SQLite path
                // in order to be able to execute: SQLite.openDatabase("cpl-app.db") (openDatabase uses FileSystem.documentDirectory/SQLite path)
                // 
                // If it's not the first time opening the app and there is already a database
                // in the FileSystem/SQLite folder, we replace it to set the latest DB into FileSystem folder
                SaveOrReplaceFileSystemDatabase(localUri[0].localUri, FileSystem.documentDirectory + "SQLite/cpl-app.db")
                    .then((result) => {
                        console.log("[DB-MANAGEMENT] SaveOrReplaceFileSystemDatabase Result: ", result);
                        if(result == "OK"){
                            // TODO: delete cache? all the other cached DBs (all but localUri[0].localUri). Cache folder has to be getting bigger every update...
                            console.log("[DB-MANAGEMENT] Having a correct result we can open the database.");
                            CPLDataBase = SQLite.openDatabase("cpl-app.db");
                            resolve();
                        }
                        else{
                            resolve();
                        }
                    });
                })
                .catch((error) => {
                    console.log("[DB-MANAGEMENT] Error loading Asset: ", error);
                    resolve();
            });*/
        /*}
        else{
            resolve();
        }*/

/*function SaveOrReplaceFileSystemDatabase(fromPath, toPath){
    return new Promise((resolve) => {
      DeleteDatabaseIfExists(toPath)
        .then(() => {

          console.log("[DB-MANAGEMENT] fromPath: ", fromPath);
          console.log("[DB-MANAGEMENT] toPath: ", toPath);

          CreateSQLiteDirectoryIfNecessary(toPath)
            .then(() => {
              FileSystem.copyAsync({from: fromPath, to: toPath})
              .then(() => {
                console.log('[DB-MANAGEMENT] Finished copying correctly')
                resolve("OK");
              })
              .catch(error => {
                console.log("[DB-MANAGEMENT] Error copying the database: ", error);
                resolve("FROM: " + fromPath + " | TO: " + toPath + " | Error: " + error.toString());
              })
            });
        });
    });
  }*/

  /*function DeleteDatabaseIfExists(filePath){
    return new Promise((resolve) => {
      FileSystem.getInfoAsync(filePath)
        .then((directoryInfo) => {
          if(directoryInfo.exists){
            console.log("[DB-MANAGEMENT] There is already a database in the path. We must delete the current database located in: " + filePath);
            FileSystem.deleteAsync(filePath, {intermediates: true})
              .then( () => {
                console.log("[DB-MANAGEMENT] Delete finished.");
                resolve();
              })
              .catch((error) => {
                console.log("[DB-MANAGEMENT deleteAsync error]", error);
                resolve()
              });
          }
          else{
            console.log("[DB-MANAGEMENT] There is no database in the path. No delete necessary.");
            resolve();
          }
        });
    });
  }*/

  /*function CreateSQLiteDirectoryIfNecessary(filePath){

    var lastIndex = filePath.lastIndexOf("/");
    var directoryPath = filePath.substring(0, lastIndex + 1);
    console.log("[DB-MANAGEMENT] directoryPath", directoryPath);

    return new Promise((resolve) => {
      FileSystem.getInfoAsync(directoryPath)
        .then((directoryInfo) => {

          if(directoryInfo.exists){
            console.log("[DB-MANAGEMENT] SQLite directory already exist. Not necessary to make a new one.");
            resolve();
          }
          else{
            console.log("[DB-MANAGEMENT] SQLite directory not exist. We neet to make a new one.");
            FileSystem.makeDirectoryAsync(directoryPath, {intermediates: true})
              .then(() => {
                console.log("[DB-MANAGEMENT] Directory maker finished.");
                resolve();
              })
              .catch((error) => {
                console.log("[DB-MANAGEMENT makeDirectoryAsync error]", error);
                resolve()
              });
          }
          
        });
    });
  }*/