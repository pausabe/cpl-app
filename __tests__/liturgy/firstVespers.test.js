// The first Vespers offered for tomorrow's celebration come with their texts. When the celebration
// is one of those found by a fixed id (SoulKeys), they were built from the promise of the query and
// not from its row, and came out empty.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { loadDay } = require('../helpers/liturgyDay');

test('the eve of Jesucrist, gran sacerdot per sempre has its first Vespers ready, with their texts', async () => {
  const { hours } = await loadDay('2026-05-27');
  const firstVespers = hours.vespersOptions.tomorrowFirstVespersWithCelebration;
  expect(firstVespers.title).toMatch(/gran sacerdot/i);
  expect(firstVespers.evangelicalAntiphon).toBeTruthy();
});

test('being a feast, they are not the Vespers said that evening', async () => {
  const { hours } = await loadDay('2026-05-27');
  expect(hours.vespers.title ?? '').not.toMatch(/gran sacerdot/i);
});
