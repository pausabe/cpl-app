// Regression test for CPL-LIT-001 (see migration-to-saints/cpl-bugs/CPL-LIT-001.md).
//
// Ash Wednesday's Laudes takes the penitential psalmody of FRIDAY of week III — Ps 50,
// the canticle of Jeremiah 14, 17-21 and Ps 99 — while the rest of the day, and the three
// days that follow it, run in week IV. cpl-app used to fall through to the running
// psalter and print Wednesday of week IV (Ps 107) on every Ash Wednesday from 2017 to
// 2026. The neighbouring days are asserted too, because the temptation when fixing this
// is to move the whole four-day block, and only the Wednesday moves.
//
// Each day is loaded the way the app loads it, against the database under test, so this
// fails if the routing in liturgyMastersService regresses OR if the psalter rows themselves
// are edited. Merges have dropped that routing twice without a conflict: this is what says so.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { DatabaseSync } = require('node:sqlite');
const { DB_PATH } = require('../helpers/mockDatabaseManager');
const { loadDay } = require('../helpers/liturgyDay');

// Loading a day reaches two days ahead (first Vespers needs tomorrow, which asks for ITS
// tomorrow), so a date is only testable when the years of all three are in the database.
function coveredYears() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const years = new Set(
    db
      .prepare('SELECT DISTINCT any AS y FROM anyliturgic')
      .all()
      .map((r) => String(r.y)),
  );
  db.close();
  return years;
}

const YEARS = coveredYears();
const testable = (date) =>
  [0, 1, 2].every((offset) => {
    const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + offset));
    return YEARS.has(String(d.getUTCFullYear()));
  });

// The titles of the three psalms, as the screen shows them: «Salm 50 \nOració de penediment»
const laudesPsalms = async (date) => {
  const { laudes } = (await loadDay(date)).hours;
  return [laudes.firstPsalm, laudes.secondPsalm, laudes.thirdPsalm].map((psalm) =>
    String(psalm.title).replace(/\s+/g, ' ').trim(),
  );
};

const ASH_WEDNESDAYS = [
  '2017-03-01',
  '2018-02-14',
  '2019-03-06',
  '2020-02-26',
  '2021-02-17',
  '2022-03-02',
  '2023-02-22',
  '2024-02-14',
  '2025-03-05',
  '2026-02-18',
];

describe('Ash Wednesday Laudes psalmody (CPL-LIT-001)', () => {
  const dates = ASH_WEDNESDAYS.filter(testable);

  it('has dates to check', () => expect(dates.length).toBeGreaterThan(0));

  it.each(dates)('%s uses Friday of week III: Ps 50 / Jr 14 / Ps 99', async (date) => {
    const [first, second, third] = await laudesPsalms(date);
    expect(first).toMatch(/^Salm 50\b/);
    expect(second).toMatch(/^Càntic Jr 14, 17-21\b/);
    expect(third).toMatch(/^Salm 99\b/);
  });

  // The three days after Ash Wednesday are NOT part of the exception: they run in week IV
  // like the rest of the block, which cpl-app already got right.
  it('the Thursday after keeps Thursday of week IV', async () => {
    const date = '2022-03-03';
    if (!testable(date)) return;
    const [first, , third] = await laudesPsalms(date);
    expect(first).toMatch(/^Salm 142\b/);
    expect(third).toMatch(/^Salm 146\b/);
  });

  // Good Friday reaches the same Ps 50 by a different route (an explicit proper in
  // tempsQuaresmaTridu, Friday of week II). Pinned so the fix can't be "generalised" into
  // sending every penitential day to week III.
  it('Good Friday keeps its own proper: Ps 50 / Ha 3 / Ps 147', async () => {
    const date = '2022-04-15';
    if (!testable(date)) return;
    const [first, second, third] = await laudesPsalms(date);
    expect(first).toMatch(/^Salm 50\b/);
    expect(second).toMatch(/^Càntic Ha 3\b/);
    expect(third).toMatch(/^Salm 147\b/);
  });
});
