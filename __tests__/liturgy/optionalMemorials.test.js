// Days with more than one optional memorial, with the real database: which ones a place can choose
// from, how the choice is saved (and what a choice saved before there was a choice means), and that
// the one chosen is the one prayed in the hours and named at Mass.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { executeQueryAsync } = require('../helpers/mockDatabaseManager');
const { PROFILES, loadDay } = require('../helpers/liturgyDay');
const DataService = require('../../src/services/dataService');
const StorageKeys = require('../../src/services/storage/storageKeys').default;
const {
  NOT_CELEBRATED,
  optionalMemorialToStore,
  readStoredOptionalMemorial,
} = require('../../src/services/liturgy/optionalMemorialsService');
const { buildDayCard, shortMemorialName } = require('../../src/view-models/dayCard');

PROFILES.tarragona = { diocesis: 'Tarragona', lloc: 'Diòcesi' };
PROFILES.tarragonaCiutat = { diocesis: 'Tarragona', lloc: 'Ciutat' };
PROFILES.mallorca = { diocesis: 'Mallorca', lloc: 'Diòcesi' };
PROFILES.lleidaDiocesi = { diocesis: 'Lleida', lloc: 'Diòcesi' };
PROFILES.tortosaCiutat = { diocesis: 'Tortosa', lloc: 'Ciutat' };
// The switch of before, turned on: the date alone
PROFILES.barcelonaSwitchOn = { diocesis: 'Barcelona', lloc: 'Diòcesi', optionalFestivity: true };

async function memorialsOf(day, profile = 'barcelona', choice = {}) {
  const state = await loadDay(day, profile, choice);
  const { options, chosen } = DataService.currentLiturgy().optionalMemorials;
  return { ids: options.map((option) => option.id), chosen, letter: state.dayInformation.today.celebrationType };
}

describe('the optional memorials a place can choose from', () => {
  test.each([
    ['2026-10-09', [381, 382]], // Sants Dionís i companys, Sant Joan Leonardi
    ['2026-10-16', [388, 389]], // Santa Hedvig, Santa Margarida Maria Alacoque
    ['2026-10-19', [391, 392, 393]], // Sants Joan de Brébeuf i Isaac Jogues, Sant Pau de la Creu, Sant Pere d’Alcàntara
    ['2026-11-16', [422, 423]], // Santa Margarida d’Escòcia, Santa Gertrudis
    ['2026-11-23', [430, 431]], // Sant Climent I, Sant Columbà
    ['2027-02-03', [34, 35]], // Sant Blai, Sant Òscar
  ])('%s in Barcelona: %j, and none chosen', async (day, ids) => {
    expect(await memorialsOf(day)).toEqual({ ids, chosen: null, letter: 'L' });
  });

  test('a day with one optional memorial has it alone: the switch of always', async () => {
    expect(await memorialsOf('2026-09-26')).toEqual({ ids: [367], chosen: null, letter: 'L' });
  });

  test('a day without optional memorials has none, nor an obligatory memorial', async () => {
    expect(await memorialsOf('2026-09-22')).toMatchObject({ ids: [], letter: '-' });
    expect(await memorialsOf('2026-10-17')).toMatchObject({ ids: [], letter: 'M' });
  });

  test('Saturday: Santa Maria on a free Saturday is the switch of always, not one more option', async () => {
    // A Saturday with only Santa Maria (V): nothing to choose among
    expect(await memorialsOf('2026-10-31')).toEqual({ ids: [], chosen: null, letter: 'V' });
    // A Saturday with two saints (L): the two saints, as the app offered the first of them alone
    expect(await memorialsOf('2027-08-07')).toEqual({ ids: [287, 288], chosen: null, letter: 'L' });
  });

  describe('the rows of a diocese', () => {
    test('add one more, Lleida 28-9-2027: Beat Francesc Castelló with Venceslau and Llorenç Ruiz', async () => {
      expect((await memorialsOf('2027-09-28')).ids).toEqual([369, 370]);
      expect((await memorialsOf('2027-09-28', 'lleidaDiocesi')).ids).toEqual([369, 370, 371]);
      // A cathedral has those of its diocese too
      expect((await memorialsOf('2027-09-28', 'lleida')).ids).toEqual([369, 370, 371]);
    });

    test('Barcelona 25-8-2027: its row of Sant Josep de Calassanç, and Sant Lluís de França', async () => {
      expect((await memorialsOf('2027-08-25')).ids).toEqual([316, 324]);
      // Menorca has no row of its own of Calassanç: only Sant Lluís
      expect((await memorialsOf('2027-08-25', 'menorca')).ids).toEqual([324]);
    });

    test('a saint with a row of the diocese counts once, with that row: Mallorca 20-1-2027', async () => {
      expect((await memorialsOf('2027-01-20')).ids).toEqual([13, 14]);
      expect((await memorialsOf('2027-01-20', 'mallorca')).ids).toEqual([13, 485]);
    });

    test('a row of the city is not the diocese’s: Tortosa 27-1-2027', async () => {
      // Sant Enric d’Ossó has rows for the diocese (22) and the city (21); the diocese, its own
      expect((await memorialsOf('2027-01-27', 'tortosa')).ids).toEqual([20, 22]);
    });

    test('replace the saint the place keeps on another day: Tortosa 23-1-2027, Sant Francesc Gil only', async () => {
      // Sant Ildefons, which Tortosa prays on the 18th, is not one of them here
      expect(await memorialsOf('2027-01-23', 'tortosa')).toEqual({ ids: [17], chosen: null, letter: 'L' });
      expect((await memorialsOf('2027-01-23', 'tortosaCiutat')).ids).toEqual([17]);
      // Everywhere else Sant Ildefons is obligatory
      expect(await memorialsOf('2027-01-23')).toMatchObject({ ids: [], letter: 'M' });
    });

    test('Tarragona 19-8-2027: Sant Magí only; Joan Eudes and Ezequiel Moreno the day before', async () => {
      expect((await memorialsOf('2027-08-19', 'tarragona')).ids).toEqual([309]);
      expect((await memorialsOf('2027-08-18', 'tarragona')).ids).toEqual([304, 305]);
      expect((await memorialsOf('2027-08-19')).ids).toEqual([306, 307]);
      expect((await memorialsOf('2027-08-18')).ids).toEqual([]);
    });
  });
});

