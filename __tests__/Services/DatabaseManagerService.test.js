// The database ships inside the app and is copied to the documents folder on first launch.
// When a new build brings a new database (its asset has a new, hashed name), the old copy
// must be replaced; otherwise the phone keeps praying with last year's data.
jest.mock('expo-file-system', () => {
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
    copyAsync: jest.fn(async ({ to }) => { files.add(to); }),
    deleteAsync: jest.fn(async (path) => { files.delete(path); }),
  };
});
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async (name) => ({ name, getAllAsync: jest.fn(async () => [{ ok: 1 }]) })),
}));

const FileSystem = require('expo-file-system');
const SQLite = require('expo-sqlite');
const DatabaseManagerService = require('../../src/Services/DatabaseManagerService');

const asset = (name) => ({ localUri: `file:///bundle/${name}` });

beforeEach(() => {
  FileSystem.__files.clear();
  jest.clearAllMocks();
});

test('al primer arrencament copia la base de dades i la fa servir', async () => {
  await DatabaseManagerService.OpenDatabase(asset('abc123.db'));

  expect(FileSystem.copyAsync).toHaveBeenCalledWith({ from: 'file:///bundle/abc123.db', to: 'file:///docs/SQLite/abc123.db' });
  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('abc123.db');
  await expect(DatabaseManagerService.executeQueryAsync('SELECT 1')).resolves.toEqual([{ ok: 1 }]);
});

test('amb la mateixa base de dades no la torna a copiar', async () => {
  FileSystem.__files.add('file:///docs/SQLite/abc123.db');

  await DatabaseManagerService.OpenDatabase(asset('abc123.db'));

  expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('abc123.db');
});

test("una versió nova de l'app substitueix la base de dades antiga", async () => {
  FileSystem.__files.add('file:///docs/SQLite/old999.db');

  await DatabaseManagerService.OpenDatabase(asset('new456.db'));

  expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///docs/SQLite/old999.db');
  expect([...FileSystem.__files]).toEqual(['file:///docs/SQLite/new456.db']);
  expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('new456.db');
});
