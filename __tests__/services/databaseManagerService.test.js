// The app carries a database inside and can download newer ones from the publishing website.
// Only one is kept on the phone (16 MB each), and it is always the newest one this build can
// read: a database made for another structure, or older than the one inside the app, is thrown
// away. If the chosen one does not open, the app falls back to the one it carries instead of
// leaving the phone with no liturgy.
jest.mock('expo-file-system/legacy', () => {
  const files = new Set();
  return {
    __files: files,
    documentDirectory: 'file:///docs/',
    getInfoAsync: jest.fn(async (path) => ({
      exists: path === 'file:///docs/SQLite/' || files.has(path),
      isDirectory: path.endsWith('/'),
    })),
    makeDirectoryAsync: jest.fn(async () => {}),
    readDirectoryAsync: jest.fn(async () => [...files].map((f) => f.split('/').pop())),
    copyAsync: jest.fn(async ({ to }) => {
      files.add(to);
    }),
    deleteAsync: jest.fn(async (path) => {
      files.delete(path);
    }),
  };
});
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async (name) => ({ name, getAllAsync: jest.fn(async () => [{ ok: 1 }]) })),
}));

const FileSystem = require('expo-file-system/legacy');
const SQLite = require('expo-sqlite');
const DatabaseManagerService = require('../../src/services/databaseManagerService');
const bundled = require('../../src/assets/db/cpl-app.db.json');

const DIRECTORY = 'file:///docs/SQLite/';
const BUNDLED_NAME = `cpl-${bundled.compat}-v${bundled.version}.db`;
const asset = { localUri: 'file:///bundle/cpl-app.db' };
const downloaded = (version, compat = bundled.compat) => `${DIRECTORY}cpl-${compat}-v${version}.db`;

beforeEach(() => {
  FileSystem.__files.clear();
  jest.clearAllMocks();
});

test('on the first launch it copies the database that comes inside the app', async () => {
  await DatabaseManagerService.openDatabase(asset);

  expect(FileSystem.copyAsync).toHaveBeenCalledWith({ from: asset.localUri, to: `${DIRECTORY}${BUNDLED_NAME}` });
  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(BUNDLED_NAME);
  await expect(DatabaseManagerService.executeQueryAsync('SELECT 1')).resolves.toEqual([{ ok: 1 }]);
});

test('on the next launch it does not copy it again', async () => {
  FileSystem.__files.add(`${DIRECTORY}${BUNDLED_NAME}`);

  await DatabaseManagerService.openDatabase(asset);

  expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(BUNDLED_NAME);
});

test('a downloaded database that is newer is the one used, and the older one goes', async () => {
  FileSystem.__files.add(`${DIRECTORY}${BUNDLED_NAME}`);
  FileSystem.__files.add(downloaded(bundled.version + 1));

  await DatabaseManagerService.openDatabase(asset);

  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(`cpl-${bundled.compat}-v${bundled.version + 1}.db`);
  expect([...FileSystem.__files]).toEqual([downloaded(bundled.version + 1)]);
});

test('a database downloaded before a new version of the app is thrown away', async () => {
  // The app was updated and now carries a newer database than the downloaded one
  FileSystem.__files.add(downloaded(bundled.version - 1));

  await DatabaseManagerService.openDatabase(asset);

  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(BUNDLED_NAME);
  expect([...FileSystem.__files]).toEqual([`${DIRECTORY}${BUNDLED_NAME}`]);
});

test('a database made for another structure is never opened', async () => {
  FileSystem.__files.add(downloaded(bundled.version + 5, 's9-ffffffffffffffff'));

  await DatabaseManagerService.openDatabase(asset);

  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(BUNDLED_NAME);
  expect([...FileSystem.__files]).toEqual([`${DIRECTORY}${BUNDLED_NAME}`]);
});

test('databases left by earlier versions of the app are cleaned up', async () => {
  FileSystem.__files.add(`${DIRECTORY}abc123.db`);
  FileSystem.__files.add(`${DIRECTORY}pending-v7.db`);

  await DatabaseManagerService.openDatabase(asset);

  expect([...FileSystem.__files]).toEqual([`${DIRECTORY}${BUNDLED_NAME}`]);
});

test('if the downloaded database does not open, the app goes back to the one it carries', async () => {
  FileSystem.__files.add(downloaded(bundled.version + 1));
  SQLite.openDatabaseAsync.mockImplementationOnce(async () => {
    throw new Error('file is not a database');
  });

  await DatabaseManagerService.openDatabase(asset);

  expect(SQLite.openDatabaseAsync).toHaveBeenLastCalledWith(BUNDLED_NAME);
  expect([...FileSystem.__files]).toEqual([`${DIRECTORY}${BUNDLED_NAME}`]);
});

test('currentDatabaseVersion is the newest one the app can read', async () => {
  expect(await DatabaseManagerService.currentDatabaseVersion()).toBe(bundled.version);

  FileSystem.__files.add(downloaded(bundled.version + 3));

  expect(await DatabaseManagerService.currentDatabaseVersion()).toBe(bundled.version + 3);
});
