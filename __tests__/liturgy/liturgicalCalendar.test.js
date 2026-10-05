// The calendar with the real database: the colour and the rank it paints on every day, and the day
// touched worked out before changing to it, which has to say what the home says after changing.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { executeQueryAsync } = require('../helpers/mockDatabaseManager');
const { PROFILES, loadDay } = require('../helpers/liturgyDay');
const DataService = require('../../src/services/dataService');
const DatabaseDataService = require('../../src/services/databaseDataService');
const StorageKeys = require('../../src/services/storage/storageKeys').default;
const { buildDayCard } = require('../../src/view-models/dayCard');
const { rankLabel, seasonColor } = require('../../src/view-models/calendar');
const { colorCode } = require('../../src/view-models/dayCard');
const { adventSunday, liturgicalWheel } = require('../../src/view-models/liturgicalYear');

PROFILES.barcelonaCathedral = { diocesis: 'Barcelona', lloc: 'Catedral' };

const dateOf = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// The card the home shows now, of the day loaded
function homeCard() {
  const current = DataService.currentLiturgy();
  return buildDayCard(current.liturgyDayInformation.today, current.celebrationInformation, current.settings);
}

async function previewCard(iso) {
  const preview = await DataService.obtainDayPreview(dateOf(iso));
  return buildDayCard(preview.day, preview.celebration, preview.settings);
}

describe('the marks of a year', () => {
  let marks;
  beforeAll(async () => {
    await loadDay('2026-10-05', 'barcelona');
    marks = await DataService.obtainYearMarks(2026);
  });

  test('every day of the year once, in order', () => {
    expect(marks).toHaveLength(365);
    expect(marks[0].date).toBe('2026-01-01');
    expect(marks[364].date).toBe('2026-12-31');
    expect([...marks].sort((a, b) => (a.date < b.date ? -1 : 1))).toEqual(marks);
  });

  test('with the colour and the rank of the place: Barcelona', () => {
    const of = (date) => marks.find((mark) => mark.date === date);
    expect(of('2026-12-08')).toMatchObject({ color: 'B', letter: 'S', season: 'Advent', yearType: 'B' });
    expect(of('2026-10-12')).toMatchObject({ color: 'B', letter: 'F', season: 'Ordinari', week: '28' });
    expect(of('2026-10-17')).toMatchObject({ color: 'R', letter: 'M' });
    expect(of('2026-04-05')).toMatchObject({ color: 'B', letter: 'S', specificSeason: 'Q_DIUM_PASQUA' });
    // Our Lady of Mercy, solemnity in the diocese of Barcelona
    expect(of('2026-09-24')).toMatchObject({ letter: 'S' });
  });

  test('the letter and the colour of each day are those the day itself gets', async () => {
    const settings = DataService.currentLiturgy().settings;
    for (const mark of marks.filter((_, index) => index % 7 === 0)) {
      const day = await DatabaseDataService.obtainLiturgySpecificDayInformation(dateOf(mark.date), settings);
      expect([mark.date, mark.letter, mark.color]).toEqual([mark.date, day.celebrationType, day.liturgyColor]);
    }
  });

  test('a day without a letter has the colour of its season, but for three days of Holy Week', async () => {
    // The background of a day says its season and the letter its celebration: a day without one
    // shows no colour of its own. Only Palm Sunday (red), Holy Thursday (white) and Holy Saturday
    // (purple) have one that is not their season's; their card says it.
    const own = marks.filter(
      (mark) => !['S', 'F', 'M'].includes(mark.letter) && colorCode(mark.color) !== seasonColor(mark),
    );
    expect(own.map((mark) => [mark.date, mark.color])).toEqual([
      ['2026-03-29', 'R'],
      ['2026-04-02', 'B'],
      ['2026-04-04', 'M'],
    ]);
  });

  test('another place, another rank: Our Lady of Mercy is a feast in Terrassa', async () => {
    await loadDay('2026-10-05', 'terrassa');
    const terrassa = await DataService.obtainYearMarks(2026);
    expect(terrassa.find((mark) => mark.date === '2026-09-24').letter).toBe('F');
  });
});

