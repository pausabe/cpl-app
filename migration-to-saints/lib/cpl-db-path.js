// The cpl-app database the migration reads. By default the one in place, which is the published
// one; CPL_DB points elsewhere, like the copy with the data fixes on top that `make db-fixed`
// leaves. It is the variable the tests' mock reads too (__tests__/helpers/mockDatabaseManager.js),
// so the app's services and the migration's own reads always see the same file.
const path = require('path');

module.exports = process.env.CPL_DB
  ? path.resolve(process.env.CPL_DB)
  : path.resolve(__dirname, '../../src/assets/db/cpl-app.db');
