import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import * as Logger from '../utils/logger';
import * as StorageService from './storage/storageService';
import StorageKeys from './storage/storageKeys';
import SettingsService, { DEFAULT_EDITION } from './SettingsService';
import {
  DATABASE_DIRECTORY,
  bundledDatabaseInformation,
  currentDatabaseVersion,
  databaseFileName,
  openedDatabaseEdition,
  openedDatabaseVersion,
} from './databaseManagerService';
import { APP_KEY, DEVICE_HEADER, appVersion, callApi } from './cplApi';
import { countOpen, currentIdentifier, reportUsage } from './usageService';
import { checkForNewApp } from './appUpdateService';

// The texts come from the publishing website, not from the app stores: when the CPL corrects a
// typo, the phone picks the new database up by itself. The app only accepts a database made for
// the structure it knows (the compatibility key), and only if it is newer than the one it has. It
// also says its version: a publication that needs code this app does not have yet is not given to
// it, and it is given the newest one it can show instead. And it asks for the edition chosen in
// Configuració (the language of the texts), which is the Catalan one unless another one was chosen.
const MILLISECONDS_BETWEEN_CHECKS = 6 * 60 * 60 * 1000;
// A phone that could not reach the website at all is not made to wait the whole six hours: it may
// be back on a wifi in a minute. Long enough, though, that opening and closing the app on a train
// does not ask again every single time. A download that started and went wrong is not this case:
// that one waits the six hours, because retrying sixteen megabytes is not free.
const MILLISECONDS_AFTER_A_FAILED_CHECK = 15 * 60 * 1000;
// The database is sixteen megabytes, so a slow connection can take a while, and that is fine. What
// this guards against is the connection that never finishes: the phone gives up by itself when
// nothing at all arrives for a minute (OkHttp on Android, URLSession on iOS), but a download that
// trickles has nothing to stop it, and on iOS it runs on a session that would wait for days. Ten
// minutes is about twenty-five kilobytes a second: slower than that and the app keeps the database
// it has and asks again at the next check.
const DOWNLOAD_TIMEOUT = 10 * 60 * 1000;
// Downloaded outside the database folder: only a file that has passed every check gets in
const DOWNLOAD_FILE = `${FileSystem.cacheDirectory}cpl-download.db`;

export type DatabaseUpdateResult = 'no-key' | 'too-soon' | 'up-to-date' | 'downloaded' | 'unreachable' | 'rejected';

interface DatabaseManifest {
  version: number;
  compat: string;
  md5: string;
  bytes: number;
  url: string;
  // The website says which edition it is, and which editions there are for this app; one from
  // before the editions says neither, and all it has is Catalan
  edition?: string;
  editions?: string[];
}

export async function checkForNewDatabase(force = false): Promise<DatabaseUpdateResult> {
  if (!APP_KEY) {
    Logger.log(Logger.LogKeys.DatabaseUpdaterService, 'checkForNewDatabase', 'No app key: not checking');
    return 'no-key';
  }
  const edition = await SettingsService.getSettingEdition();
  // An edition chosen that the phone does not have yet (the app was updated, and its database is
  // for the app of before) is asked for without waiting the six hours: until it arrives, the app
  // prays in another language
  const missing = openedDatabaseEdition() !== null && openedDatabaseEdition() !== edition;
  if (!force && !(await isTimeToCheck(missing))) {
    return 'too-soon';
  }

  try {
    const manifest = await askForNewDatabase(edition);
    await rememberTheCheck(false);
    if (!manifest) {
      return 'up-to-date';
    }

    const currentVersion = await currentDatabaseVersion(edition);
    if (manifest.version <= currentVersion) {
      Logger.log(
        Logger.LogKeys.DatabaseUpdaterService,
        'checkForNewDatabase',
        `Version ${manifest.version} is not newer than ${currentVersion}`,
      );
      return 'up-to-date';
    }

    return (await download(manifest, edition)) ? 'downloaded' : 'rejected';
  } catch (error) {
    // No network, the server down, the plan's daily limit reached: the app keeps the database it
    // has and asks again later. Nothing is lost.
    await rememberTheCheck(true);
    Logger.logError(Logger.LogKeys.DatabaseUpdaterService, 'checkForNewDatabase', error as Error);
    return 'unreachable';
  }
}

export type EditionPreparation = 'ready' | 'none' | 'unreachable' | 'rejected';

