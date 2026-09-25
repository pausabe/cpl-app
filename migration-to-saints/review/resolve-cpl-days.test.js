// Resolves the review dates with cpl-app's own engine and writes them where the rest of the
// review reads them.
//
// It used to carry its own copy of the resolution, because `cpl-day-resolver.js` took the ferial
// Vespers control from `hoursLiturgy.vespersOptions.vespersWithoutCelebration` — the very object
// `mergeVespersWithCelebration` writes the celebration into — and so marked every field of Vespers
// as ferial and invented a divergence on every memorial (MIGRA-001). The control is now taken
// afresh inside `src/liturgy-export/resolveDay.ts`, once, for everybody, so the copy is gone and
// this file is the one line it should always have been.
//
//   DATES=2026-09-08 OUT=migration-to-saints/review/run/cpl-days.json \
//     npx jest migration-to-saints/review/resolve-cpl-days.test.js --silent
jest.mock('../../src/services/databaseManagerService', () => require('../../__tests__/helpers/mockDatabaseManager'));

const fs = require('fs');
const { resolveDayForComparison } = require('../lib/cpl-day-resolver');

// The Office of Readings first: it may be said at any hour, but the volumes print it at the head.
const HOURS = ['Office', 'Laudes', 'Tercia', 'Sexta', 'Nona', 'Vespers', 'Mass'];

const DATES = (process.env.DATES || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const OUT = process.env.OUT;
const DIOCESE = process.env.DIOCESE || 'Barcelona';
const PRAYING_PLACE = process.env.PRAYING_PLACE || 'Diòcesi';

// A tool, not a check: with no dates to resolve there is nothing to do, and a bare `make tests`
// must not go red because nobody asked it for a day.
const testOrSkip = DATES.length && OUT ? test : test.skip;

testOrSkip('resolves the dates with a correct Vespers ferial control', async () => {
  const days = {};
  for (const dateStr of DATES) {
    const day = await resolveDayForComparison(dateStr, {
      diocese: DIOCESE,
      prayingPlace: PRAYING_PLACE,
      hours: HOURS,
    });
    days[dateStr] = day;
    console.log(`${dateStr}  L=${day.ferialFields.Laudes.length}  V=${day.ferialFields.Vespers.length}`);
  }
  fs.writeFileSync(OUT, JSON.stringify({ diocese: DIOCESE, prayingPlace: PRAYING_PLACE, hours: HOURS, days }, null, 2), 'utf8');
  expect(Object.keys(days).length).toBe(DATES.length);
}, 300000);