describe('the choice, saved for the day', () => {
  const day = new Date(2026, 9, 9);

  test('as the switch saved it, with the memorial after it', () => {
    expect(optionalMemorialToStore(day)).toBe('9:9:2026');
    expect(optionalMemorialToStore(day, 382)).toBe('9:9:2026:382');
    expect(NOT_CELEBRATED).toBe('none');
  });

  test.each([
    ['9:9:2026', { enabled: true }],
    ['9:9:2026:382', { enabled: true, memorialId: 382 }],
    ['10:9:2026:382', { enabled: false }],
    ['9:9:2025', { enabled: false }],
    ['none', { enabled: false }],
    [null, { enabled: false }],
    ['9:9:2026:x', { enabled: true }],
    ['9-9-2026', { enabled: false }],
  ])('«%s» on 9 October: %j', (stored, read) => {
    expect(readStoredOptionalMemorial(stored, day)).toEqual(read);
  });

  test('the old value, the date alone, still means the memorial the app offered: Sant Dionís', async () => {
    expect(await memorialsOf('2026-10-09', 'barcelonaSwitchOn')).toEqual({ ids: [381, 382], chosen: 381, letter: 'L' });
    expect(DataService.currentLiturgy().settings.optionalMemorialId).toBeUndefined();
  });

  test('a memorial chosen is that one, and only on its day', async () => {
    expect((await memorialsOf('2026-10-09', 'barcelona', { memorial: 382 })).chosen).toBe(382);
    expect(DataService.currentLiturgy().settings).toMatchObject({
      optionalFestivityEnabled: true,
      optionalMemorialId: 382,
    });
    await AsyncStorage.setItem(StorageKeys.OptionalFestivity, optionalMemorialToStore(new Date(2026, 9, 9), 382));
    await DataService.reloadAllData(new Date(2026, 9, 16), null);
    expect(DataService.currentLiturgy().optionalMemorials.chosen).toBeNull();
    expect(DataService.currentLiturgy().settings.optionalFestivityEnabled).toBe(false);
  });

  test('the weekday puts it away', async () => {
    expect((await memorialsOf('2026-10-09', 'barcelona', { memorial: null })).chosen).toBeNull();
  });

  test('a memorial that is not one of the day is the one the app offered', async () => {
    expect((await memorialsOf('2026-10-09', 'barcelona', { memorial: 388 })).chosen).toBe(381);
  });
});

