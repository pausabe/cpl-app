import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import * as Logger from '../utils/logger';
import { Asset } from 'expo-asset';
import { FileSystemService } from './FileSystemService';
import SettingsService, { DEFAULT_EDITION } from './SettingsService';
import bundledDatabase from '../assets/db/cpl-app.db.json';

let CPLDataBase: SQLite.SQLiteDatabase | undefined = undefined;

export const DATABASE_DIRECTORY = `${FileSystem.documentDirectory}SQLite/`;

// The edition the app carries inside: the Catalan one, unless it was built with another one in
// src/assets/db (make db-es), whose descriptor then says its language
const bundledEdition: string = (bundledDatabase as { language?: string }).language ?? DEFAULT_EDITION;

// Every database says what it is in its own name: cpl-<compatibility>-v<version>.db, and for an
// edition other than the Catalan one, cpl-<compatibility>-v<version>-<edition>.db. The
// compatibility key is the one the publishing website stamps inside it, so a database made for
// another version of the app is never opened here. The phone keeps exactly one: on opening, the
// newest one of the chosen edition that this app can read stays and the rest go.
export function databaseFileName(compat: string, version: number, edition: string = DEFAULT_EDITION): string {
  return edition === DEFAULT_EDITION ? `cpl-${compat}-v${version}.db` : `cpl-${compat}-v${version}-${edition}.db`;
}

function parseDatabaseFileName(fileName: string): { compat: string; version: number; edition: string } | null {
  const parts = /^cpl-(s\d+-[0-9a-f]+)-v(\d+)(?:-([a-z]{2}))?\.db$/.exec(fileName);
  return parts ? { compat: parts[1], version: Number(parts[2]), edition: parts[3] ?? DEFAULT_EDITION } : null;
}

// Which publication the app is really praying with: the one it has opened. It is not always the
// newest one the phone has, because a database downloaded today is not opened until the app opens
// again, and that is what the technical data of Configuració has to say.
let openedVersion: number | null = null;
let openedEdition: string | null = null;

export function openedDatabaseVersion(): number | null {
  return openedVersion;
}

// The edition of the database open, which is the chosen one once the phone has it
export function openedDatabaseEdition(): string | null {
  return openedEdition;
}

export function bundledDatabaseInformation(): { compat: string; version: number; md5: string; edition: string } {
  return { ...bundledDatabase, edition: bundledEdition };
}

// The database of an edition (the chosen one when none is said) the app would use right now,
// without opening it: the newest one of that edition it can read, downloaded or inside the app. 0
// when the phone has none. The updater asks for it before downloading anything.
export async function currentDatabaseVersion(edition?: string): Promise<number> {
  const usable = await usableDatabases(edition ?? (await SettingsService.getSettingEdition()));
  return usable[0]?.version ?? 0;
}

// The one the app was given the first time: the reloads that come after (a setting changed) do not
// carry it, and going back to the edition inside the app has to copy it again
let bundledAsset: Asset | undefined;

// The file the connection is open on
let openedName: string | null = null;

// Every reload comes here (a setting changed, another day), and the file open stays open: only a
// database downloaded meanwhile, or another edition, opens another one. Opening the same file again
// gives a second handle on the same connection, and on Android expo-sqlite (57) closes that
// connection as soon as the garbage collector takes any of its handles, whatever the others are
// doing: from then on every query failed, and the next reload (a memorial switched on, a day chosen
// in the calendar) left the app broken until it was closed. The 8.x, with expo-sqlite 14, counted
// the handles before closing.
export async function openDatabase(databaseAsset?: Asset) {
  if (databaseAsset) bundledAsset = databaseAsset;
  await createDirectory();
  const databaseName = await chooseDatabase();

  if (!(await databaseExists(databaseName))) {
    throw 'There is no database to open';
  }
  const previous = CPLDataBase;
  let name = databaseName;
  try {
    CPLDataBase = await connectTo(databaseName);
    const parsed = parseDatabaseFileName(databaseName);
    openedVersion = parsed?.version ?? null;
    openedEdition = parsed?.edition ?? null;
  } catch (error) {
    CPLDataBase = await openBundledAfterFailure(databaseName, error);
    name = databaseFileName(bundledDatabase.compat, bundledDatabase.version, bundledEdition);
    openedVersion = bundledDatabase.version;
    openedEdition = bundledEdition;
  }
  openedName = name;
  // Closed before its file goes, and only once nothing uses it: the reloads and the queries of the
  // calendar wait for each other (liturgyStore)
  if (previous !== undefined && previous !== CPLDataBase) {
    await previous.closeAsync().catch((error) => {
      Logger.logError(Logger.LogKeys.DatabaseManagerService, 'openDatabase', error as Error);
    });
  }
  await deleteEveryDatabaseBut(name);
}

