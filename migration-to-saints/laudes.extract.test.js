// The oldest tool of the migration, and now the smallest: proof that cpl-app's own engine runs
// in Node and answers for real calendar dates.
//
// It used to carry its own copy of the settings, of `isSpecialChristmas` and of the whole
// resolution — a third copy, beside the join's and the comparator's, all three reaching into
// `src/Services` by hand. They are one now, in `src/liturgy-export`, where `make types` reads
// them. What is left here is the smoke test: ask for four days of four different seasons and
// check that Lauds comes back with text in it.
//
//   npx jest migration-to-saints/laudes.extract.test.js
jest.mock('../src/services/databaseManagerService', () => require('../__tests__/helpers/mockDatabaseManager'));

const path = require('path');
const fs = require('fs');
const { resolveDayFields } = require('../src/liturgy-export');

const OUTPUT_DIR = path.resolve(__dirname, 'output/raw');

const SAMPLE_DATES = [
  '2026-07-23', // ordinary_time_16_thursday — a plain ferial Thursday
  '2026-02-12', // Santa Eulàlia — a Memory of the diocese of Barcelona only
  '2026-12-14', // Advent, where the psalter gives way to the day of the month
  '2026-04-05', // Easter season
];

test('resolves Lauds for a handful of known dates and dumps them for inspection', async () => {
  const results = [];
  for (const date of SAMPLE_DATES) {
    const day = await resolveDayFields(date, { dioceseName: 'Barcelona', hours: ['Laudes'], mass: false });
    results.push({ date, celebration: day.celebration, laudes: day.hours.Laudes });
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'laudes-sample.json'), JSON.stringify(results, null, 2), 'utf8');

  expect(results).toHaveLength(SAMPLE_DATES.length);
  for (const r of results) {
    // Every day of the year has a hymn, three psalms and a collect, whatever the season.
    expect(r.laudes.himno).toBeTruthy();
    expect(r.laudes.primer_salmo_texto).toBeTruthy();
    expect(r.laudes.oracion_final).toBeTruthy();
  }
}, 120000);
