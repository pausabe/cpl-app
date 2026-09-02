// Regression test for CPL-LIT-003 (see migration-to-saints/cpl-bugs/CPL-LIT-003.md).
//
// Psalm 66 is stored three times as pointed psalmody — Laudes of Wednesday week II, Vespers
// of the same day, and the Office of Readings of the Ember days of thanksgiving. Two of the
// three had lost the mediant asterisk on "La terra ha donat el seu fruit,", so the app
// printed one verse of the psalm without its pause where the other copy had it, and the
// migration saw one text spelled two ways: it split eprex cell salmos_textos/144 in two and
// withheld the Catalan text from the 50 celebrations that share it.
//
// This is a DATA fix, not a code fix: the correction lives in db-fixes/CPL-LIT-003.sql and
// is applied to src/Assets/db/cpl-app.db. That database is gitignored and comes from the
// Deployment website, so a freshly downloaded copy will NOT have the fix. This test is what
// tells you so — if it fails, run the .sql over the new database again.
//
// The copies are found by their text, not by id, so the test keeps working on a database
// whose ids have moved.

const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { textKey } = require('../../migration-to-saints/lib/text-key');

const DB_PATH = path.resolve(__dirname, '../../src/Assets/db/cpl-app.db');
const OPENING = 'Que Déu s’apiadi de nosaltres i ens beneeixi';
const VERSE = 'La terra ha donat el seu fruit,';

// Every column in the database that holds a copy of Psalm 66, split by whether it is
// pointed psalmody (carries * / † marks) or an unpointed copy. The unpointed ones are the
// responsorial psalm of the Mass and a devotional text: they have no marks anywhere by
// design and must stay that way, which is why the .sql goes by table and column.
const COPIES = [
  { table: 'salteriComuLaudes', column: 'salm3', pointed: true },
  { table: 'salteriComuVespres', column: 'salm2', pointed: true },
  { table: 'santsMemories', column: 'Salm2Ofici', pointed: true },
  { table: 'LDdiumenges', column: 'SalmText', pointed: false },
  { table: 'LDSantoral', column: 'SalmText', pointed: false },
  { table: 'diversos', column: 'oracio', pointed: false },
];

function read({ table, column }) {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const rows = db
    .prepare(`SELECT id, "${column}" AS text FROM "${table}" WHERE "${column}" LIKE ?`)
    .all(`%${OPENING}%`);
  db.close();
  return rows.map((r) => ({ table, column, id: r.id, text: String(r.text) }));
}

const pointed = COPIES.filter((c) => c.pointed).flatMap(read);
const unpointed = COPIES.filter((c) => !c.pointed).flatMap(read);
const where = (c) => `${c.table}/${c.id}.${c.column}`;

// A first half-verse is a line whose next non-empty line continues it — i.e. any line that
// is not itself a continuation. Those are the lines that carry the mediant mark.
function unmarkedFirstHalves(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const next = lines[i + 1];
    if (!line.trim() || !next || !next.trim()) continue;
    if (/[*†]/.test(line)) continue;
    if (/[*†]/.test(lines[i - 1] || '')) continue; // it is the second half of the verse above
    out.push(line.trim());
  }
  return out;
}

describe('Psalm 66 keeps its mediant mark in every pointed copy (CPL-LIT-003)', () => {
  it('the database holds all three pointed copies', () => {
    expect(pointed).toHaveLength(3);
  });

  it.each(pointed.map((c) => [where(c), c]))('%s points "La terra ha donat el seu fruit"', (_, copy) => {
    expect(copy.text).toContain(`${VERSE}    *`);
  });

  it.each(pointed.map((c) => [where(c), c]))('%s leaves no first half-verse unmarked', (_, copy) => {
    expect(unmarkedFirstHalves(copy.text)).toEqual([]);
  });

  // The point of the fix: the copies are the same text as far as the join is concerned, so
  // the shared eprex cell has one variant instead of two.
  it('the pointed copies of Vespers and Laudes share one textKey', () => {
    const keys = new Set(
      pointed
        .filter((c) => c.table.startsWith('salteriComu'))
        .map((c) => textKey(c.text))
    );
    expect(keys.size).toBe(1);
  });

  // The Mass responsorial and the devotional copy carry no marks at all. If the .sql ever
  // grew a global LIKE, this is what would catch it.
  it.each(unpointed.map((c) => [where(c), c]))('%s stays unpointed', (_, copy) => {
    expect(copy.text).not.toMatch(/[*†]/);
  });
});
