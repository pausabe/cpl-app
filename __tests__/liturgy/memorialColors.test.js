// The colour of an optional memorial that is celebrated, with a database that says it: the table
// _celebration_colors, which cpl-cloud's process X writes from litcal. The card of the home, the
// preview of the calendar and the widgets take it on the day the memorial is celebrated, and every
// other day keeps the colour of anyliturgic. These tests pray with a copy of the bundled database that
// has the table (helpers/memorialColorsDatabase).
const { memorialColorsDatabase } = require('../helpers/memorialColorsDatabase');

process.env.CPL_DB = memorialColorsDatabase();

jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('../../src/services/widgetService', () => ({
  hasWidgets: () => true,
  writeWidgetPayload: jest.fn(),
  canPinWidget: () => false,
  pinWidget: jest.fn(async () => false),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { PROFILES, loadDay } = require('../helpers/liturgyDay');
const DataService = require('../../src/services/dataService');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const CalendarStore = require('../../src/controllers/calendarStore');
const { refreshWidgets, resetWidgets } = require('../../src/controllers/widgetController');
const { writeWidgetPayload } = require('../../src/services/widgetService');
const StorageKeys = require('../../src/services/storage/storageKeys').default;
const { optionalMemorialToStore } = require('../../src/services/liturgy/optionalMemorialsService');
const { buildDayCard } = require('../../src/view-models/dayCard');
const { previewCard } = require('../../src/view-models/calendar');

// The switch of before, turned on: the date alone
PROFILES.barcelonaSwitchOn = { diocesis: 'Barcelona', lloc: 'Diòcesi', optionalFestivity: true };

const DIONIS = 'Sants Dionís, bisbe, i companys, màrtirs';
const LEONARDI = 'Sant Joan Leonardi, prevere';

// The card of the home, as the home builds it from the day loaded (controllers/HomeScreenController)
function homeCard() {
  const { day, celebration, settings, optionalMemorials, memorialColor } = LiturgyStore.getSnapshot();
  return buildDayCard(day.today, celebration, settings, optionalMemorials, memorialColor);
}

async function cardOf(isoDay, profile = 'barcelona', choice = {}) {
  await loadDay(isoDay, profile, choice);
  LiturgyStore.publish();
  const card = homeCard();
  return [card.colorCode, card.colorName, card.celebration?.title];
}

describe('the card of the home', () => {
  test('Friday 9 October 2026: Sants Dionís i companys red, Sant Joan Leonardi white, the weekday green', async () => {
    expect(await cardOf('2026-10-09', 'barcelona', { memorial: 381 })).toEqual(['R', 'Vermell', DIONIS]);
    expect(await cardOf('2026-10-09', 'barcelona', { memorial: 382 })).toEqual(['B', 'Blanc', LEONARDI]);
    expect(await cardOf('2026-10-09', 'barcelona', { memorial: null })).toEqual(['V', 'Verd', 'Avui es resa la fèria']);
    expect(await cardOf('2026-10-09')).toEqual(['V', 'Verd', 'Avui es resa la fèria']);
  });

  test('the switch of before, the date alone, is the memorial the app offered: Sant Dionís, red', async () => {
    expect(await cardOf('2026-10-09', 'barcelonaSwitchOn')).toEqual(['R', 'Vermell', DIONIS]);
  });

  test('a day with one memorial, the switch: on, its colour; off, the colour of the day', async () => {
    expect(await cardOf('2026-09-26', 'barcelonaSwitchOn')).toEqual(['R', 'Vermell', 'Sants Cosme i Damià, màrtirs']);
    expect(await cardOf('2026-09-26')).toEqual(['V', 'Verd', 'Sants Cosme i Damià, màrtirs']);
  });

  test('Santa Maria en dissabte, celebrated, is white', async () => {
    const mary = 'Memòria de Santa Maria en dissabte';
    expect(await cardOf('2026-10-31', 'barcelonaSwitchOn')).toEqual(['B', 'Blanc', mary]);
    expect(await cardOf('2026-10-31')).toEqual(['V', 'Verd', mary]);
  });

  test('a martyr pope among two memorials: Sant Climent I red, Sant Columbà white', async () => {
    expect((await cardOf('2026-11-23', 'barcelona', { memorial: 430 })).slice(0, 2)).toEqual(['R', 'Vermell']);
    expect((await cardOf('2026-11-23', 'barcelona', { memorial: 431 })).slice(0, 2)).toEqual(['B', 'Blanc']);
  });

  test('an obligatory memorial keeps the colour of the day, whatever the table says of it', async () => {
    // Sant Ignasi d’Antioquia: the table has him white on purpose
    expect(await cardOf('2026-10-17', 'barcelonaSwitchOn')).toEqual([
      'R',
      'Vermell',
      'Sant Ignasi d’Antioquia, bisbe i màrtir',
    ]);
    expect(DataService.currentLiturgy().memorialColor).toBeNull();
  });

  test('the hours are the same as without the colours: only the card changes', async () => {
    const state = await loadDay('2026-10-09', 'barcelona', { memorial: 381 });
    expect(state.hours.laudes.finalPrayer).toMatch(/enviàreu sant Dionís i els seus companys/);
    expect(state.dayInformation.today.liturgyColor).toBe('V');
  });
});

describe('the calendar', () => {
  const at = (day) => new Date(2026, 9, day);
  const previews = () => CalendarStore.getData().previews;

  async function previewsOf(dates) {
    CalendarStore.needPreviews(dates);
    const keys = dates.map((date) => `2026-10-${String(date.getDate()).padStart(2, '0')}`);
    for (let i = 0; i < 200 && keys.some((key) => !previews()[key]); i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return keys.map((key) => previews()[key]);
  }

  test('the day the memorial was chosen, in its colour; the others, in theirs', async () => {
    // The home shows Monday 12; Sant Joan Leonardi was chosen for Friday 9
    await loadDay('2026-10-12', 'barcelona');
    await AsyncStorage.setItem(StorageKeys.OptionalFestivity, optionalMemorialToStore(at(9), 382));
    await LiturgyStore.reload(at(12));
    const [friday, hedwig, teresa] = await previewsOf([at(9), at(16), at(15)]);
    expect([friday.colorCode, friday.celebration.title]).toEqual(['B', LEONARDI]);
    expect(previewCard(at(9), undefined, friday)).toMatchObject({ colorCode: 'B', celebrationTitle: LEONARDI });
    // Santa Hedvig or Santa Margarida Maria, none chosen; Santa Teresa de Jesús, a feast
    expect(hedwig.colorCode).toBe('V');
    expect(teresa.colorCode).toBe('B');
  });

  test('the day shown, chosen there: the card the home has', async () => {
    await loadDay('2026-10-09', 'barcelona', { memorial: 381 });
    await LiturgyStore.reload(at(9));
    CalendarStore.prepare();
    expect(previews()['2026-10-09']).toEqual(homeCard());
    expect(previews()['2026-10-09'].colorCode).toBe('R');
  });
});

describe('the widgets', () => {
  const written = () => JSON.parse(writeWidgetPayload.mock.calls[writeWidgetPayload.mock.calls.length - 1][0]);
  const colorOn = (iso) => written().days.find((day) => day.date === iso).color;

  beforeEach(() => {
    resetWidgets();
    writeWidgetPayload.mockClear();
  });

  test('the day of the memorial celebrated, in its colour; the others, in theirs', async () => {
    await loadDay('2026-10-09', 'barcelona', { memorial: 381 });
    await refreshWidgets(new Date(2026, 9, 9, 8, 0));
    expect(colorOn('2026-10-09')).toBe('R');
    expect(colorOn('2026-10-16')).toBe('V');
    expect(colorOn('2026-10-15')).toBe('B');

    await AsyncStorage.setItem(StorageKeys.OptionalFestivity, optionalMemorialToStore(new Date(2026, 9, 9), 382));
    await refreshWidgets(new Date(2026, 9, 9, 8, 5));
    expect(colorOn('2026-10-09')).toBe('B');

    await AsyncStorage.setItem(StorageKeys.OptionalFestivity, 'none');
    await refreshWidgets(new Date(2026, 9, 9, 8, 10));
    expect(colorOn('2026-10-09')).toBe('V');
  });
});
