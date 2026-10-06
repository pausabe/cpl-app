// D-013: the cells the export copies from another cell (copied-cells.json). A copy is only right
// while its source is the text the target cell is for, so this checks it against the Spanish of
// the target: the heading names the same psalm, and the text is the one said under that heading.
//
//   npx jest migration-to-saints/copied-cells.test.js

const fs = require('fs');
const path = require('path');
const { psalmScore } = require('./lib/held-resolution');

const COMMONS = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts/commons';
const read = (lang, table) => JSON.parse(fs.readFileSync(path.join(COMMONS, lang, `${table}.json`), 'utf8'));
const { cells } = JSON.parse(fs.readFileSync(path.join(__dirname, 'copied-cells.json'), 'utf8'));

const tables = {};
const table = (lang, name) => (tables[`${lang}/${name}`] ??= read(lang, name));
const ca = { salmos_citas: table('ca', 'salmos_citas'), salmos_textos: table('ca', 'salmos_textos') };
const esCitas = table('es', 'salmos_citas');

test('every source has Catalan text', () => {
  for (const { from } of Object.values(cells)) {
    const [t, id] = from.split('/');
    expect([from, typeof table('ca', t)[id]]).toEqual([from, 'string']);
  }
});

test('a copied Mass reference is the one the Spanish of its cell says', () => {
  // The Rosary's Gospel (Lc 1,26-38) takes the Catalan of a cell the Spanish says word for word.
  const bare = (s) => String(s).replace(/_/g, '').replace(/\s+/g, ' ').trim();
  for (const [cell, { from }] of Object.entries(cells)) {
    if (!cell.startsWith('lecturas_referencia/')) continue;
    const es = table('es', 'lecturas_referencia');
    expect([cell, bare(es[from.split('/')[1]])]).toEqual([cell, bare(es[cell.split('/')[1]])]);
  }
});

test('a copied heading names the psalm the Spanish of its cell names', () => {
  for (const [cell, { from }] of Object.entries(cells)) {
    if (!cell.startsWith('salmos_citas/')) continue;
    const id = cell.split('/')[1];
    const source = ca.salmos_citas[from.split('/')[1]];
    expect([cell, psalmScore(source, esCitas[id]) > 0]).toEqual([cell, true]);
  }
});

test('a copied text is the one the psalter says under that same psalm', () => {
  // In the psalter the text cell is the heading cell's neighbour, which is how the index pairs
  // them (3455/3456, 4576/4577…); the copy's heading, one id down, names the psalm.
  for (const [cell, { from }] of Object.entries(cells)) {
    if (!cell.startsWith('salmos_textos/')) continue;
    const id = cell.split('/')[1];
    const heading = ca.salmos_citas[String(Number(from.split('/')[1]) - 1)];
    expect([cell, psalmScore(heading, esCitas[id]) > 0]).toEqual([cell, true]);
  }
});
