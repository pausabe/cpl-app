// What the Mass has to come apart into, and the one thing that decides where each half goes.
//
// The risky part of the Mass is not the shape — it is that cpl-app offers up to three Masses
// for one date (what it prays, the weekday's, and yesterday's, which on Holy Saturday is the
// Easter Vigil) and saints-app has up to two columns for them. Nothing in either index says
// which goes where, so the join reads it off the citation already in the cell. These tests pin
// the two things that would break that silently:
//
//   1. the reference cell keeps the `_` the components split on, and the psalm deliberately
//      does NOT get a subtitle (its response lives inside the body, PLAN §18.2);
//   2. a Catalan citation and its Spanish twin fingerprint to the same token — including the
//      psalm, which the two languages abbreviate differently ("Sl" / "Sal"), and the canticle
//      that stands in for one ("Lectura Sálmica  Ex 15, …").
//
//   npx jest migration-to-saints/mass-fields.test.js

jest.mock('../src/services/databaseManagerService', () => require('../__tests__/helpers/mockDatabaseManager'));

const { buildSettings, resolveDay, extractMassFields, massCitation } = require('./lib/cpl-day-resolver');
const { fingerprint } = require('./lib/citation-key');

// A plain even-year weekday of Ordinary Time, the one the mapping was worked out against
// (`ordinary_time_19_wednesday__EVEN`), and Holy Saturday, which is where cpl-app keeps the
// Easter Vigil.
const WEEKDAY = '2026-08-12';
const HOLY_SATURDAY = '2026-04-04';

const resolved = {};

beforeAll(async () => {
  const settings = buildSettings({ dioceseName: 'Barcelona' });
  for (const ds of [WEEKDAY, HOLY_SATURDAY]) {
    const [y, m, d] = ds.split('-').map(Number);
    const { mass } = await resolveDay(new Date(y, m - 1, d), settings);
    resolved[ds] = {
      rendered: extractMassFields(mass && mass.rendered),
      ferial: extractMassFields(mass && mass.ferial),
    };
  }
}, 180000);

test('a reading keeps the `_` the components split on', () => {
  const ref = resolved[WEEKDAY].rendered.FIRSTLECTURE_ref;
  expect(ref).toBe('Ez 9,1-7;10,18-22: _Marca al front amb una creu els qui es planyen de les accions detestables comeses a Jerusalem_');
  // Citation, then subtitle: exactly what `formatTitleLectures()` renders as two pieces.
  expect(ref.split('_')).toHaveLength(3);
});

test('the psalm gets the book name and NO subtitle', () => {
  const ref = resolved[WEEKDAY].rendered.PSALM_ref;
  // cpl-app leaves the book off because its own screen prints "Salm responsorial" before it.
  expect(ref).toBe('Sl 112,1-2.3-4.5-6 (R.: 4b)');
  // No `_`: the response is inside the body, where cpl-app and the printed volume keep it,
  // and `formatTextLecture()` turns its `R.` into `℟`. Adding a subtitle here would print it
  // twice; stripping it from the body would be surgery on a liturgical text.
  expect(ref).not.toContain('_');
  expect(resolved[WEEKDAY].rendered.PSALM_texto).toMatch(/(^|\n)R\./);
});

test('a canticle standing in for the psalm is not given a psalm number', () => {
  // The Easter Vigil's third psalm is the canticle of Exodus 15. "Sl Ex 15…" would be wrong.
  expect(resolved[HOLY_SATURDAY].rendered.THIRDPSALM_ref).toMatch(/^Ex 15,/);
  expect(massCitation({ quote: 'Ex 15,1-2' }, true)).toBe('Ex 15,1-2');
  expect(massCitation({ quote: '112,1-2' }, true)).toBe('Sl 112,1-2');
});

test('an empty slot is never observed as a hyphen', () => {
  // cpl-app writes "-" where there is no second reading, and its own HasLiturgyContent()
  // treats that as empty. Filed as text it would be a hyphen in a shared cell.
  expect(resolved[WEEKDAY].rendered.SECONDLECTURE_ref).toBeUndefined();
  expect(resolved[WEEKDAY].rendered.SECONDLECTURE_texto).toBeUndefined();
  expect(massCitation({ quote: '-', comment: '-' }, false)).toBeNull();
});

test('the acclamation gets a text but never a reference', () => {
  // The reference cell holds the REFRAIN ("Aleluya, aleluya, aleluya"), which is not data in
  // cpl-app at all — it is a constant inside its own screen. Nothing here can supply it.
  expect(resolved[WEEKDAY].rendered.ACCLAMATION_texto).toBeTruthy();
  expect(resolved[WEEKDAY].rendered.ACCLAMATION_ref).toBeUndefined();
});

test('the Easter Vigil resolves on Holy Saturday, all seven readings of it', () => {
  const v = resolved[HOLY_SATURDAY].rendered;
  for (const role of ['FIRSTLECTURE', 'SECONDLECTURE', 'THIRDLECTURE', 'FOURTHLECTURE',
    'FIFTHLECTURE', 'SIXTHLECTURE', 'SEVENTHLECTURE', 'EIGHTHLECTURE', 'GOSPEL']) {
    expect(v[`${role}_ref`]).toBeTruthy();
    expect(v[`${role}_texto`]).toBeTruthy();
  }
  // The epistle the index numbers as the eighth reading is Romans 6.
  expect(v.EIGHTHLECTURE_ref).toMatch(/^Rm 6,/);
});

test('a Catalan citation fingerprints the same as its Spanish twin', () => {
  // This is what the join files by. If it stops holding, every cell silently goes unfilled —
  // which looks like "cpl-app had nothing", not like a bug.
  const pairs = [
    ['Ez 9,1-7;10,18-22', 'Ez 9, 17; 10, 18-22'],
    ['Sl 112,1-2.3-4.5-6 (R.: 4b)', 'Sal 112, 1-6'],
    ['Ex 15,1-2.3-4.5-6.17-18 (R.: 1a)', 'Lectura Sálmica  Ex 15, 1-2, 3-4, 5-6, 17-18'],
    ['Fets 10,34a.37-43', 'Hch 10, 34a.37-43'],
    ['Gn 1,1–2,2', 'Gn 1, 1-2, 2'],
    ['Jo 20,1-9', 'Jn 20, 1-9'],
  ];
  for (const [ca, es] of pairs) {
    expect(fingerprint(ca)).not.toBeNull();
    expect(fingerprint(ca).token).toBe(fingerprint(es).token);
  }
  // And two different readings must NOT collide: the feast of Peter and Paul keeps the vigil
  // Mass in the plain roles (Acts 3) and the day Mass in CELEBRATION_ (Acts 12). A rule keyed
  // on "proper or ferial" would have swapped them every year.
  expect(fingerprint('Fets 12,1-11').token).not.toBe(fingerprint('Hch 3, 1-10').token);
});
