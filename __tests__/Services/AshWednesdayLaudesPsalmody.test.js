// Regression test for CPL-LIT-001 (see migration-to-saints/cpl-bugs/CPL-LIT-001.md).
//
// Ash Wednesday's Laudes takes the penitential psalmody of FRIDAY of week III — Ps 50,
// the canticle of Jeremiah 14, 17-21 and Ps 99 — while the rest of the day, and the three
// days that follow it, run in week IV. cpl-app used to fall through to the running
// psalter and print Wednesday of week IV (Ps 107) on every Ash Wednesday from 2017 to
// 2026. The neighbouring days are asserted too, because the temptation when fixing this
// is to move the whole four-day block, and only the Wednesday moves.
//
// This drives cpl-app's own Services against the shipped DB, so it fails if the routing
// in LiturgyMastersService regresses OR if the psalter rows themselves are edited.

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

jest.mock('../../src/Services/SettingsService', () => {
  const DioceseName = {
    Andorra: 'Andorra', Barcelona: 'Barcelona', Girona: 'Girona', Lleida: 'Lleida',
    Mallorca: 'Mallorca', Menorca: 'Menorca', SantFeliu: 'Sant Feliu de Llobregat',
    Solsona: 'Solsona', Tarragona: 'Tarragona', Terrassa: 'Terrassa', Tortosa: 'Tortosa',
    Urgell: 'Urgell', Vic: 'Vic',
  };
  const PrayingPlace = { Diocese: 'Diòcesi', City: 'Ciutat', Cathedral: 'Catedral' };
  return { __esModule: true, DioceseName, PrayingPlace, default: {} };
});

jest.mock('../../src/Services/DatabaseManagerService', () => {
  const path = require('path');
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.resolve(__dirname, '../../src/Assets/db/cpl-app.db'), { readOnly: true });
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

const { resolveDayForComparison } = require('../../migration-to-saints/lib/cpl-day-resolver');

const DB_PATH = path.resolve(__dirname, '../../src/Assets/db/cpl-app.db');

// Resolving a day reaches two days ahead (first Vespers needs tomorrow, which asks for
// ITS tomorrow), so a date is only testable when three liturgical years are in the DB.
function coveredYears() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const years = new Set(db.prepare('SELECT DISTINCT any AS y FROM anyliturgic').all().map((r) => String(r.y)));
  db.close();
  return years;
}

const YEARS = coveredYears();
const testable = (date) =>
  [0, 1, 2].every((offset) => {
    const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + offset));
    return YEARS.has(String(d.getUTCFullYear()));
  });

const laudesCitations = async (date) => {
  const day = await resolveDayForComparison(date, { hours: ['Laudes'] });
  const l = day.hours.Laudes;
  return [l.primer_salmo_cita, l.segundo_salmo_cita, l.tercer_salmo_cita].map((c) =>
    String(c).replace(/\s+/g, ' ').trim()
  );
};

const ASH_WEDNESDAYS = ['2017-03-01', '2018-02-14', '2019-03-06', '2020-02-26', '2021-02-17',
  '2022-03-02', '2023-02-22', '2024-02-14', '2025-03-05', '2026-02-18'];

describe('Ash Wednesday Laudes psalmody (CPL-LIT-001)', () => {
  const dates = ASH_WEDNESDAYS.filter(testable);

  it('has dates to check', () => expect(dates.length).toBeGreaterThan(0));

  it.each(dates)('%s uses Friday of week III: Ps 50 / Jr 14 / Ps 99', async (date) => {
    const [first, second, third] = await laudesCitations(date);
    expect(first).toMatch(/^Salm 50\b/);
    expect(second).toMatch(/^Càntic Jr 14, 17-21\b/);
    expect(third).toMatch(/^Salm 99\b/);
  });

  // The three days after Ash Wednesday are NOT part of the exception: they run in week IV
  // like the rest of the block, which cpl-app already got right.
  it('the Thursday after keeps Thursday of week IV', async () => {
    const date = '2022-03-03';
    if (!testable(date)) return;
    const [first, , third] = await laudesCitations(date);
    expect(first).toMatch(/^Salm 142\b/);
    expect(third).toMatch(/^Salm 146\b/);
  });

  // Good Friday reaches the same Ps 50 by a different route (an explicit proper in
  // tempsQuaresmaTridu, Friday of week II). Pinned so the fix can't be "generalised" into
  // sending every penitential day to week III.
  it('Good Friday keeps its own proper: Ps 50 / Ha 3 / Ps 147', async () => {
    const date = '2022-04-15';
    if (!testable(date)) return;
    const [first, second, third] = await laudesCitations(date);
    expect(first).toMatch(/^Salm 50\b/);
    expect(second).toMatch(/^Càntic Ha 3\b/);
    expect(third).toMatch(/^Salm 147\b/);
  });
});
