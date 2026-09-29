// Replaces src/services/databaseManagerService in tests: the app's own queries run against
// src/assets/db/cpl-app.db through node:sqlite instead of expo-sqlite. Everything above this
// seam is the app's unmodified code.
//
// CPL_DB points it to another database, like the one cpl-cloud's process X writes from litcal
// (see __tests__/liturgy/litcalSweep.test.js). The goldens are made from the bundled one.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.CPL_DB
  ? path.resolve(process.env.CPL_DB)
  : path.resolve(__dirname, '../../src/assets/db/cpl-app.db');
const bundled = require('../../src/assets/db/cpl-app.db.json');
let db;

function database() {
  if (!db) db = new DatabaseSync(DB_PATH, { readOnly: true });
  return db;
}

module.exports = {
  DB_PATH,
  DATABASE_DIRECTORY: 'file:///docs/SQLite/',
  databaseFileName: (compat, version, edition = 'ca') =>
    edition === 'ca' ? `cpl-${compat}-v${version}.db` : `cpl-${compat}-v${version}-${edition}.db`,
  bundledDatabaseInformation: () => ({ ...bundled, edition: bundled.language ?? 'ca' }),
  currentDatabaseVersion: async () => bundled.version,
  // In tests the app always opens the database it carries inside
  openedDatabaseVersion: () => bundled.version,
  // The one the database says it is, so that CPL_DB can point to another edition
  openedDatabaseEdition: () => {
    const edition = database()
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = '_edition'")
      .get();
    return edition ? database().prepare('SELECT language FROM _edition').get().language : 'ca';
  },
  openDatabase: async () => {
    database();
  },
  executeQueryAsync: (query) => {
    try {
      return Promise.resolve(database().prepare(query).all());
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
