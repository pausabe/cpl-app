// Puts in src/assets/db the database cpl-cloud's process X has just written: the same one, with the
// same texts, and the calendar (anyliturgic) out of litcal from 2017 to 2100. make db-infinite calls it.
//
// The descriptor beside it keeps the version of the publication it comes from, as the app has to have
// one, and says the calendar is generated: it is not a publication, and make db-which says so. The
// phones do not have it until it is published on the website, which is where this same file goes.
import { createHash } from 'node:crypto';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATABASE_FILE = join(ROOT, 'src', 'assets', 'db', 'cpl-app.db');
const DESCRIPTOR_FILE = `${DATABASE_FILE}.json`;

const [written] = process.argv.slice(2);
if (!written) {
  console.error('Usage: node scripts/infiniteDatabase.mjs <the cpl-app.db process X wrote>');
  process.exit(1);
}

const before = JSON.parse(readFileSync(DESCRIPTOR_FILE, 'utf8'));
const database = new DatabaseSync(written, { readOnly: true });
const table = (name) =>
  database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) !== undefined;
const stamp = table('_publication') ? database.prepare('SELECT version FROM _publication').get() : undefined;
const calendar = table('_calendar')
  ? database.prepare('SELECT litcal, first_day, last_day FROM _calendar').get()
  : undefined;
database.close();
if (!calendar) {
  console.error(`${written} does not say where its calendar comes from: it is not what process X writes`);
  process.exit(1);
}

copyFileSync(written, DATABASE_FILE);
const bytes = readFileSync(DATABASE_FILE);
const descriptor = {
  version: stamp?.version ?? before.version,
  compat: before.compat,
  md5: createHash('md5').update(bytes).digest('hex'),
  bytes: bytes.length,
  calendar: `${calendar.litcal}, ${calendar.first_day} – ${calendar.last_day}`,
};
writeFileSync(DESCRIPTOR_FILE, `${JSON.stringify(descriptor, null, 2)}\n`);
console.log(`In place: the calendar from ${calendar.first_day} to ${calendar.last_day} (${calendar.litcal})`);
