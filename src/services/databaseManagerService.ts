import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import * as Logger from '../utils/logger';
import { Asset } from 'expo-asset';
import { FileSystemService } from './FileSystemService';

let CPLDataBase = undefined;

export async function openDatabase(databaseAsset: Asset) {
  await createDirectory();
  const databaseName = await updateDatabaseFile(databaseAsset);

  if (!(await databaseExists(databaseName))) {
    throw 'There is no database to open';
  }
  Logger.log(Logger.LogKeys.DatabaseManagerService, 'openDatabase', `Opening database '${databaseName}'`);
  CPLDataBase = await SQLite.openDatabaseAsync(databaseName);
}

export function executeQueryAsync(query): Promise<any> {
  return new Promise((resolve, reject) =>
    executeQuery(
      query,
      (result) => resolve(result),
      (error) => reject(error),
    ),
  );
}

async function executeQuery(query, callback, errorCallback) {
  if (CPLDataBase === undefined) {
    throw new Error('You must call openDatabase function to execute queries');
  }

  try {
    const result = await _executeQuery(query);
    callback && callback(result);
  } catch (error) {
    errorCallback && errorCallback(error);
  }
}

async function databaseExists(databaseName) {
  return (
    databaseName && (await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/' + databaseName)).exists
  );
}

async function createDirectory() {
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite/')).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
}

async function updateDatabaseFile(databaseCandidateToBeTheNewOneAsset: Asset) {
  const currentDatabaseFileName = await getCurrentDatabaseFileName();
  const candidateDatabaseFileName = databaseCandidateToBeTheNewOneAsset
    ? databaseNameFromUri(databaseCandidateToBeTheNewOneAsset.localUri)
    : '';
  const isNecessaryToUpdateTheDatabase =
    candidateDatabaseFileName !== '' && currentDatabaseFileName !== candidateDatabaseFileName;

  Logger.log(
    Logger.LogKeys.DatabaseManagerService,
    'updateDatabaseFile',
    `currentName = '${currentDatabaseFileName}' vs candidateName = '${candidateDatabaseFileName}' => ${isNecessaryToUpdateTheDatabase ? 'We need to update' : 'No necessary to update'}`,
  );

  if (isNecessaryToUpdateTheDatabase) {
    // We delete all possible files just in case. It should only be one database
    await FileSystemService.deleteFilesInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
    await FileSystemService.copyFile(
      databaseCandidateToBeTheNewOneAsset.localUri,
      `${FileSystem.documentDirectory}SQLite/${candidateDatabaseFileName}`,
    );
    return candidateDatabaseFileName;
  }
  return currentDatabaseFileName;
}

async function getCurrentDatabaseFileName() {
  let currentDatabaseFileName = '';
  const listOfDatabaseFiles = await FileSystemService.getFileUrisInDirectory(
    `${FileSystem.documentDirectory}SQLite/`,
    'db',
  );
  if (listOfDatabaseFiles.length > 0) {
    // It should be just one database
    const currentDatabaseUri = listOfDatabaseFiles[0];
    currentDatabaseFileName = databaseNameFromUri(currentDatabaseUri);
  }
  return currentDatabaseFileName;
}

function databaseNameFromUri(uri) {
  if (!uri) {
    return '';
  }
  return uri.split('/').pop();
}

async function _executeQuery(query: string): Promise<any> {
  try {
    return await CPLDataBase.getAllAsync(query);
  } catch (error) {
    Logger.logError(
      Logger.LogKeys.DatabaseManagerService,
      '_executeQuery',
      new Error(`Error in query (${query}): ${error.message}`),
    );
    throw error;
  }
}
