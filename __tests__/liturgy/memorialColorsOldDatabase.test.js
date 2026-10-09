// A database of before the colours of the memorials (without _celebration_colors), like the ones the
// apps carry today and every publication until process X writes the table: a memorial celebrated is
// painted with the colour of the day, as it always was. A copy of the bundled database without the
// table, so that this holds whatever the bundled one has.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const copy = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cpl-without-colors-')), 'cpl-app.db');
fs.copyFileSync(path.resolve(__dirname, '../../src/assets/db/cpl-app.db'), copy);
const database = new DatabaseSync(copy);
database.exec('DROP TABLE IF EXISTS _celebration_colors');
database.close();
process.env.CPL_DB = copy;

jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('../../src/services/widgetService', () => ({
  hasWidgets: () => true,
  writeWidgetPayload: jest.fn(),
  canPinWidget: () => false,
  pinWidget: jest.fn(async () => false),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { loadDay } = require('../helpers/liturgyDay');
const DataService = require('../../src/services/dataService');
const { refreshWidgets, resetWidgets } = require('../../src/controllers/widgetController');
const { writeWidgetPayload } = require('../../src/services/widgetService');
const StorageKeys = require('../../src/services/storage/storageKeys').default;
const { optionalMemorialToStore } = require('../../src/services/liturgy/optionalMemorialsService');
const { buildDayCard } = require('../../src/view-models/dayCard');

test('Sants Dionís i companys chosen on 9 October 2026: the card, the calendar and the widgets stay green', async () => {
  await loadDay('2026-10-12', 'barcelona', { memorial: null });
  await AsyncStorage.setItem(StorageKeys.OptionalFestivity, optionalMemorialToStore(new Date(2026, 9, 9), 381));

  const preview = await DataService.obtainDayPreview(new Date(2026, 9, 9));
  expect(preview.memorialColor).toBeNull();
  const fromCalendar = buildDayCard(
    preview.day,
    preview.celebration,
    preview.settings,
    preview.optionalMemorials,
    preview.memorialColor,
  );
  expect([fromCalendar.colorCode, fromCalendar.celebration.title]).toEqual([
    'V',
    'Sants Dionís, bisbe, i companys, màrtirs',
  ]);

  await DataService.reloadAllData(new Date(2026, 9, 9), null);
  const current = DataService.currentLiturgy();
  expect(current.memorialColor).toBeNull();
  const home = buildDayCard(
    current.liturgyDayInformation.today,
    current.celebrationInformation,
    current.settings,
    current.optionalMemorials,
    current.memorialColor,
  );
  expect(home).toEqual(fromCalendar);

  resetWidgets();
  await refreshWidgets(new Date(2026, 9, 9, 8, 0));
  const payload = JSON.parse(writeWidgetPayload.mock.calls[writeWidgetPayload.mock.calls.length - 1][0]);
  expect(payload.days.find((day) => day.date === '2026-10-09')).toMatchObject({
    color: 'V',
    celebration: { title: 'Sants Dionís, bisbe, i companys, màrtirs', muted: false },
  });
});
