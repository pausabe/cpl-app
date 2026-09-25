// Which database is sitting in src/assets/db, so that a build is never a surprise.
//
// A build carries one language: whichever database Metro found. The descriptor beside it says which,
// and this checks that the two still match — a database copied in without its descriptor, or the
// other way round, would give the app a size and a checksum that are not the file's.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATABASE_FILE = join(ROOT, 'src', 'assets', 'db', 'cpl-app.db');
const DESCRIPTOR_FILE = `${DATABASE_FILE}.json`;

if (!existsSync(DATABASE_FILE)) {
  console.log('No database in src/assets/db: run make db-ca (Catalan) or make db-es (Spanish)');
  process.exit(0);
}

const descriptor = existsSync(DESCRIPTOR_FILE) ? JSON.parse(readFileSync(DESCRIPTOR_FILE, 'utf8')) : null;
// Catalan is what the publishing website sends, and it says nothing about a language because it has
// only ever had the one.
const language = descriptor?.language ?? 'ca';
const names = { ca: 'Catalan', es: 'Spanish' };

const bytes = statSync(DATABASE_FILE).size;
const megabytes = (bytes / 1024 / 1024).toFixed(1);
console.log(`Database in place: ${names[language] ?? language}, v${descriptor?.version ?? '?'} (${megabytes} MB)`);

if (!descriptor) {
  console.log('  ⚠ no descriptor beside it: the app cannot tell what this database is');
  process.exit(1);
}

const md5 = createHash('md5').update(readFileSync(DATABASE_FILE)).digest('hex');
if (descriptor.bytes !== bytes || descriptor.md5 !== md5) {
  console.log('  ⚠ the descriptor does not match the file: run make db-ca or make db-es again');
  process.exit(1);
}

// The checks call this to refuse to run against another language, which would fail by the hundred
// against goldens made from the Catalan texts.
const mustBeCatalan = process.argv.includes('--require-catalan');

if (language !== 'ca') {
  console.log('  Note: the interface stays Catalan — the doxology, «Beneïm el Senyor» and other texts');
  console.log('  live in the code, not in the database. Good for reading the texts, not for judging the app.');
  // The descriptor is in the repository, unlike the database beside it: committing this one would
  // have the publishing workflow ask the website for a database it does not have.
  console.log('  ⚠ src/assets/db/cpl-app.db.json is changed and IS tracked: do not commit it.');
  console.log('    Run make db-ca before pushing.');
  if (mustBeCatalan) {
    console.log('');
    console.log('  The goldens are Catalan: the tests cannot run against this. Run make db-ca first.');
    process.exit(1);
  }
}
