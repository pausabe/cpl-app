// Replaces src/Services/DatabaseManagerService in tests: the app's own queries run against
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
  databaseFileName: (compat, version) => `cpl-${compat}-v${version}.db`,
  bundledDatabaseInformation: () => bundled,
  currentDatabaseVersion: async () => bundled.version,
  // In tests the app always opens the database it carries inside
  openedDatabaseVersion: () => bundled.version,
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