async function connectTo(databaseName: string): Promise<SQLite.SQLiteDatabase> {
  if (CPLDataBase !== undefined && databaseName === openedName) {
    return CPLDataBase;
  }
  Logger.log(Logger.LogKeys.DatabaseManagerService, 'openDatabase', `Opening database '${databaseName}'`);
  return SQLite.openDatabaseAsync(databaseName);
}

// A downloaded database that does not open would leave the app with no liturgy at all, so it is
// thrown away and the one inside the app takes over. The next check downloads it again.
async function openBundledAfterFailure(failedName: string, error: unknown) {
  const bundledName = databaseFileName(bundledDatabase.compat, bundledDatabase.version, bundledEdition);
  if (failedName === bundledName) {
    throw error;
  }
  Logger.logError(Logger.LogKeys.DatabaseManagerService, 'openDatabase', error as Error);
  await FileSystem.deleteAsync(`${DATABASE_DIRECTORY}${failedName}`, { idempotent: true });
  await placeBundledDatabase(bundledName);
  return connectTo(bundledName);
}

// The rows a query gives. Asked before the database is open, it fails at once (it used to wait
// for ever, with the error lost on the way).
export async function executeQueryAsync(query: string): Promise<any> {
  if (CPLDataBase === undefined) {
    throw new Error('You must call openDatabase function to execute queries');
  }
  return _executeQuery(CPLDataBase, query);
}

async function databaseExists(databaseName: string) {
  return databaseName && (await FileSystem.getInfoAsync(`${DATABASE_DIRECTORY}${databaseName}`)).exists;
}

async function createDirectory() {
  if (!(await FileSystem.getInfoAsync(DATABASE_DIRECTORY)).exists) {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`);
  }
}

// Downloaded databases this app can read, newest first
async function usableDownloadedDatabases(): Promise<{ name: string; version: number; edition: string }[]> {
  const fileUris = await FileSystemService.getFileUrisInDirectory(DATABASE_DIRECTORY, 'db');
  return fileUris
    .map((uri) => {
      const name = databaseNameFromUri(uri);
      return { name, parsed: parseDatabaseFileName(name) };
    })
    .flatMap(({ name, parsed }) =>
      parsed !== null && parsed.compat === bundledDatabase.compat
        ? [{ name, version: parsed.version, edition: parsed.edition }]
        : [],
    )
    .sort((one, other) => other.version - one.version);
}

// The databases of an edition the app can open, newest first: the downloaded ones, and the one
// inside the app when it is of that edition, which can always be copied again
async function usableDatabases(edition: string): Promise<{ name: string; version: number; bundled: boolean }[]> {
  const bundledName = databaseFileName(bundledDatabase.compat, bundledDatabase.version, bundledEdition);
  const downloaded = (await usableDownloadedDatabases())
    .filter((database) => database.edition === edition && database.name !== bundledName)
    .map(({ name, version }) => ({ name, version, bundled: false }));
  const inside =
    edition === bundledEdition ? [{ name: bundledName, version: bundledDatabase.version, bundled: true }] : [];
  return [...downloaded, ...inside].sort((one, other) => other.version - one.version);
}

// The newest database of the chosen edition. While the phone has none of it (it is on its way:
// the updater asks for it at once), the app prays with the one it carries inside.
async function chooseDatabase(): Promise<string> {
  const edition = await SettingsService.getSettingEdition();
  const ofEdition = await usableDatabases(edition);
  const candidates = ofEdition.length > 0 ? ofEdition : await usableDatabases(bundledEdition);
  const chosen = candidates[0];
  if (chosen.bundled) {
    await placeBundledDatabase(chosen.name);
  }

  // Which versions were there to choose from, not how many: a count next to a version number
  // reads as another version number, and then the line says something it does not mean
  const downloaded = candidates.filter((candidate) => !candidate.bundled);
  const found = downloaded.length > 0 ? downloaded.map(({ version }) => `v${version}`).join(', ') : 'none';
  const missing = ofEdition.length === 0 ? `, edition ${edition} not on the phone yet` : '';
  Logger.log(
    Logger.LogKeys.DatabaseManagerService,
    'chooseDatabase',
    `Using '${chosen.name}' (inside the app: v${bundledDatabase.version}, downloaded: ${found}${missing})`,
  );
  return chosen.name;
}

async function placeBundledDatabase(bundledName: string) {
  if (await databaseExists(bundledName)) {
    return;
  }
  await FileSystemService.copyFile(bundledAsset?.localUri ?? '', `${DATABASE_DIRECTORY}${bundledName}`);
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

function databaseNameFromUri(uri: string): string {
  if (!uri) {
    return '';
  }
  return uri.split('/').pop() ?? '';
}

async function _executeQuery(database: SQLite.SQLiteDatabase, query: string): Promise<any> {
  try {
    return await database.getAllAsync(query);
  } catch (error) {
    Logger.logError(
      Logger.LogKeys.DatabaseManagerService,
      '_executeQuery',
      new Error(`Error in query (${query}): ${(error as Error).message}`),
    );
    throw error;
  }
}
