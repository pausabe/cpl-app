// What the calendar paints, kept apart from the screens: one day worked out at a time, the day
// touched always first, and the rank of a day worked out painted over the database's.
jest.mock('../../src/controllers/liturgyStore', () => {
  const state = { revision: 1, running: 0, maxRunning: 0, calls: [], pending: [] };
  return {
    __state: state,
    getSnapshot: () => ({
      revision: state.revision,
      day: { today: { date: new Date(2026, 8, 21), celebrationType: 'F' } },
      celebration: { title: 'Sant Mateu, apòstol i evangelista', description: '-' },
      settings: { dioceseName: 'Barcelona', prayingPlace: 'Diòcesi', optionalFestivityEnabled: false },
    }),
    isLoaded: () => true,
    currentDate: () => new Date(2026, 8, 21),
    yearMarks: jest.fn(async () => []),
    // Each day is worked out when the test says so
    previewDay: jest.fn(
      (date) =>
        new Promise((resolve) => {
          state.running++;
          state.maxRunning = Math.max(state.maxRunning, state.running);
          state.calls.push(date.getDate());
          state.pending.push(() => {
            state.running--;
            resolve({
              day: { date, celebrationType: date.getDate() === 24 ? '-' : 'M', liturgyColor: 'V' },
              celebration: { title: '', description: '-' },
              settings: { dioceseName: 'Barcelona', prayingPlace: 'Diòcesi', optionalFestivityEnabled: false },
            });
          });
        }),
    ),
  };
});

const LiturgyStore = require('../../src/controllers/liturgyStore');
const CalendarStore = require('../../src/controllers/calendarStore');

const state = LiturgyStore.__state;
const september = (...days) => days.map((d) => new Date(2026, 8, d));
// The day being worked out is finished, and the next one starts
async function finishOne() {
  state.pending.shift()();
  await new Promise((resolve) => setImmediate(resolve));
}

test('one day at a time, and a day touched goes before those of the month', async () => {
  CalendarStore.needPreviews(september(22, 8, 14, 15));
  await new Promise((resolve) => setImmediate(resolve));
  expect(state.calls).toEqual([22]);
  // The reader touches the 24th while the 22nd is being worked out
  CalendarStore.needPreviews(september(24, 8, 14, 15));
  await finishOne();
  expect(state.calls).toEqual([22, 24]);
  await finishOne();
  await finishOne();
  await finishOne();
  await finishOne();
  expect(state.calls).toEqual([22, 24, 8, 14, 15]);
  expect(state.maxRunning).toBe(1);
  // The day shown at home was there already, and is not worked out again
  CalendarStore.needPreviews(september(21));
  await new Promise((resolve) => setImmediate(resolve));
  expect(state.calls).toEqual([22, 24, 8, 14, 15]);
  expect(Object.keys(CalendarStore.getData().previews).sort()).toEqual([
    '2026-09-08',
    '2026-09-14',
    '2026-09-15',
    '2026-09-21',
    '2026-09-22',
    '2026-09-24',
  ]);
});

test('a day left before its turn is not worked out', async () => {
  state.revision = 2;
  state.calls = [];
  CalendarStore.needPreviews(september(1, 2, 3));
  await new Promise((resolve) => setImmediate(resolve));
  CalendarStore.needPreviews(september(5));
  await finishOne();
  await finishOne();
  expect(state.calls).toEqual([1, 5]);
  expect(state.pending).toHaveLength(0);
});

test('a day that cannot be worked out is reported, and the next ones go on', async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
  state.revision = 3;
  state.calls = [];
  LiturgyStore.previewDay.mockImplementationOnce(async () => {
    throw new Error('database is locked');
  });
  CalendarStore.needPreviews(september(10, 11));
  await new Promise((resolve) => setImmediate(resolve));
  await finishOne();

  expect(state.calls).toEqual([11]);
  // The card of the 10th stays waiting: it waits on the phone to reach cpl-cloud (services/health)
  await new Promise((resolve) => setImmediate(resolve));
  const problems = JSON.parse((await AsyncStorage.getItem('HealthProblems')) ?? '[]');
  expect(problems).toEqual([expect.objectContaining({ place: 'calendar-day', message: 'database is locked' })]);
});
