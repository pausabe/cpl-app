// Counting how many people use the app without knowing anything about anyone: a code made at
// random each day, thrown away the next one, and the number of openings since the last report.
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

const sent = () => JSON.parse(global.fetch.mock.calls[0][1].body);
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
  expect(sent().code).toMatch(/^[0-9a-f]{32}$/);
});

test('after reporting, the count starts again and the day is remembered', async () => {
  const service = loadService();
  await service.countOpen();

  await service.reportUsage();

  expect(await AsyncStorage.getItem(StorageKeys.UsageOpens)).toBe('0');
  expect(await AsyncStorage.getItem(StorageKeys.UsageReportedDay)).toBe(today());
});

test('it does not say anything twice when there is nothing new', async () => {
  const service = loadService();
  await service.countOpen();
  await service.reportUsage();

  await expect(service.reportUsage()).resolves.toBe('nothing-to-say');
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('the same code all day, a different one the next day', async () => {
  const service = loadService();
  await service.countOpen();
  await service.reportUsage();
  const firstCode = sent().code;

  await service.countOpen();
  await service.reportUsage();
  expect(JSON.parse(global.fetch.mock.calls[1][1].body).code).toBe(firstCode);

  // The next day: the code of today is not kept
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2030-01-01T00:00:00.000Z');
  await service.countOpen();
  await service.reportUsage();
  expect(JSON.parse(global.fetch.mock.calls[2][1].body).code).not.toBe(firstCode);
  Date.prototype.toISOString.mockRestore();
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