describe('the memorial chosen is the one prayed: 9 October 2026', () => {
  const DIONIS = 'Sants Dionís, bisbe, i companys, màrtirs';
  const LEONARDI = 'Sant Joan Leonardi, prevere';

  test('Sant Dionís (the old switch): his Office, Lauds and Vespers, and his name at Mass', async () => {
    const state = await loadDay('2026-10-09', 'barcelonaSwitchOn');
    expect(state.celebration.title).toBe(DIONIS);
    expect(state.mass.today.title).toBe(DIONIS);
    expect(state.hours.office.secondReading.title).toBe('Sigues un testimoni fort i fidel');
    expect(state.hours.office.secondReading.reference).toMatch(/sant Ambròs/);
    for (const prayer of [state.hours.laudes.finalPrayer, state.hours.vespers.finalPrayer]) {
      expect(prayer).toMatch(/enviàreu sant Dionís i els seus companys/);
    }
  });

  test('Sant Joan Leonardi chosen: his Office, Lauds and Vespers, and his name at Mass', async () => {
    const state = await loadDay('2026-10-09', 'barcelona', { memorial: 382 });
    expect(state.celebration.title).toBe(LEONARDI);
    expect(state.mass.today.title).toBe(LEONARDI);
    expect(state.hours.office.secondReading.title).toBe('T’indicaré, oh home, el que Déu vol de tu');
    expect(state.hours.office.secondReading.reference).toMatch(/sant Joan Leonardi/);
    for (const prayer of [state.hours.laudes.finalPrayer, state.hours.vespers.finalPrayer]) {
      expect(prayer).toMatch(/per mitjà de sant Joan/);
    }
    // The readings of the Mass are those of the weekday: the database has none of their own for
    // either of them. And the minor hours of a memorial are those of the weekday (OGLH 236), with
    // one memorial or another.
    const weekday = await loadDay('2026-10-09', 'barcelona', { memorial: null });
    const dionis = await loadDay('2026-10-09', 'barcelona', { memorial: 381 });
    for (const other of [weekday, dionis]) {
      expect(state.mass.today.gospel).toEqual(other.mass.today.gospel);
      expect(state.mass.today.firstReading).toEqual(other.mass.today.firstReading);
      expect(state.hours.hours).toEqual(other.hours.hours);
    }
    expect(dionis.hours.laudes.finalPrayer).toMatch(/sant Dionís/);
  });

  test('the weekday: neither of them', async () => {
    const state = await loadDay('2026-10-09', 'barcelona', { memorial: null });
    expect(state.settings.optionalFestivityEnabled).toBe(false);
    expect(state.hours.office.secondReading.title).not.toBe('Sigues un testimoni fort i fidel');
    expect(state.hours.office.secondReading.title).not.toBe('T’indicaré, oh home, el que Déu vol de tu');
    expect(state.hours.laudes.finalPrayer).not.toMatch(/sant Dionís|sant Joan/);
  });

  test('a day with one memorial is as it always was: the switch turns on its only memorial', async () => {
    const off = await loadDay('2026-09-26');
    const on = await loadDay('2026-09-26', 'mallorcaLliure');
    expect(off.celebration.title).toBe('Sants Cosme i Damià, màrtirs');
    expect(on.celebration.title).toBe('Sants Cosme i Damià, màrtirs');
    expect(on.settings.optionalFestivityEnabled).toBe(true);
  });
});

describe('what the home, the calendar and the widgets say of the day', () => {
  const cardOf = ({ liturgyDayInformation, celebrationInformation, settings, optionalMemorials }) =>
    buildDayCard(liturgyDayInformation.today, celebrationInformation, settings, optionalMemorials);

  test('the card, and the calendar of the same day, agree', async () => {
    await loadDay('2026-10-12', 'barcelona');
    await AsyncStorage.setItem(StorageKeys.OptionalFestivity, optionalMemorialToStore(new Date(2026, 9, 9), 382));
    const preview = await DataService.obtainDayPreview(new Date(2026, 9, 9));
    const fromCalendar = buildDayCard(preview.day, preview.celebration, preview.settings, preview.optionalMemorials);
    await DataService.reloadAllData(new Date(2026, 9, 9), null);
    const home = cardOf(DataService.currentLiturgy());
    expect(home).toEqual(fromCalendar);
    expect(home.celebration).toMatchObject({
      typeLabel: 'Dues memòries lliures',
      title: 'Sant Joan Leonardi, prevere',
      muted: false,
    });
  });

  test('another day of the calendar does not take the memorial chosen today', async () => {
    await loadDay('2026-10-09', 'barcelona', { memorial: 382 });
    const preview = await DataService.obtainDayPreview(new Date(2026, 9, 16));
    expect(preview.settings.optionalFestivityEnabled).toBe(false);
    expect(preview.settings.optionalMemorialId).toBeUndefined();
    expect(preview.optionalMemorials).toEqual({
      options: [expect.objectContaining({ id: 388 }), expect.objectContaining({ id: 389 })],
      chosen: null,
    });
    // And the day shown is still the one with the choice
    expect(DataService.currentLiturgy().settings.optionalMemorialId).toBe(382);
  });
});

test('every short name of a memorial only leaves words out, in their order', async () => {
  const rows = await executeQueryAsync('SELECT DISTINCT nomMemoria FROM santsMemories');
  const words = (text) => text.replace(/,/g, '').split(/\s+/).filter(Boolean);
  for (const { nomMemoria } of rows) {
    const full = words(nomMemoria);
    const short = words(shortMemorialName(nomMemoria));
    expect(short.length).toBeGreaterThan(0);
    let at = 0;
    for (const word of short) {
      while (at < full.length && full[at] !== word) at++;
      expect([nomMemoria, word, at < full.length]).toEqual([nomMemoria, word, true]);
      at++;
    }
  }
});
