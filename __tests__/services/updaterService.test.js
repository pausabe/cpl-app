// OTA updates (EAS Update): on a release build the app checks at launch and downloads in the
// background; the update applies on the next launch, or when the user comes back to the app on
// another day. A failure must never reach the user.
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(async () => {}),
}));

// Monday 21 September 2026, in the evening
const EVENING = new Date(2026, 8, 21, 21, 0, 0);
const NEXT_MORNING = new Date(2026, 8, 22, 8, 0, 0);

let Updates;
let UpdaterService;

const realDev = global.__DEV__;
beforeEach(() => {
  global.__DEV__ = false;
  jest.useFakeTimers({ now: EVENING, advanceTimers: true });
  // The service keeps what it has downloaded and when it last checked: a clean one for each test
  jest.isolateModules(() => {
    Updates = require('expo-updates');
    UpdaterService = require('../../src/services/updaterService');
  });
  Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });
});
afterEach(() => {
  jest.useRealTimers();
});
afterAll(() => {
  global.__DEV__ = realDev;
});

function publishUpdate(id) {
  Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true, manifest: { id } });
  Updates.fetchUpdateAsync.mockResolvedValue({ isNew: true, manifest: { id } });
}

async function goToBackgroundAndBack(at) {
  await UpdaterService.handleAppStateChange('background');
  jest.setSystemTime(at);
  await UpdaterService.handleAppStateChange('active');
}

test('if there is an update, it downloads it', async () => {
  publishUpdate('u1');
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(true);
  expect(Updates.fetchUpdateAsync).toHaveBeenCalled();
});

test('if there is none, it downloads nothing', async () => {
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(false);
  expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
});

test('a network error does not crash the app', async () => {
  Updates.checkForUpdateAsync.mockRejectedValue(new Error('offline'));
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(false);
});

test('in development it checks nothing', async () => {
  global.__DEV__ = true;
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(false);
  expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
});

test('the one it has already downloaded it does not ask for again', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();
  await UpdaterService.doUpdateIfAvailable();
  expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
});

test('if a newer one is published, it downloads that one too', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();
  publishUpdate('u2');
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(true);
  expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(2);
});

test('coming back to the app on another day, it applies the downloaded update', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(NEXT_MORNING);

  expect(Updates.reloadAsync).toHaveBeenCalledWith({ reloadScreenOptions: expect.any(Object) });
});

test('coming back to the app on the same day, it does not restart it', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(new Date(2026, 8, 21, 23, 0, 0));

  expect(Updates.reloadAsync).not.toHaveBeenCalled();
});

test('another day with nothing downloaded, it does not restart and it checks again', async () => {
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(NEXT_MORNING);

  expect(Updates.reloadAsync).not.toHaveBeenCalled();
  expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(2);
});

test('coming back a short while later, it does not check again', async () => {
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(new Date(2026, 8, 21, 21, 2, 0));

  expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
});

test('if it cannot restart, it carries on as always', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();
  Updates.reloadAsync.mockRejectedValue(new Error('ERR_UPDATES_RELOAD'));

  await expect(goToBackgroundAndBack(NEXT_MORNING)).resolves.toBeUndefined();
  expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(2);
});
