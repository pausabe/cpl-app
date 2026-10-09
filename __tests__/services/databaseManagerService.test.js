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
// As expo-sqlite 57 does on Android: opening a file that is open already gives another handle on the
// same native connection, and when the garbage collector takes any of the handles, that connection
// is closed for all of them, whatever the others are doing.
jest.mock('expo-sqlite', () => {
  const handles = [];
  const connections = new Map();
  return {
    __handles: handles,
    // What the garbage collector does with every handle nobody holds any more
    __collect: (kept) => {
      for (const handle of handles) {
        if (handle !== kept) connections.get(handle.name).closed = true;
      }
    },
    openDatabaseAsync: jest.fn(async (name) => {
      if (!connections.has(name) || connections.get(name).closed) connections.set(name, { closed: false });
      const connection = connections.get(name);
      const handle = {
        name,
        getAllAsync: jest.fn(async () => {
          if (connection.closed) throw new Error('java.lang.NullPointerException');
          return [{ ok: 1 }];
        }),
        closeAsync: jest.fn(async () => {
          connection.closed = true;
        }),
      };
      handles.push(handle);
      return handle;
    }),
  };
});

let AsyncStorage;
let FileSystem;
let SQLite;
let DatabaseManagerService;
const bundled = require('../../src/assets/db/cpl-app.db.json');

const DIRECTORY = 'file:///docs/SQLite/';
const BUNDLED_NAME = `cpl-${bundled.compat}-v${bundled.version}.db`;
const asset = { localUri: 'file:///bundle/cpl-app.db' };
const downloaded = (version, compat = bundled.compat) => `${DIRECTORY}cpl-${compat}-v${version}.db`;

