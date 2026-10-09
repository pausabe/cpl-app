// A copy of the bundled database with the table cpl-cloud's process X writes from litcal
// (calendar/src/colors.ts): the colour of each row of santsMemories, as the database writes colours.
// Only the rows of the days the tests use, with the colours litcal gives them (litcal e580b03), and
// one written wrong on purpose. CPL_DB has to point to it before anything opens the database.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const MEMORIAL_COLORS = [
  [367, 'R'], // Sants Cosme i Damià, màrtirs
  [381, 'R'], // Sants Dionís, bisbe, i companys, màrtirs
  [382, 'B'], // Sant Joan Leonardi, prevere
  [430, 'R'], // Sant Climent I, papa i màrtir
  [431, 'B'], // Sant Columbà, abat
  [457, 'B'], // Memòria de Santa Maria en dissabte
  [458, 'B'],
  // Sant Ignasi d’Antioquia, bisbe i màrtir, an obligatory memorial: red for litcal and for anyliturgic.
  // White here, so that it would show if the card took it.
  [390, 'B'],
];

function memorialColorsDatabase() {
  const copy = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cpl-memorial-colors-')), 'cpl-app.db');
  fs.copyFileSync(path.resolve(__dirname, '../../src/assets/db/cpl-app.db'), copy);
  const database = new DatabaseSync(copy);
  // The published databases already carry the table (from publication 9): these rows, and only these
  database.exec('DROP TABLE IF EXISTS _celebration_colors');
  database.exec('CREATE TABLE _celebration_colors (sants_memories_id INTEGER PRIMARY KEY, color TEXT NOT NULL)');
  const insert = database.prepare('INSERT INTO _celebration_colors (sants_memories_id, color) VALUES (?, ?)');
  for (const [row, color] of MEMORIAL_COLORS) insert.run(row, color);
  database.close();
  return copy;
}

module.exports = { MEMORIAL_COLORS, memorialColorsDatabase };