// Before Configuració goes over to another edition: the phone must have its database, the newest one
// published for this app, and it is downloaded now if it has not. 'ready' when it has it (without
// network, the one it has will do); 'none' when the website has none for this app.
export async function prepareEdition(edition: string): Promise<EditionPreparation> {
  let current = 0;
  try {
    current = await currentDatabaseVersion(edition);
    const manifest = await askForNewDatabase(edition);
    if (!manifest) {
      return current > 0 ? 'ready' : 'none';
    }
    if (manifest.version <= current) {
      return 'ready';
    }
    const downloaded = await download(manifest, edition);
    // A download that went wrong leaves the phone with the one it had, if it had one
    return downloaded || current > 0 ? 'ready' : 'rejected';
  } catch (error) {
    Logger.logError(Logger.LogKeys.DatabaseUpdaterService, 'prepareEdition', error as Error);
    return current > 0 ? 'ready' : 'unreachable';
  }
}

// The editions the website has for this app, as it said the last time it was asked. Configuració
// offers to choose only when there is more than one.
export async function knownEditions(): Promise<string[]> {
  try {
    const editions = JSON.parse((await StorageService.getData(StorageKeys.KnownEditions, '[]')) as string);
    return isEditionList(editions) ? editions : [];
  } catch {
    return [];
  }
}

function isEditionList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((edition) => typeof edition === 'string' && /^[a-z]{2}$/.test(edition));
}

// When the last check was, and whether the website answered it. Both are written on every check
// that got as far as asking, so that a phone with no network waits its quarter of an hour instead
// of asking again every time the app comes back to the front.
async function rememberTheCheck(failed: boolean): Promise<void> {
  await StorageService.storeData(StorageKeys.LastDatabaseCheck, Date.now());
  await StorageService.storeData(StorageKeys.LastDatabaseCheckFailed, failed ? 'true' : '');
}

// For trying out a publication without waiting the six hours: it does not download anything, it
// only moves the last check far enough back that the next opening asks again. Pressed from the
// technical data of Configuració, it makes the phone behave exactly as it would tomorrow.
export async function askAgainOnTheNextOpening(): Promise<void> {
  await StorageService.storeData(StorageKeys.LastDatabaseCheck, Date.now() - MILLISECONDS_BETWEEN_CHECKS - 1000);
}

async function isTimeToCheck(soon = false): Promise<boolean> {
  const lastCheck = Number(await StorageService.getData(StorageKeys.LastDatabaseCheck, '0'));
  const failed = (await StorageService.getData(StorageKeys.LastDatabaseCheckFailed, '')) === 'true';
  const wait = failed || soon ? MILLISECONDS_AFTER_A_FAILED_CHECK : MILLISECONDS_BETWEEN_CHECKS;
  const elapsed = Date.now() - lastCheck;
  // A clock moved backwards would otherwise stop the checks for good
  return !Number.isFinite(elapsed) || elapsed < 0 || elapsed > wait;
}

// null when there is nothing for this app: the server answers 204. The Catalan edition is asked for
// as it always was, without saying it.
//
// The phone says who it is with the identifier it is counted with, the one Configuració shows: a phone
// on the website's list of test phones also gets the publications that are not for everyone yet. It
// goes in a header and not in the address, so that it is left in no log, and the website only looks it
// up in that list. A phone that has never reported has no identifier, and asks like everyone else.
async function askForNewDatabase(edition: string): Promise<DatabaseManifest | null> {
  const bundled = bundledDatabaseInformation();
  const version = appVersion();
  const phone = await currentIdentifier();
  const response = await callApi(
    `/v1/db/latest?compat=${bundled.compat}${version ? `&app=${version}` : ''}` +
      (edition === DEFAULT_EDITION ? '' : `&edition=${edition}`),
    phone ? { headers: { [DEVICE_HEADER]: phone.device } } : {},
  );
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`The server answered ${response.status}`);
  }
  const manifest = (await response.json()) as DatabaseManifest;
  if (isEditionList(manifest.editions)) {
    await StorageService.storeData(StorageKeys.KnownEditions, JSON.stringify(manifest.editions));
  }
  // A website from before the editions gives the Catalan one whatever is asked
  return manifest.compat === bundled.compat && (manifest.edition ?? DEFAULT_EDITION) === edition ? manifest : null;
}