describe('a day worked out for the calendar', () => {
  // Days with something to get wrong: the octaves, the Triduum, a solemnity on a Sunday, the
  // seasons that begin, a feast of one diocese, a celebration moved, an optional memorial
  const DAYS = [
    ['2026-01-01', 'barcelona'],
    ['2026-01-11', 'barcelona'],
    ['2026-02-18', 'barcelona'],
    ['2026-03-19', 'barcelona'],
    ['2026-03-29', 'barcelona'],
    ['2026-04-02', 'barcelona'],
    ['2026-04-04', 'barcelona'],
    ['2026-04-05', 'barcelona'],
    ['2026-04-08', 'barcelona'],
    ['2026-05-17', 'barcelona'],
    ['2026-05-24', 'barcelona'],
    ['2026-06-07', 'barcelona'],
    ['2026-06-12', 'barcelona'],
    ['2026-09-24', 'barcelona'],
    ['2026-10-06', 'barcelona'],
    ['2026-10-12', 'barcelona'],
    ['2026-11-02', 'barcelona'],
    ['2026-11-22', 'barcelona'],
    ['2026-12-08', 'barcelona'],
    ['2026-12-17', 'barcelona'],
    ['2026-12-25', 'barcelona'],
    ['2026-12-27', 'barcelona'],
    ['2026-12-29', 'barcelona'],
    ['2026-05-04', 'barcelonaCathedral'],
    ['2027-04-05', 'barcelona'],
    ['2026-09-08', 'andorra'],
    ['2026-10-29', 'gironaCiutat'],
    ['2026-10-12', 'tarragonaCatedral'],
    ['2026-10-06', 'mallorcaLliure'],
  ];

  test.each(DAYS)('%s (%s) says what the home says after changing to it', async (iso, profile) => {
    await loadDay('2026-10-05', profile);
    const preview = await previewCard(iso);
    await DataService.reloadAllData(dateOf(iso), null);
    expect(preview).toEqual(homeCard());
  });

  test('working it out does not change the day shown', async () => {
    await loadDay('2026-10-05', 'barcelona');
    const before = JSON.stringify(DataService.currentLiturgy());
    await DataService.obtainDayPreview(dateOf('2026-12-25'));
    expect(JSON.stringify(DataService.currentLiturgy())).toBe(before);
  });

  test('an optional memorial is celebrated only on the day the reader turned it on', async () => {
    await loadDay('2026-10-05', 'barcelona');
    expect((await previewCard('2026-10-06')).celebration).toMatchObject({ typeLabel: 'Memòria lliure', muted: true });
    await AsyncStorage.setItem(StorageKeys.OptionalFestivity, '6:9:2026');
    expect((await previewCard('2026-10-06')).celebration).toMatchObject({
      typeLabel: 'Memòria lliure',
      title: 'Sant Bru, prevere',
      muted: false,
    });
    expect((await previewCard('2026-10-08')).celebration.muted).toBe(true);
  });

  test('in a whole year of Barcelona, every day is marked with the rank its card says', async () => {
    await loadDay('2026-10-05', 'barcelona');
    const different = [];
    for (const mark of await DataService.obtainYearMarks(2026)) {
      const card = await previewCard(mark.date);
      const said = card.celebration?.typeLabel ?? null;
      if (rankLabel(mark) !== said) different.push(mark.date);
    }
    expect(different).toEqual([]);
  });
});

describe('the liturgical year of the database', () => {
  test('begins every year on the first Sunday of Advent the calendar works out', async () => {
    const rows = await executeQueryAsync(
      "SELECT CAST(any AS INTEGER) AS year, CAST(mes AS INTEGER) AS month, CAST(dia AS INTEGER) AS day FROM anyliturgic WHERE temps = 'A_SETMANES' AND NumSet = '1' AND DiadelaSetmana = 'Dg'",
    );
    expect(rows).toHaveLength(84);
    for (const { year, month, day } of rows) expect(new Date(year, month - 1, day)).toEqual(adventSunday(year));
  });

  test('2025–2026 as a wheel: its seasons in order, today marked, the middle saying the week', async () => {
    await loadDay('2026-10-05', 'barcelona');
    const marks = {};
    for (const year of [2025, 2026])
      for (const mark of await DataService.obtainYearMarks(year)) marks[mark.date] = mark;
    const wheel = liturgicalWheel({ startYear: 2025, marks, today: new Date(2026, 9, 5, 10) });
    expect(wheel.days).toBe(364);
    expect(wheel.yearName).toBe('Any A');
    expect(wheel.seasons.map((season) => season.text)).toEqual([
      'Advent',
      'Nadal',
      "Durant l'any",
      'Quaresma',
      'Pasqua',
      "Durant l'any",
    ]);
    expect(wheel.today).not.toBeNull();
    expect(wheel.todayTitle).toBe("Setmana XXVII de durant l'any");
    // Its seasons in their colours: Advent, Christmas, ordinary time, Lent, the Triduum, Easter
    // and ordinary time again, one piece each, whatever the colour of their days
    expect(wheel.arcs.map((arc) => arc.color)).toEqual(['M', 'B', 'V', 'M', 'R', 'B', 'V']);
  });
});
