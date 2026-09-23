import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import * as Logger from '../utils/logger';
import * as StorageService from './storage/storageService';
import StorageKeys from './storage/storageKeys';
import {
  DATABASE_DIRECTORY,
  bundledDatabaseInformation,
  currentDatabaseVersion,
  databaseFileName,
} from './databaseManagerService';
import { APP_KEY, callApi } from './cplApi';
import { countOpen, reportUsage } from './usageService';

// The texts come from the publishing website, not from the app stores: when the CPL corrects a
// typo, the phone picks the new database up by itself. The app only accepts a database made for
// the structure it knows (the compatibility key), and only if it is newer than the one it has.
const MILLISECONDS_BETWEEN_CHECKS = 6 * 60 * 60 * 1000;
// Downloaded outside the database folder: only a file that has passed every check gets in
const DOWNLOAD_FILE = `${FileSystem.cacheDirectory}cpl-download.db`;

export type DatabaseUpdateResult = 'no-key' | 'too-soon' | 'up-to-date' | 'downloaded' | 'unreachable' | 'rejected';

interface DatabaseManifest {
  version: number;
  compat: string;
  md5: string;
  bytes: number;
  url: string;
}

export async function checkForNewDatabase(force = false): Promise<DatabaseUpdateResult> {
  if (!APP_KEY) {
    Logger.log(Logger.LogKeys.DatabaseUpdaterService, 'checkForNewDatabase', 'No app key: not checking');
    return 'no-key';
  }
  if (!force && !(await isTimeToCheck())) {
    return 'too-soon';
  }

  try {
    const manifest = await askForNewDatabase();
    await StorageService.storeData(StorageKeys.LastDatabaseCheck, Date.now());
    if (!manifest) {
      return 'up-to-date';
    }

    const currentVersion = await currentDatabaseVersion();
    if (manifest.version <= currentVersion) {
      Logger.log(
        Logger.LogKeys.DatabaseUpdaterService,
        'checkForNewDatabase',
        `Version ${manifest.version} is not newer than ${currentVersion}`,
      );
      return 'up-to-date';
    }

    return (await download(manifest)) ? 'downloaded' : 'rejected';
  } catch (error) {
    // No network, the server down, the plan's daily limit reached: the app keeps the database it
    // has and asks again later. Nothing is lost.
    Logger.logError(Logger.LogKeys.DatabaseUpdaterService, 'checkForNewDatabase', error as Error);
    return 'unreachable';
  }
}

async function isTimeToCheck(): Promise<boolean> {
  const lastCheck = Number(await StorageService.getData(StorageKeys.LastDatabaseCheck, '0'));
  const elapsed = Date.now() - lastCheck;
  // A clock moved backwards would otherwise stop the checks for good
  return !Number.isFinite(elapsed) || elapsed < 0 || elapsed > MILLISECONDS_BETWEEN_CHECKS;
}

// null when there is nothing for this app: the server answers 204
async function askForNewDatabase(): Promise<DatabaseManifest | null> {
  const bundled = bundledDatabaseInformation();
  const response = await callApi(`/v1/db/latest?compat=${bundled.compat}`);
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`The server answered ${response.status}`);
  }
  const manifest = (await response.json()) as DatabaseManifest;
  return manifest.compat === bundled.compat ? manifest : null;
}

// Downloads and checks it before letting it anywhere near the database folder. It is used the next
// time the app opens, which is when the old one is deleted.
async function download(manifest: DatabaseManifest): Promise<boolean> {
  Logger.log(
    Logger.LogKeys.DatabaseUpdaterService,
    'download',
    `Downloading version ${manifest.version} (${Math.round(manifest.bytes / 1000000)} MB)`,
  );
  const pendingName = `pending-v${manifest.version}.db`;
  const pendingPath = `${DATABASE_DIRECTORY}${pendingName}`;
  try {
    await FileSystem.deleteAsync(DOWNLOAD_FILE, { idempotent: true });
    const download = await FileSystem.downloadAsync(manifest.url, DOWNLOAD_FILE);
    if (download.status !== 200) {
      throw new Error(`The download answered ${download.status}`);
    }

    const downloaded = await FileSystem.getInfoAsync(DOWNLOAD_FILE, { md5: true });
    if (!downloaded.exists || downloaded.md5 !== manifest.md5) {
      throw new Error('The downloaded file is not the published one');
    }

    // Opening it is the last check: a database the app cannot read never replaces the good one
    await FileSystem.moveAsync({ from: DOWNLOAD_FILE, to: pendingPath });
    await checkItIsTheRightDatabase(pendingName, manifest);

    await FileSystem.moveAsync({
      from: pendingPath,
      to: `${DATABASE_DIRECTORY}${databaseFileName(manifest.compat, manifest.version)}`,
    });
    Logger.log(
      Logger.LogKeys.DatabaseUpdaterService,
      'download',
      `Version ${manifest.version} ready: it will be used the next time the app opens`,
    );
    return true;
  } catch (error) {
    Logger.logError(Logger.LogKeys.DatabaseUpdaterService, 'download', error as Error);
    await FileSystem.deleteAsync(DOWNLOAD_FILE, { idempotent: true });
    await FileSystem.deleteAsync(pendingPath, { idempotent: true });
    return false;
  }
}

async function checkItIsTheRightDatabase(pendingName: string, manifest: DatabaseManifest) {
  const database = await SQLite.openDatabaseAsync(pendingName);
  try {
    const stamp = await database.getFirstAsync<{ version: number; compat: string }>(
      'SELECT version, compat FROM _publication LIMIT 1',
    );
    if (!stamp || stamp.version !== manifest.version || stamp.compat !== manifest.compat) {
      throw new Error('The database does not say it is the published version');
    }
  } finally {
    await database.closeAsync();
  }
}

// Opening the app: one more opening for the count, and a look for a new database. Both are
// throttled: the database is asked about at most once every six hours, and the count goes with it.
async function onAppOpened() {
  await countOpen();
  const result = await checkForNewDatabase();
  if (result !== 'too-soon' && result !== 'no-key') {
    await reportUsage();
  }
}

export function useDatabaseUpdates() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    onAppOpened();

    const subscription = AppState.addEventListener('change', (nextState) => {
      const cameBack = appState.current !== 'active' && nextState === 'active';
      appState.current = nextState;
      if (cameBack) {
        onAppOpened();
      }
    });
    return () => subscription.remove();
  }, []);
}
