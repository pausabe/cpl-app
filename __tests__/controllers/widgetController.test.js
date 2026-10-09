// The days the app leaves for the widgets of the home screen (controllers/widgetController): from
// yesterday to two weeks ahead, out of the real database, without changing the day shown, and only
// worked out again when something they show has changed.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('../../src/services/widgetService', () => ({
  hasWidgets: () => true,
  writeWidgetPayload: jest.fn(),
  canPinWidget: () => false,
  pinWidget: jest.fn(async () => false),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { loadDay } = require('../helpers/liturgyDay');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const DataService = require('../../src/services/dataService');
const { refreshWidgets, resetWidgets } = require('../../src/controllers/widgetController');
const { writeWidgetPayload } = require('../../src/services/widgetService');
const StorageKeys = require('../../src/services/storage/storageKeys').default;

const written = () => JSON.parse(writeWidgetPayload.mock.calls[writeWidgetPayload.mock.calls.length - 1][0]);

beforeEach(() => {
  resetWidgets();
  writeWidgetPayload.mockClear();
});

test('fifteen days, from yesterday, with what the home says of each one', async () => {
  // The home shows another day, chosen in the calendar: the widgets go by the clock, not by it
  await loadDay('2026-12-25');
  await refreshWidgets(new Date(2026, 9, 9, 8, 0));

  expect(writeWidgetPayload).toHaveBeenCalledTimes(1);
  const payload = written();
  expect(payload.version).toBe(1);
  expect(payload.days.map((day) => day.date)).toEqual(
    Array.from({ length: 15 }, (_, i) => {
      const date = new Date(2026, 9, 8 + i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }),
  );
  const byDate = Object.fromEntries(payload.days.map((day) => [day.date, day]));
  expect(byDate['2026-10-09']).toMatchObject({
    dateText: 'Divendres, 9 d’octubre',
    title: "Setmana XXVII de durant l'any",
    color: 'V',
    celebration: { type: 'Memòria lliure', short: 'Sants Dionís', muted: true },
    gospel: { caption: 'Evangeli · Lc 11,15-26', opens: 'Evangeli' },
  });
  // Saturday: the first Vespers of Sunday under «Vespres»
  expect(byDate['2026-10-10'].vespers).toBe('Primeres vespres de diumenge');
  expect(byDate['2026-10-15']).toMatchObject({
    color: 'B',
    celebration: { type: 'Festa', short: 'Santa Teresa de Jesús', muted: false },
    gospel: { phrase: 'Soc benèvol i humil de cor' },
  });

  // The day shown is still the one of the calendar
  expect(LiturgyStore.currentDate().getDate()).toBe(25);
  expect(DataService.currentLiturgy().celebrationInformation.title).toBe('Nadal');
});

test('only again when something they show has changed: the day, or an optional memorial', async () => {
  await loadDay('2026-10-09');
  await refreshWidgets(new Date(2026, 9, 9, 8, 0));
  await refreshWidgets(new Date(2026, 9, 9, 13, 0));
  expect(writeWidgetPayload).toHaveBeenCalledTimes(1);

  // The memorial of Saint Denis turned on, as the switch of the home does
  await AsyncStorage.setItem(StorageKeys.OptionalFestivity, '9:9:2026');
  await refreshWidgets(new Date(2026, 9, 9, 13, 5));
  expect(writeWidgetPayload).toHaveBeenCalledTimes(2);
  const today = written().days.find((day) => day.date === '2026-10-09');
  expect(today.celebration).toMatchObject({ short: 'Sants Dionís', muted: false });

  await refreshWidgets(new Date(2026, 9, 10, 7, 0));
  expect(writeWidgetPayload).toHaveBeenCalledTimes(3);
  expect(written().days[0].date).toBe('2026-10-09');
});
