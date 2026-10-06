// What the Mass has to come apart into, and the one thing that decides where each half goes.
//
// The risky part of the Mass is not the shape — it is that cpl-app offers up to three Masses
// for one date (what it prays, the weekday's, and yesterday's, which on Holy Saturday is the
// Easter Vigil) and saints-app has up to two columns for them. Nothing in either index says
// which goes where, so the join reads it off the citation already in the cell. These tests pin
// the two things that would break that silently:
//
//   1. the reference cell keeps the `_` the components split on, and the psalm's subtitle is its
//      response, taken out of the body, as the index keeps it in every language (D-017);
//   2. a Catalan citation and its Spanish twin fingerprint to the same token — including the
//      psalm, which the two languages abbreviate differently ("Sl" / "Sal"), and the canticle
//      that stands in for one ("Lectura Sálmica  Ex 15, …").
//
//   npx jest migration-to-saints/mass-fields.test.js

jest.mock('../src/services/databaseManagerService', () => require('../__tests__/helpers/mockDatabaseManager'));

const { buildSettings, resolveDay, extractMassFields, massCitation } = require('./lib/cpl-day-resolver');
const { splitPsalmResponse } = require('../src/liturgy-export/indexFields');
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

test('the psalm gets the book name, and its response as the subtitle', () => {
  const ref = resolved[WEEKDAY].rendered.PSALM_ref;
  // cpl-app leaves the book off because its own screen prints "Salm responsorial" before it.
  expect(ref).toMatch(/^Sl 112,1-2\.3-4\.5-6 \(R\.: 4b\): _.+_$/);
  expect(ref.split('_')).toHaveLength(3);
  // The body keeps a bare `R.` after every stanza, the first one too, and the response nowhere.
  const body = resolved[WEEKDAY].rendered.PSALM_texto;
  const response = ref.split('_')[1];
  expect(body).not.toContain(response);
  expect(body).not.toMatch(/(^|\n)R\.\s*\S/);
  expect(body.split(/\n\s*\n/).every((stanza) => /\sR\.?$/.test(stanza.trimEnd()))).toBe(true);
});

describe('the response comes out of the body only where there is one to take (D-017)', () => {
  // Ps 138 on the Tuesday of week 27, even years: the response is a paragraph of its own.
  const TUESDAY_XXVII = 'Heu penetrat els meus secrets, Senyor,\ni em coneixeu,\n'
    + 'us són coneguts tots els meus passos.\n\nR. Guieu-me, Senyor, per camins eterns.\n\n'
    + 'Vós heu creat el meu interior,\nm’heu teixit en les entranyes de la mare. R.';

  test('a paragraph of its own, and the first stanza takes the mark', () => {
    expect(splitPsalmResponse(TUESDAY_XXVII)).toEqual({
      response: 'Guieu-me, Senyor, per camins eterns.',
      body: 'Heu penetrat els meus secrets, Senyor,\ni em coneixeu,\nus són coneguts tots els meus passos. R.\n\n'
        + 'Vós heu creat el meu interior,\nm’heu teixit en les entranyes de la mare. R.',
    });
  });

  test('a response of several lines becomes one', () => {
    const ps8 = 'Quan miro el cel.\n\nR. Senyor, sobirà nostre,\nque n’és, de gloriós,\nel vostre nom!\n\nGairebé l’heu igualat als àngels. R.';
    expect(splitPsalmResponse(ps8).response).toBe('Senyor, sobirà nostre, que n’és, de gloriós, el vostre nom!');
  });

  test('one line inside the text, as the Easter Vigil prints Ps 18', () => {
    const ps18 = 'dona seny als ignorants.\nR. Senyor, vós teniu paraules de vida eterna.\nEls preceptes del Senyor són planers,\nil·luminen els ulls. R.';
    expect(splitPsalmResponse(ps18)).toEqual({
      response: 'Senyor, vós teniu paraules de vida eterna.',
      body: 'dona seny als ignorants. R.\nEls preceptes del Senyor són planers,\nil·luminen els ulls. R.',
    });
  });

  test('a response spelled out after every stanza stays where it is', () => {
    const ps135 = 'Enaltiu el Senyor: que n’és, de bo.\nR. Perdura eternament el seu amor.\n\n'
      + 'Quan vam sofrir humiliacions,\nes recordà de nosaltres.\nR. Perdura eternament el seu amor.';
    expect(splitPsalmResponse(ps135)).toBeNull();
    expect(splitPsalmResponse('Feliç l’home que venera el Senyor.')).toBeNull();
  });
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

// MIGRA-019: on a memorial without readings of its own cpl-app prays the weekday's Mass, and the
// review copied it into the saint's column as well — Jb 9 beside 2 Tm 3 on Saint Jerome's day,
// three "divergences" that were nobody's. The saint's column must come back empty there, and
// still full on a memorial that does have its own Mass in cpl-app (the Guardian Angels).
describe('the two columns of a memorial', () => {
  const { resolveDayForComparison } = require('./lib/cpl-day-resolver');
  const celebrationKeys = (mass) => Object.keys(mass).filter((k) => k.startsWith('CELEBRATION_'));

  test('Saint Jerome, who has none in cpl-app, gives the weekday and nothing for the saint', async () => {
    const day = await resolveDayForComparison('2026-09-30', { hours: ['Mass'] });
    expect(day.hours.Mass.GOSPEL_ref).toMatch(/^Lc 9,57-62/);
    expect(celebrationKeys(day.hours.Mass)).toEqual([]);
  }, 180000);

  test('the Guardian Angels, who have their own, still fill the saint\'s column', async () => {
    const day = await resolveDayForComparison('2026-10-02', { hours: ['Mass'] });
    expect(day.hours.Mass.CELEBRATION_FIRSTLECTURE_ref).toMatch(/^Ex 23,20-23a/);
    expect(day.hours.Mass.FIRSTLECTURE_ref).not.toMatch(/^Ex 23/);
  }, 180000);
});
