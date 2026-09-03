// On-demand extractor for the day comparator: resolves cpl-app's real liturgy for the
// dates given in DATES and dumps it as JSON, so the dashboard can show cpl-app's text next
// to what saints-app will render — without opening either app on a phone.
//
// It is a Jest file for the same reason the join is (see join-content.test.js): cpl-app's
// Services need the RN/expo globals the `jest-expo` preset mocks, and their only DB seam is
// `DatabaseManagerService`, replaced below by a real read-only SQLite connection. All the
// liturgy logic itself is cpl-app's own, untouched.
//
// Run with: DATES=2026-08-14 OUT=/tmp/day.json npx jest migration-to-saints/cpl-day.test.js --silent

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.resolve(__dirname, '../src/Assets/db/cpl-app.db');

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

const { resolveDayForComparison } = require('./lib/cpl-day-resolver');

const DATES = (process.env.DATES || '').split(',').map((d) => d.trim()).filter(Boolean);
const DIOCESE = process.env.DIOCESE || 'Barcelona';
const PRAYING_PLACE = process.env.PRAYING_PLACE || 'Diòcesi';
const HOURS = (process.env.HOURS || 'Laudes,Vespers').split(',').map((h) => h.trim()).filter(Boolean);
const OUT = process.env.OUT || path.resolve(__dirname, 'output/raw/cpl-day.json');

// cpl-app.db only holds a fixed span of liturgical years, and resolving day D reaches two
// days ahead (D's first Vespers needs D+1, whose own information asks for D+2). Outside
// that span cpl-app throws on an empty row, so the comparator says so instead.
function yearsCovered() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const years = new Set(db.prepare('SELECT DISTINCT any AS y FROM anyliturgic').all().map((r) => String(r.y)));
  db.close();
  return years;
}

// This file is a tool, not a check: without DATES there is nothing to extract, so a plain
// `npm test` skips it instead of failing on a missing environment variable.
const maybe = DATES.length ? test : test.skip;

describe('cpl-app day extraction (comparator)', () => {
  maybe('resolves every requested date and writes them to OUT', async () => {
    const covered = yearsCovered();
    const days = {};

    for (const dateStr of DATES) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const yearsNeeded = [0, 1, 2].map((offset) => String(new Date(Date.UTC(y, m - 1, d + offset)).getUTCFullYear()));
      if (!yearsNeeded.every((yy) => covered.has(yy))) {
        days[dateStr] = {
          error:
            `cpl-app.db no cobreix ${dateStr} (li calen els anys litúrgics ` +
            `${[...new Set(yearsNeeded)].join(', ')}).`,
        };
        continue;
      }
      try {
        days[dateStr] = await resolveDayForComparison(dateStr, {
          diocese: DIOCESE,
          prayingPlace: PRAYING_PLACE,
          hours: HOURS,
        });
      } catch (e) {
        days[dateStr] = { error: `cpl-app no ha pogut resoldre ${dateStr}: ${String(e && e.message ? e.message : e)}` };
      }
    }

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ diocese: DIOCESE, prayingPlace: PRAYING_PLACE, hours: HOURS, days }, null, 2), 'utf8');
    expect(Object.keys(days).length).toBe(DATES.length);
  }, 120000);
});
