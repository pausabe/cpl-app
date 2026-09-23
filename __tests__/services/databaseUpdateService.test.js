// The texts arrive from the publishing website while the app is used. What matters here is that
// nothing can break a phone that is praying: a file that is not exactly the published one, or that
// does not open, never replaces the database in use, and the app is left as it was.
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  cacheDirectory: 'file:///cache/',
  downloadAsync: jest.fn(async () => ({ status: 200 })),
  getInfoAsync: jest.fn(async () => ({ exists: true, md5: 'the-published-md5' })),
  moveAsync: jest.fn(async () => {}),
  deleteAsync: jest.fn(async () => {}),
}));
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    getFirstAsync: jest.fn(async () => ({ version: 7, compat: 's0-abcdef0123456789' })),
    closeAsync: jest.fn(async () => {}),
  })),
}));
jest.mock('../../src/services/databaseManagerService', () => ({
  DATABASE_DIRECTORY: 'file:///docs/SQLite/',
  databaseFileName: (compat, version) => `cpl-${compat}-v${version}.db`,
  bundledDatabaseInformation: () => ({ version: 1, compat: 's0-abcdef0123456789', md5: 'whatever' }),
  currentDatabaseVersion: jest.fn(async () => 1),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const FileSystem = require('expo-file-system/legacy');
const SQLite = require('expo-sqlite');
const DatabaseManagerService = require('../../src/services/databaseManagerService');

const COMPAT = 's0-abcdef0123456789';
const FINAL_PATH = `file:///docs/SQLite/cpl-${COMPAT}-v7.db`;
const PENDING_PATH = 'file:///docs/SQLite/pending-v7.db';
const DOWNLOAD_PATH = 'file:///cache/cpl-download.db';

const manifest = (values = {}) => ({
  version: 7,
  compat: COMPAT,
  md5: 'the-published-md5',
  bytes: 16000000,
  url: 'https://cpl-api.canmartorell.dev/v1/db/files/7-the-published-md5?e=1&s=2',
  ...values,
});

function answer(body, status = 200) {
  global.fetch = jest.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

// The key is read when the module is loaded, as it is written into the app when it is built
function loadService({ appKey = 'the-app-key' } = {}) {
  let service;
  jest.isolateModules(() => {
    process.env.EXPO_PUBLIC_CPL_APP_KEY = appKey;
    service = require('../../src/services/databaseUpdateService');
  });
  return service;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  DatabaseManagerService.currentDatabaseVersion.mockResolvedValue(1);
  answer(manifest());
});

test('asks the website with the app key and the structure it can read', async () => {
  const service = loadService();

  await service.checkForNewDatabase();

  expect(global.fetch).toHaveBeenCalledWith(
    `https://cpl-api.canmartorell.dev/v1/db/latest?compat=${COMPAT}`,
    expect.objectContaining({ headers: { 'X-CPL-App-Key': 'the-app-key' } }),
  );
});

test('without the app key it does not even ask', async () => {
  const service = loadService({ appKey: '' });

  await expect(service.checkForNewDatabase()).resolves.toBe('no-key');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('a newer database is downloaded, checked and left ready for the next opening', async () => {
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('downloaded');

  expect(FileSystem.downloadAsync).toHaveBeenCalledWith(manifest().url, DOWNLOAD_PATH);
  // It gets into the database folder only to be opened, and with its own name once it is trusted
  expect(FileSystem.moveAsync).toHaveBeenNthCalledWith(1, { from: DOWNLOAD_PATH, to: PENDING_PATH });
  expect(FileSystem.moveAsync).toHaveBeenNthCalledWith(2, { from: PENDING_PATH, to: FINAL_PATH });
});

test('a file that is not the published one is thrown away', async () => {
  FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true, md5: 'something-else' });
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('rejected');

  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith(DOWNLOAD_PATH, { idempotent: true });
});

test('a database that does not say it is the published version is thrown away', async () => {
  SQLite.openDatabaseAsync.mockResolvedValueOnce({
    getFirstAsync: jest.fn(async () => ({ version: 99, compat: COMPAT })),
    closeAsync: jest.fn(async () => {}),
  });
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('rejected');

  expect(FileSystem.moveAsync).toHaveBeenCalledTimes(1);
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith(PENDING_PATH, { idempotent: true });
});

test('a database that cannot be opened at all is thrown away', async () => {
  SQLite.openDatabaseAsync.mockRejectedValueOnce(new Error('file is not a database'));
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('rejected');
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith(PENDING_PATH, { idempotent: true });
});

test('nothing to download when the website has nothing for this structure', async () => {
  answer(null, 204);
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('up-to-date');
  expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
});

test('nothing to download when the phone already has that version or a newer one', async () => {
  DatabaseManagerService.currentDatabaseVersion.mockResolvedValue(7);
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('up-to-date');
  expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
});

test('without network it keeps the database it has and says nothing', async () => {
  global.fetch = jest.fn(async () => {
    throw new Error('Network request failed');
  });
  const service = loadService();

  await expect(service.checkForNewDatabase()).resolves.toBe('unreachable');
  expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
});

test('two openings at the same time count one opening and report once', async () => {
  answer(null, 204);
  const service = loadService();

  await Promise.all([service.onAppOpened(), service.onAppOpened()]);

  const asked = global.fetch.mock.calls.map(([url]) => url);
  expect(asked.filter((url) => url.endsWith('/v1/usage'))).toHaveLength(1);
  expect(asked.filter((url) => url.includes('/v1/db/latest'))).toHaveLength(1);
  const [, sent] = global.fetch.mock.calls.find(([url]) => url.endsWith('/v1/usage'));
  expect(JSON.parse(sent.body).opens).toBe(1);
});

test('it asks again at most once every six hours', async () => {
  const service = loadService();

  await service.checkForNewDatabase();
  await expect(service.checkForNewDatabase()).resolves.toBe('too-soon');
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // Seven hours later
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 7 * 60 * 60 * 1000);
  await service.checkForNewDatabase();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  Date.now.mockRestore();
});
