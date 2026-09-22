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
    UpdaterService = require('../../src/Services/UpdaterService');
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

test('si hi ha una actualització, la descarrega', async () => {
  publishUpdate('u1');
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(true);
  expect(Updates.fetchUpdateAsync).toHaveBeenCalled();
});

test("si no n'hi ha, no descarrega res", async () => {
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(false);
  expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
});

test("un error de xarxa no fa petar l'app", async () => {
  Updates.checkForUpdateAsync.mockRejectedValue(new Error('offline'));
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(false);
});

test('en desenvolupament no comprova res', async () => {
  global.__DEV__ = true;
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(false);
  expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
});

test('la que ja té baixada no la torna a demanar', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();
  await UpdaterService.doUpdateIfAvailable();
  expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
});

test("si se'n publica una de més nova, també la baixa", async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();
  publishUpdate('u2');
  await expect(UpdaterService.doUpdateIfAvailable()).resolves.toBe(true);
  expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(2);
});

test("tornant a l'app un altre dia, aplica l'actualització baixada", async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(NEXT_MORNING);

  expect(Updates.reloadAsync).toHaveBeenCalledWith({ reloadScreenOptions: expect.any(Object) });
});

test("tornant a l'app el mateix dia, no la reinicia", async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(new Date(2026, 8, 21, 23, 0, 0));

  expect(Updates.reloadAsync).not.toHaveBeenCalled();
});

test('un altre dia sense res baixat, no reinicia i torna a comprovar', async () => {
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(NEXT_MORNING);

  expect(Updates.reloadAsync).not.toHaveBeenCalled();
  expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(2);
});

test('tornant al cap de poc, no torna a comprovar', async () => {
  await UpdaterService.doUpdateIfAvailable();

  await goToBackgroundAndBack(new Date(2026, 8, 21, 21, 2, 0));

  expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
});

test('si no es pot reiniciar, continua com sempre', async () => {
  publishUpdate('u1');
  await UpdaterService.doUpdateIfAvailable();
  Updates.reloadAsync.mockRejectedValue(new Error('ERR_UPDATES_RELOAD'));

  await expect(goToBackgroundAndBack(NEXT_MORNING)).resolves.toBeUndefined();
  expect(Updates.checkForUpdateAsync).toHaveBeenCalledTimes(2);
});
