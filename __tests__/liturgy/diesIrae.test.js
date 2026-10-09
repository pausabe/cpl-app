// In the last week of Ordinary Time the Dies iræ may be said instead of the hymn of the day, a
// third of it at each hour (Litúrgia de les Hores, vol. IV, p. 471): «els dies de fèria». Its texts
// are six rows the CPL adds at the end of `diversos`, so these tests pray with a copy of the
// database that has them, with texts that say which row they are.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const copy = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cpl-dies-irae-')), 'cpl-app.db');
fs.copyFileSync(path.resolve(__dirname, '../../src/assets/db/cpl-app.db'), copy);
const database = new DatabaseSync(copy);
// The published databases already have the real rows (from publication 8): they go, so that the
// rows the tests read are these
database.exec("DELETE FROM diversos WHERE concepte LIKE 'Himne Dies ir%'");
const insert = database.prepare('INSERT INTO diversos (concepte, oracio) VALUES (?, ?)');
for (const hour of ['Ofici de lectura', 'Laudes', 'Vespres']) {
  insert.run(`Himne Dies iræ, ${hour} (setmana XXXIV)`, `Dies iræ en llatí, ${hour}`);
  insert.run(`Himne Dies iræ, ${hour} (setmana XXXIV)`, `Dies iræ en català, ${hour}`);
}
database.close();
process.env.CPL_DB = copy;

jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);

const RNTL = require('@testing-library/react-native');
const { loadDay } = require('../helpers/liturgyDay');
const { openHour, press, runs } = require('../helpers/prayerScreens');
const { getScreenSpeech } = require('../../src/controllers/speechStore');
const Various = require('../../src/models/liturgy-masters/Various').default;

const offered = ({ hours }) => ({
  office: hours.office.diesIraeAnthem,
  laudes: hours.laudes.diesIraeAnthem,
  vespers: hours.vespers.diesIraeAnthem,
});

test('on a weekday of the last week, each hour offers its part, in Catalan', async () => {
  // Thursday 26 November 2026, with no celebration
  expect(offered(await loadDay('2026-11-26'))).toEqual({
    office: 'Dies iræ en català, Ofici de lectura',
    laudes: 'Dies iræ en català, Laudes',
    vespers: 'Dies iræ en català, Vespres',
  });
});

test('with the hymns in Latin, in Latin', async () => {
  const day = await loadDay('2026-11-26', 'tarragonaCatedral');
  expect(day.hours.laudes.diesIraeAnthem).toBe('Dies iræ en llatí, Laudes');
});

test('the hymn of the day is still there, to be chosen', async () => {
  const day = await loadDay('2026-11-26');
  expect(day.hours.laudes.anthem).toMatch(/\S/);
  expect(day.hours.laudes.anthem).not.toMatch(/Dies iræ/);
});

test('an optional memorial not celebrated is a weekday; celebrated, it is not', async () => {
  // Monday 23 November 2026: Sant Climent I or Sant Columbà
  expect(offered(await loadDay('2026-11-23')).laudes).toBe('Dies iræ en català, Laudes');
  expect(offered(await loadDay('2026-11-23', 'mallorcaLliure'))).toEqual({
    office: undefined,
    laudes: undefined,
    vespers: undefined,
  });
});

test('not on a memorial, nor on a feast', async () => {
  // Tuesday 24 November 2026, Sant Andreu Dung-Lac; Friday 27 in Mallorca, Beat Ramon Llull
  expect(offered(await loadDay('2026-11-24')).laudes).toBeUndefined();
  expect(offered(await loadDay('2026-11-27', 'mallorcaLliure')).laudes).toBeUndefined();
});

test('on Saturday, at the Office and Lauds but not at Vespers, which are those of Advent', async () => {
  expect(offered(await loadDay('2026-11-28'))).toEqual({
    office: 'Dies iræ en català, Ofici de lectura',
    laudes: 'Dies iræ en català, Laudes',
    vespers: undefined,
  });
});

test('not in the other weeks', async () => {
  // Thursday 19 November 2026, week XXXIII
  expect(offered(await loadDay('2026-11-19'))).toEqual({ office: undefined, laudes: undefined, vespers: undefined });
});

test('a database without its rows offers none, and the rest of the table is read as always', () => {
  const rows = Array.from({ length: 52 }, (_, index) => ({
    concepte: `fila ${index + 1}`,
    oracio: `text ${index + 1}`,
  }));
  const various = new Various(rows);
  expect(various.diesIrae).toEqual({ office: null, laudes: null, vespers: null });
  expect(various.menorcaBishop).toBe('text 52');
});

describe('in the prayer', () => {
  // The chips to choose, and the text of the prayer as the goldens read it
  const chip = (label) => RNTL.screen.queryAllByText(label).length > 0;
  const shown = (text) => runs().some((run) => run.includes(text));

  test('the hymn of the day comes first, and the Dies iræ is one touch away', async () => {
    const day = await loadDay('2026-11-26');
    await openHour('Laudes');
    expect(chip('Himne del dia')).toBe(true);
    expect(shown(day.hours.laudes.anthem.trim().split('\n')[0])).toBe(true);
    expect(shown('Dies iræ en català, Laudes')).toBe(false);

    await press(/^\s*Dies iræ\s*$/);

    expect(shown('Dies iræ en català, Laudes')).toBe(true);
  });

  test('chosen once, the next hour opens with it', async () => {
    await loadDay('2026-11-26');
    await openHour('Ofici');
    await press(/^\s*Dies iræ\s*$/);

    await openHour('Vespres');

    expect(shown('Dies iræ en català, Vespres')).toBe(true);
  });

  test('the voice reads the hymn chosen', async () => {
    await loadDay('2026-11-26');
    await openHour('Laudes');
    await press(/^\s*Dies iræ\s*$/);

    const read = getScreenSpeech()
      .paragraphs.flat()
      .map((run) => run.text);
    expect(read.some((text) => text.includes('Dies iræ en català, Laudes'))).toBe(true);
  });

  test('the other weeks there is nothing to choose', async () => {
    await loadDay('2026-11-19');
    await openHour('Laudes');
    expect(chip('Himne del dia')).toBe(false);
  });
});
