// OTA updates (EAS Update): on a release build the app checks at launch and downloads in the
// background; the update applies on the next launch. A failure must never reach the user.
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(async () => ({})),
}));

const Updates = require('expo-updates');
const { doUpdateIfAvailable } = require('../../src/Services/UpdaterService');

const realDev = global.__DEV__;
beforeEach(() => { global.__DEV__ = false; jest.clearAllMocks(); });
afterAll(() => { global.__DEV__ = realDev; });

test('si hi ha una actualització, la descarrega', async () => {
  Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
  await expect(doUpdateIfAvailable(null, false, false, 0)).resolves.toBe(true);
  expect(Updates.fetchUpdateAsync).toHaveBeenCalled();
});

test("si no n'hi ha, no descarrega res", async () => {
  Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });
  await expect(doUpdateIfAvailable(null, false, false, 0)).resolves.toBe(false);
  expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
});

test("un error de xarxa no fa petar l'app", async () => {
  Updates.checkForUpdateAsync.mockRejectedValue(new Error('offline'));
  await expect(doUpdateIfAvailable(null, false, false, 0)).resolves.toBe(false);
});

test('en desenvolupament no comprova res', async () => {
  global.__DEV__ = true;
  await expect(doUpdateIfAvailable(null, false, false, 0)).resolves.toBe(false);
  expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
});
