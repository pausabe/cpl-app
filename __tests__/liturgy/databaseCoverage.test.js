// cpl-app.db holds a fixed range of years. The app resolves "today" and "tomorrow" on
// every launch, so the day after the last one in the database it can no longer open (on
// the 2017–2026 database, 30 and 31 December 2026 already throw). This is the alarm: it
// goes red with enough time to ask CPL for the next year's data and ship it.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { ObtainMinimumAndMaximumSelectableDates } = require('../../src/services/databaseDataService');

const DAYS_OF_NOTICE = 45;

test(`la base de dades cobreix com a mínim els pròxims ${DAYS_OF_NOTICE} dies`, async () => {
  const { MaximumSelectableDate } = await ObtainMinimumAndMaximumSelectableDates();
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + DAYS_OF_NOTICE);
  expect(MaximumSelectableDate.getTime()).toBeGreaterThan(deadline.getTime());
});
