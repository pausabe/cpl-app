// What the Office of Readings has to come apart into, and why it can't be simplified.
//
// Two of the three shapes `extractOfficeFields` produces look like decoration and are not:
//
//   1. `lectura_*_cita_a` carries TWO lines in one cell, separated by a literal `$`.
//      `OfficeFirstLecture.vue` and `OfficeSecondLecture.vue` render `split("$")[0]` as its
//      own paragraph and `split("$")[1]` in the `reference-bible` style beside the title.
//      Write the citation as one plain string and that second slot goes blank on every day
//      of the year — silently, because nothing throws and the page still renders.
//
//   2. the responsory after each reading is THREE ids, not two and not six: a blank, then
//      `℟. First * Second`, then `℣. Third * Second`. The short responsory of Laudes and
//      Vespers is six lines and the little Hours' is two; pairing the wrong helper with the
//      Office would file three texts under two cells and lose one for good.
//
// Both are asserted against a day resolved by cpl-app itself, not a fixture, so a change in
// the model reaches this test instead of reaching commons/ca.
//
//   npx jest migration-to-saints/office-fields.test.js

const path = require('path');

jest.mock('../src/Services/SettingsService', () => {
  const DioceseName = {
    Andorra: 'Andorra', Barcelona: 'Barcelona', Girona: 'Girona', Lleida: 'Lleida',
    Mallorca: 'Mallorca', Menorca: 'Menorca', SantFeliu: 'Sant Feliu de Llobregat',
    Solsona: 'Solsona', Tarragona: 'Tarragona', Terrassa: 'Terrassa', Tortosa: 'Tortosa',
    Urgell: 'Urgell', Vic: 'Vic',
  };
  const PrayingPlace = { Diocese: 'Diòcesi', City: 'Ciutat', Cathedral: 'Catedral' };
  return { __esModule: true, DioceseName, PrayingPlace, default: {} };
});

jest.mock('../src/Services/DatabaseManagerService', () => {
  const path = require('path');
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
  return {
    executeQueryAsync: (query) => {
      try {
        return Promise.resolve(db.prepare(query).all());
      } catch (e) {
        return Promise.reject(e);
      }
    },
  };
});

const {
  buildSettings, resolveDay, extractOfficeFields, officeCitation, readingResponsoryParts,
} = require('./lib/cpl-day-resolver');

// A plain ordinary-time weekday with both readings and both responsories, and the one the
// mapping was worked out against: `ordinary_time_19_wednesday`, whose Spanish cells
// (oficio_citas/410, responsorios/12507-12509) are quoted in PLAN §17.
const DATE = '2026-08-12';

let fields;

beforeAll(async () => {
  const [y, m, d] = DATE.split('-').map(Number);
  const { hoursLiturgy } = await resolveDay(new Date(y, m - 1, d), buildSettings({ dioceseName: 'Barcelona' }));
  fields = extractOfficeFields(hoursLiturgy.Office);
}, 120000);

test('the citation keeps the `$` the components split on', () => {
  for (const key of ['lectura_biblica_cita_a', 'lectura_patristica_cita_a']) {
    const cita = fields[key];
    expect(typeof cita).toBe('string');
    const parts = cita.split('$');
    // Exactly one separator: two halves plus the empty tail `es` also leaves behind.
    expect(parts).toHaveLength(3);
    expect(parts[0].trim()).not.toBe('');
    expect(parts[1].trim()).not.toBe('');
  }
  // The book, then the chapter and verses — cpl-app's own two halves, not a re-cut.
  expect(fields.lectura_biblica_cita_a).toBe('Del llibre del profeta Miquees $4, 1-7 $');
});

test('each reading responsory is three parts, in the order the index stores them', () => {
  for (const key of ['responsorio2_a', 'responsorio3_a']) {
    const parts = fields[key];
    expect(Array.isArray(parts)).toBe(true);
    expect(parts).toHaveLength(3);
    expect(parts[0].trim()).toBe('');           // the blank `es` keeps there; nothing renders it
    expect(parts[1].startsWith('℟. ')).toBe(true);
    expect(parts[2].startsWith('℣. ')).toBe(true);
    // The second half of the responsory is repeated in both lines, after the asterisk.
    const refrain = parts[1].split(' * ')[1];
    expect(refrain).toBeTruthy();
    expect(parts[2].endsWith(` * ${refrain}`)).toBe(true);
  }
});

test('the psalmody responsory is the versicle/response pair, not the six-line one', () => {
  expect(fields.responsorio1).toHaveLength(2);
  expect(fields.responsorio1[0].startsWith('℣. ')).toBe(true);
  expect(fields.responsorio1[1].startsWith('℟. ')).toBe(true);
});

test('no `_i`/`_p` cell is ever produced', () => {
  // Catalan is not in `LanguageFeatures.biennialReadings`, so the app never opens them.
  // Producing them would file cpl-app's single cycle under three ids as if it were three.
  const biennial = Object.keys(fields).filter((k) => /_(i|p)$/.test(k));
  expect(biennial).toEqual([]);
});

test('a reading with only one half of the citation is not given a phantom separator', () => {
  expect(officeCitation({ Reference: 'Del llibre de Josuè', Quote: '' })).toBe('Del llibre de Josuè');
  expect(officeCitation({ Reference: '', Quote: '24, 1-7' })).toBe('24, 1-7');
  expect(officeCitation({})).toBeNull();
  expect(officeCitation(null)).toBeNull();
});

test('a responsory with nothing in it produces no cells at all', () => {
  // The third and fourth readings are empty on every ordinary day; observing a `℟.  * `
  // for them would put three sigils with no text into three shared cells.
  expect(readingResponsoryParts({ Responsory: {} })).toBeNull();
  expect(readingResponsoryParts({})).toBeNull();
  expect(readingResponsoryParts(null)).toBeNull();
});
