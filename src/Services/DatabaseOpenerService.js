import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

export var CPLDataBase = undefined;

export function OpenDatabase(){
  return new Promise((resolve) => {
      if(CPLDataBase === undefined){
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
  return SQLite.openDatabase('cpl-app.db');
}