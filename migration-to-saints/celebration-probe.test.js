// Asks cpl-app itself, for every date of the current manifest window: "what are you
// celebrating today?" — and writes the answers to output/cpl-celebrations.json.
//
// The join already knows what TEXT cpl-app gives each day, but not WHY. When a day's
// content disagrees with every other day sharing its cell, the useful question is not
// "which text wins" but "is cpl-app celebrating something litcal never told us about?".
// Answering that needs cpl-app's own verdict for the day (its celebration name and
// M/F/S/L/V rank), which the join deliberately does not record for ferial litcal keys
// (see join-content.test.js, HOURS_CONFIG.Celebration: writing a saint's name into a
// weekday cell would pin it there forever).
//
// So this is a separate, read-only pass over the same dates. It touches none of the
// join's outputs; missing-celebrations.js is what turns this dump into a verdict.
//
// Run with: npx jest migration-to-saints/celebration-probe.test.js --silent
// (~25 ms per date: a 10-year window is a minute and a half)

const path = require('path');
const fs = require('fs');

const MANIFEST_PATH = path.resolve(__dirname, 'webui/run/date-to-key-manifest.json');
// OUT_DIR sends it somewhere else, as it does the join: make tests runs it on the database in
// place, and the real output is built from the fixed copy (MIGRA-024).
const OUTPUT_PATH = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR, 'cpl-celebrations.json')
  : path.resolve(__dirname, 'output/cpl-celebrations.json');

const DIOCESE_NAME = process.env.DIOCESE || 'Barcelona';
const PRAYING_PLACE = 'Diòcesi';

jest.mock('../src/services/databaseManagerService', () => require('../__tests__/helpers/mockDatabaseManager'));

// Same settings the join uses, so the probe answers for the same app the join extracted from.
// `optionalFestivityEnabled: false` matters here: with optional memorials switched off, an `L`/`V`
// day serves the plain ferial office, which is exactly why those days never contest a cell and must
// not be reported as a missing celebration.
//
// Neither the weekday twins nor the Mass are asked for: this probe only wants to know WHAT cpl-app
// celebrates, and over 3.650 dates the two of them are most of the run.
const { resolveDayFields } = require('../src/liturgy-export');

describe('cpl-app celebration probe', () => {
  test('records the celebration cpl-app reports for every date of the manifest', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const dates = Object.keys(manifest).sort();
    expect(dates.length).toBeGreaterThan(0);

    const days = {};
    const failed = [];

    for (const dateStr of dates) {
      try {
        const { celebration } = await resolveDayFields(dateStr, {
          dioceseName: DIOCESE_NAME,
          prayingPlace: PRAYING_PLACE,
          hours: [],
          ferial: false,
          mass: false,
        });
        days[dateStr] = {
          // '' for a plain ferial day: cpl-app only names a celebration when there is one.
          title: (celebration.title || '').trim(),
          // 'S' Solemnity · 'F' Festivity · 'M' Memory · 'L'/'V' optional · '-' ferial.
          type: celebration.celebrationType || '-',
          time: celebration.specificLiturgyTime,
        };
      } catch (e) {
        failed.push({ date: dateStr, error: String(e && e.message ? e.message : e) });
      }
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(
        {
          diocese: DIOCESE_NAME,
          prayingPlace: PRAYING_PLACE,
          generatedAt: new Date().toISOString(),
          dateCount: Object.keys(days).length,
          failed,
          days,
        },
        null,
        1
      ),
      'utf8'
    );

    console.log(
      `cpl-app ha respost per ${Object.keys(days).length}/${dates.length} dates` +
        (failed.length ? ` (${failed.length} han fallat, veure "failed" al fitxer)` : '')
    );
    // Resolving a day also resolves the NEXT one (first Vespers), so the very last date
    // of cpl-app's own `anyliturgic` range has no tomorrow to read and always fails —
    // the same edge the join reports as `skippedOutOfRange`. Anything failing further
    // inside the window is a real problem and must not pass silently.
    const lastDate = dates[dates.length - 1];
    expect(failed.filter((f) => f.date !== lastDate)).toEqual([]);
  }, 1800000);
});
