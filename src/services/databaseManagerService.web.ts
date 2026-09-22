import * as SQLite from 'expo-sqlite';
import * as Logger from '../utils/logger';
import { Asset } from 'expo-asset';

// Web version of DatabaseManagerService: there is no file system to copy the
// database into, so we download the asset and open it as an in-memory database.
let CPLDataBase = undefined;

export async function openDatabase(databaseAsset: Asset) {
  Logger.log(
    Logger.LogKeys.DatabaseManagerService,
    'openDatabase',
    `Opening database '${databaseAsset.uri}' in memory`,
  );
  const response = await fetch(databaseAsset.uri);
  const databaseBytes = new Uint8Array(await response.arrayBuffer());
  CPLDataBase = await SQLite.deserializeDatabaseAsync(databaseBytes);
}

export async function executeQueryAsync(query: string): Promise<any> {
  if (CPLDataBase === undefined) {
    throw new Error('You must call openDatabase function to execute queries');
  }

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
