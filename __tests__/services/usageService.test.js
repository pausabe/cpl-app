// Counting how many people use the app: an identifier the phone makes itself, which lasts at most
// thirteen months, and the number of openings since the last report. It only serves not to count
// the same phone twice.
const AsyncStorage = require('@react-native-async-storage/async-storage');
const StorageKeys = require('../../src/services/storage/storageKeys').default;

function loadService({ appKey = 'the-app-key' } = {}) {
  let service;
  jest.isolateModules(() => {
    process.env.EXPO_PUBLIC_CPL_APP_KEY = appKey;
    service = require('../../src/services/usageService');
  });
  return service;
}

const answer = (status = 204) => {
  global.fetch = jest.fn(async () => ({ ok: status >= 200 && status < 300, status }));
};

const sent = (call = 0) => JSON.parse(global.fetch.mock.calls[call][1].body);
const today = () => new Date().toISOString().slice(0, 10);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  answer();
});

test('every opening is counted and sent with the next report', async () => {
  const service = loadService();

  await service.countOpen();
  await service.countOpen();
  await expect(service.reportUsage()).resolves.toBe('reported');

  expect(sent().opens).toBe(2);
  expect(sent().device).toMatch(/^[0-9a-f]{32}$/);
});

test('after reporting, the count starts again and the day is remembered', async () => {
  const service = loadService();
  await service.countOpen();

  await service.reportUsage();

  expect(await AsyncStorage.getItem(StorageKeys.UsageOpens)).toBe('0');
  expect(await AsyncStorage.getItem(StorageKeys.UsageReportedDay)).toBe(today());
});

test('it reports once a day, however many times the app is opened', async () => {
  const service = loadService();
  await service.countOpen();
  await service.reportUsage();

  await service.countOpen();
  await expect(service.reportUsage()).resolves.toBe('nothing-to-say');
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // What was opened afterwards is not lost: it goes with tomorrow's report
  expect(await AsyncStorage.getItem(StorageKeys.UsageOpens)).toBe('1');
});

function travelTo(date) {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(date);
}

test('the identifier lasts, so the same phone is the same phone tomorrow', async () => {
  const service = loadService();
  await service.countOpen();
  await service.reportUsage();
  const device = sent().device;
  expect(await service.currentIdentifier()).toEqual({ device, madeOn: today() });

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  travelTo(tomorrow);
  await service.countOpen();
  await service.reportUsage();

  expect(sent(1).device).toBe(device);
  jest.useRealTimers();
});

test('at thirteen months the phone makes a new one and the old one is gone', async () => {
  const service = loadService();
  await service.countOpen();
  await service.reportUsage();
  const device = sent().device;

  const later = new Date();
  later.setUTCMonth(later.getUTCMonth() + 14);
  travelTo(later);
  await service.countOpen();
  await service.reportUsage();

  expect(sent(1).device).not.toBe(device);
  expect((await service.currentIdentifier()).device).toBe(sent(1).device);
  jest.useRealTimers();
});

test('nothing is lost when the report does not get through', async () => {
  const service = loadService();
  await service.countOpen();
  await service.countOpen();
  answer(500);

  await expect(service.reportUsage()).resolves.toBe('failed');

  expect(await AsyncStorage.getItem(StorageKeys.UsageOpens)).toBe('2');
  answer();
  await service.reportUsage();
  expect(sent().opens).toBe(2);
});

test('the report says which publication the app is praying with', async () => {
  const service = loadService();
  await service.countOpen();

  await service.reportUsage(12);

  expect(sent().version).toBe(12);
});

test('with no database open yet it reports without a version', async () => {
  const service = loadService();
  await service.countOpen();

  await expect(service.reportUsage(null)).resolves.toBe('reported');

  expect(sent()).not.toHaveProperty('version');
});

test('without the app key it does not report anything', async () => {
  const service = loadService({ appKey: '' });
  await service.countOpen();

  await expect(service.reportUsage()).resolves.toBe('no-key');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('the openings that are sent are capped, so no phone can count for a crowd', async () => {
  const service = loadService();
  for (let i = 0; i < 520; i++) await service.countOpen();

  await service.reportUsage();

  expect(sent().opens).toBe(500);
});
