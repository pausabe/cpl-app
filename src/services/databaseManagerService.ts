import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import * as Logger from '../utils/logger';
import { Asset } from 'expo-asset';
import { FileSystemService } from './FileSystemService';
import bundledDatabase from '../assets/db/cpl-app.db.json';

let CPLDataBase = undefined;

export const DATABASE_DIRECTORY = `${FileSystem.documentDirectory}SQLite/`;

// Every database says what it is in its own name: cpl-<compatibility>-v<version>.db. The
// compatibility key is the one the publishing website stamps inside it, so a database made for
// another version of the app is never opened here. The phone keeps exactly one: on opening, the
// newest one this app can read stays and the rest go.
export function databaseFileName(compat: string, version: number): string {
  return `cpl-${compat}-v${version}.db`;
}

function parseDatabaseFileName(fileName: string): { compat: string; version: number } | null {
  const parts = /^cpl-(s\d+-[0-9a-f]+)-v(\d+)\.db$/.exec(fileName);
  return parts ? { compat: parts[1], version: Number(parts[2]) } : null;
}

// Which publication the app is really praying with: the one it has opened. It is not always the
// newest one the phone has, because a database downloaded today is not opened until the app opens
// again, and that is what the technical data of Configuració has to say.
let openedVersion: number | null = null;

export function openedDatabaseVersion(): number | null {
  return openedVersion;
}

export function bundledDatabaseInformation(): { compat: string; version: number; md5: string } {
  return bundledDatabase;
}

// The database the app would use right now, without opening it: the newest downloaded one it can
// read, or the one that ships inside the app. The updater asks for it before downloading anything.
export async function currentDatabaseVersion(): Promise<number> {
  const downloaded = await usableDownloadedDatabases();
  return Math.max(bundledDatabase.version, downloaded[0]?.version ?? 0);
}

export async function openDatabase(databaseAsset: Asset) {
  await createDirectory();
  const databaseName = await chooseDatabase(databaseAsset);

  if (!(await databaseExists(databaseName))) {
    throw 'There is no database to open';
  }
  Logger.log(Logger.LogKeys.DatabaseManagerService, 'openDatabase', `Opening database '${databaseName}'`);
  try {
    CPLDataBase = await SQLite.openDatabaseAsync(databaseName);
    openedVersion = parseDatabaseFileName(databaseName)?.version ?? null;
  } catch (error) {
    CPLDataBase = await openBundledAfterFailure(databaseAsset, databaseName, error);
    openedVersion = bundledDatabase.version;
  }
}

// A downloaded database that does not open would leave the app with no liturgy at all, so it is
// thrown away and the one inside the app takes over. The next check downloads it again.
async function openBundledAfterFailure(databaseAsset: Asset, failedName: string, error: unknown) {
  const bundledName = databaseFileName(bundledDatabase.compat, bundledDatabase.version);
  if (failedName === bundledName) {
    throw error;
  }
  Logger.logError(Logger.LogKeys.DatabaseManagerService, 'openDatabase', error as Error);
  await FileSystem.deleteAsync(`${DATABASE_DIRECTORY}${failedName}`, { idempotent: true });
  await placeBundledDatabase(databaseAsset, bundledName);
  return SQLite.openDatabaseAsync(bundledName);
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
  return databaseName && (await FileSystem.getInfoAsync(`${DATABASE_DIRECTORY}${databaseName}`)).exists;
}

async function createDirectory() {
  if (!(await FileSystem.getInfoAsync(DATABASE_DIRECTORY)).exists) {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`);
  }
}

// Downloaded databases this app can read, newest first
async function usableDownloadedDatabases(): Promise<{ name: string; version: number }[]> {
  const fileUris = await FileSystemService.getFileUrisInDirectory(DATABASE_DIRECTORY, 'db');
  return fileUris
    .map((uri) => {
      const name = databaseNameFromUri(uri);
      return { name, parsed: parseDatabaseFileName(name) };
    })
    .filter(({ parsed }) => parsed !== null && parsed.compat === bundledDatabase.compat)
    .map(({ name, parsed }) => ({ name, version: parsed.version }))
    .sort((one, other) => other.version - one.version);
}

async function chooseDatabase(databaseAsset: Asset): Promise<string> {
  const downloaded = await usableDownloadedDatabases();
  const newest = downloaded[0];
  const bundledName = databaseFileName(bundledDatabase.compat, bundledDatabase.version);

  let chosenName = bundledName;
  if (newest && newest.version > bundledDatabase.version) {
    chosenName = newest.name;
  } else {
    await placeBundledDatabase(databaseAsset, bundledName);
  }

  // Which versions were there to choose from, not how many: a count next to a version number
  // reads as another version number, and then the line says something it does not mean
  const found = downloaded.length > 0 ? downloaded.map(({ version }) => `v${version}`).join(', ') : 'none';
  Logger.log(
    Logger.LogKeys.DatabaseManagerService,
    'chooseDatabase',
    `Using '${chosenName}' (inside the app: v${bundledDatabase.version}, downloaded: ${found})`,
  );
  await deleteEveryDatabaseBut(chosenName);
  return chosenName;
}

async function placeBundledDatabase(databaseAsset: Asset, bundledName: string) {
  if (await databaseExists(bundledName)) {
    return;
  }
  await FileSystemService.copyFile(databaseAsset?.localUri, `${DATABASE_DIRECTORY}${bundledName}`);
}

// Only the database in use is kept: each one takes 16 MB
async function deleteEveryDatabaseBut(databaseName: string) {
  const fileUris = await FileSystemService.getFileUrisInDirectory(DATABASE_DIRECTORY, 'db');
  for (const fileUri of fileUris) {
    if (databaseNameFromUri(fileUri) !== databaseName) {
      Logger.log(Logger.LogKeys.DatabaseManagerService, 'deleteEveryDatabaseBut', `Deleting '${fileUri}'`);
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  }
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