// Every test starts as a phone that has just opened the app: nothing open yet
beforeEach(async () => {
  jest.resetModules();
  AsyncStorage = require('@react-native-async-storage/async-storage');
  FileSystem = require('expo-file-system/legacy');
  SQLite = require('expo-sqlite');
  DatabaseManagerService = require('../../src/services/databaseManagerService');
  await AsyncStorage.clear();
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

describe('the reloads', () => {
  // Every setting changed and every day chosen in the calendar reloads the day, and each reload
  // used to open the database again. On Android, the first handle the garbage collector took
  // closed the connection under the app: the next reload (a memorial switched on, next Sunday
  // chosen in the calendar) failed until the app was closed and opened again.
  test('the file open is not opened again, so no handle of it is left for the garbage collector', async () => {
    FileSystem.__files.add(`${DIRECTORY}${BUNDLED_NAME}`);
    await DatabaseManagerService.openDatabase(asset);
    await DatabaseManagerService.openDatabase();
    await DatabaseManagerService.openDatabase();

    SQLite.__collect(SQLite.__handles[SQLite.__handles.length - 1]);

    await expect(DatabaseManagerService.executeQueryAsync('SELECT 1')).resolves.toEqual([{ ok: 1 }]);
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
  });

  test('a database downloaded meanwhile is opened, and the old one is closed before its file goes', async () => {
    FileSystem.__files.add(`${DIRECTORY}${BUNDLED_NAME}`);
    await DatabaseManagerService.openDatabase(asset);
    const old = SQLite.__handles[0];
    FileSystem.deleteAsync.mockImplementation(async (path) => {
      if (path === `${DIRECTORY}${BUNDLED_NAME}`) expect(old.closeAsync).toHaveBeenCalled();
      FileSystem.__files.delete(path);
    });

    FileSystem.__files.add(downloaded(bundled.version + 1));
    await DatabaseManagerService.openDatabase();
    SQLite.__collect(SQLite.__handles[SQLite.__handles.length - 1]);

    expect(SQLite.openDatabaseAsync).toHaveBeenLastCalledWith(`cpl-${bundled.compat}-v${bundled.version + 1}.db`);
    expect(DatabaseManagerService.openedDatabaseVersion()).toBe(bundled.version + 1);
    expect([...FileSystem.__files]).toEqual([downloaded(bundled.version + 1)]);
    await expect(DatabaseManagerService.executeQueryAsync('SELECT 1')).resolves.toEqual([{ ok: 1 }]);
  });

  test('if the database downloaded meanwhile does not open, the one open stays open', async () => {
    FileSystem.__files.add(`${DIRECTORY}${BUNDLED_NAME}`);
    await DatabaseManagerService.openDatabase(asset);
    FileSystem.__files.add(downloaded(bundled.version + 1));
    SQLite.openDatabaseAsync.mockImplementationOnce(async () => {
      throw new Error('file is not a database');
    });

    await DatabaseManagerService.openDatabase();
    SQLite.__collect(SQLite.__handles[SQLite.__handles.length - 1]);

    expect(SQLite.__handles).toHaveLength(1);
    expect(SQLite.__handles[0].closeAsync).not.toHaveBeenCalled();
    expect([...FileSystem.__files]).toEqual([`${DIRECTORY}${BUNDLED_NAME}`]);
    await expect(DatabaseManagerService.executeQueryAsync('SELECT 1')).resolves.toEqual([{ ok: 1 }]);
  });
});

test('currentDatabaseVersion is the newest one the app can read', async () => {
  expect(await DatabaseManagerService.currentDatabaseVersion()).toBe(bundled.version);

  FileSystem.__files.add(downloaded(bundled.version + 3));

  expect(await DatabaseManagerService.currentDatabaseVersion()).toBe(bundled.version + 3);
});

describe('the editions', () => {
  const spanish = (version) => `${DIRECTORY}cpl-${bundled.compat}-v${version}-es.db`;

  test('with another edition chosen, its newest database is opened and the Catalan one goes', async () => {
    await AsyncStorage.setItem('edicio', 'es');
    FileSystem.__files.add(`${DIRECTORY}${BUNDLED_NAME}`);
    FileSystem.__files.add(spanish(bundled.version + 2));

    await DatabaseManagerService.openDatabase(asset);

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(`cpl-${bundled.compat}-v${bundled.version + 2}-es.db`);
    expect(DatabaseManagerService.openedDatabaseEdition()).toBe('es');
    expect([...FileSystem.__files]).toEqual([spanish(bundled.version + 2)]);
  });

  test('while the phone has none of the chosen edition, the app prays with the one it carries', async () => {
    await AsyncStorage.setItem('edicio', 'es');

    await DatabaseManagerService.openDatabase(asset);

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(BUNDLED_NAME);
    expect(DatabaseManagerService.openedDatabaseEdition()).toBe('ca');
  });

  test('coming back to the Catalan edition copies the one inside the app again, on a reload without it', async () => {
    await AsyncStorage.setItem('edicio', 'es');
    FileSystem.__files.add(spanish(bundled.version + 2));
    await DatabaseManagerService.openDatabase(asset);

    await AsyncStorage.setItem('edicio', 'ca');
    // The reloads after a setting changes do not carry the asset
    await DatabaseManagerService.openDatabase();

    expect(FileSystem.copyAsync).toHaveBeenCalledWith({ from: asset.localUri, to: `${DIRECTORY}${BUNDLED_NAME}` });
    expect(SQLite.openDatabaseAsync).toHaveBeenLastCalledWith(BUNDLED_NAME);
    expect(DatabaseManagerService.openedDatabaseEdition()).toBe('ca');
  });

  test('a database of another edition is never taken for the Catalan one, however new', async () => {
    FileSystem.__files.add(spanish(bundled.version + 5));

    await DatabaseManagerService.openDatabase(asset);

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith(BUNDLED_NAME);
    expect([...FileSystem.__files]).toEqual([`${DIRECTORY}${BUNDLED_NAME}`]);
  });

  test('currentDatabaseVersion of an edition the phone does not have is 0', async () => {
    expect(await DatabaseManagerService.currentDatabaseVersion('es')).toBe(0);

    FileSystem.__files.add(spanish(bundled.version + 2));

    expect(await DatabaseManagerService.currentDatabaseVersion('es')).toBe(bundled.version + 2);
    expect(await DatabaseManagerService.currentDatabaseVersion('ca')).toBe(bundled.version);
  });

  test('the name of a database says its edition, and the Catalan ones keep the name of before', () => {
    expect(DatabaseManagerService.databaseFileName('s0-abc', 7)).toBe('cpl-s0-abc-v7.db');
    expect(DatabaseManagerService.databaseFileName('s0-abc', 7, 'es')).toBe('cpl-s0-abc-v7-es.db');
  });
});