// Downloads and checks it before letting it anywhere near the database folder. It is used the next
// time the app opens, which is when the old one is deleted.
async function download(manifest: DatabaseManifest, edition: string): Promise<boolean> {
  Logger.log(
    Logger.LogKeys.DatabaseUpdaterService,
    'download',
    `Downloading version ${manifest.version} (${Math.round(manifest.bytes / 1000000)} MB)`,
  );
  const pendingName = `pending-v${manifest.version}.db`;
  const pendingPath = `${DATABASE_DIRECTORY}${pendingName}`;
  try {
    await FileSystem.deleteAsync(DOWNLOAD_FILE, { idempotent: true });
    const download = await downloadGivingUpAfterTheTimeout(manifest.url);
    // Nothing at all is a download that was called off, and the only thing that calls one off here
    // is the timeout, which has thrown already
    if (!download || download.status !== 200) {
      throw new Error(`The download answered ${download ? download.status : 'nothing'}`);
    }

    const downloaded = await FileSystem.getInfoAsync(DOWNLOAD_FILE, { md5: true });
    if (!downloaded.exists || downloaded.md5 !== manifest.md5) {
      throw new Error('The downloaded file is not the published one');
    }

    // Opening it is the last check: a database the app cannot read never replaces the good one
    await FileSystem.moveAsync({ from: DOWNLOAD_FILE, to: pendingPath });
    await checkItIsTheRightDatabase(pendingName, manifest, edition);

    await FileSystem.moveAsync({
      from: pendingPath,
      to: `${DATABASE_DIRECTORY}${databaseFileName(manifest.compat, manifest.version, edition)}`,
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

// A plain downloadAsync cannot be called off once it has started, and a download that never ends
// would hold the opening of the app for the rest of the session. A resumable one can, and that is
// the only reason it is used here: nothing is ever resumed, what the timeout leaves behind is
// thrown away with the rest by whoever asked for the download.
async function downloadGivingUpAfterTheTimeout(url: string): Promise<FileSystem.FileSystemDownloadResult | undefined> {
  const task = FileSystem.createDownloadResumable(url, DOWNLOAD_FILE);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const giveUp = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // It answers on its own time, and by then nobody is listening any more
      task.cancelAsync().catch(() => undefined);
      reject(new Error(`The download did not finish in ${DOWNLOAD_TIMEOUT / 60000} minutes`));
    }, DOWNLOAD_TIMEOUT);
  });
  try {
    return await Promise.race([task.downloadAsync(), giveUp]);
  } finally {
    clearTimeout(timer);
  }
}

async function checkItIsTheRightDatabase(pendingName: string, manifest: DatabaseManifest, edition: string) {
  const database = await SQLite.openDatabaseAsync(pendingName);
  try {
    const stamp = await database.getFirstAsync<{ version: number; compat: string }>(
      'SELECT version, compat FROM _publication LIMIT 1',
    );
    if (!stamp || stamp.version !== manifest.version || stamp.compat !== manifest.compat) {
      throw new Error('The database does not say it is the published version');
    }
    // Its language is the one asked for: the Catalan ones of before do not say it
    const hasEdition = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '_edition'",
    );
    const language = hasEdition
      ? (await database.getFirstAsync<{ language: string }>('SELECT language FROM _edition LIMIT 1'))?.language
      : undefined;
    if ((language ?? DEFAULT_EDITION) !== edition) {
      throw new Error(`The database is of the edition ${language}, not ${edition}`);
    }
  } finally {
    await database.closeAsync();
  }
}

// Opening the app: one more opening for the count, a look for a new database and one for a newer
// app in the store. All are throttled: the database is asked about at most once every six hours,
// and the count goes with it; the store, once a day.
//
// It can be called twice at once, as the phone says the app became active right after it started.
// Only the first one does the work: otherwise the same opening was counted twice and two reports
// of use left at the same time.
let opening: Promise<void> | null = null;

export function onAppOpened(): Promise<void> {
  if (!opening) {
    opening = lookAfterOpening().finally(() => {
      opening = null;
    });
  }
  return opening;
}

async function lookAfterOpening() {
  await countOpen();
  const result = await checkForNewDatabase();
  if (result !== 'too-soon' && result !== 'no-key') {
    // The publication it is praying with, which is the one it has opened, not the newest one it
    // may have downloaded a moment ago: that one only counts from the next opening onwards
    await reportUsage(openedDatabaseVersion());
  }
  await checkForNewApp();
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
