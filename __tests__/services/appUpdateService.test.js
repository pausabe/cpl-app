// A newer app in the store. The app asks cpl-api once a day which version its store already offers,
// and the home tells whoever has an older one with a quiet notice that opens the store. What matters
// here is that it never tells anybody about a version that is not newer, that putting it away is for
// good (until a newer one), and that a copy built for tests never shows it.
jest.mock('expo-application', () => ({ nativeApplicationVersion: '9.0.0' }));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const StorageKeys = require('../../src/services/storage/storageKeys').default;

const { Linking } = require('react-native');

// The phone it runs on is said through cplApi: under Jest, Platform.OS is written into the code as
// "ios" when it is compiled, and changing it afterwards changes nothing
function loadService({ appKey = 'the-app-key', testBuild = false, platform = 'ios' } = {}) {
  let service;
  jest.isolateModules(() => {
    process.env.EXPO_PUBLIC_CPL_APP_KEY = appKey;
    process.env.EXPO_PUBLIC_CPL_TEST_BUILD = testBuild ? '1' : '';
    jest.doMock('../../src/services/cplApi', () => ({
      ...jest.requireActual('../../src/services/cplApi'),
      phonePlatform: () => (platform === 'ios' || platform === 'android' ? platform : null),
    }));
    service = require('../../src/services/appUpdateService');
  });
  return service;
}

function answer(body, status = 200) {
  global.fetch = jest.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

const today = () => new Date().toISOString().slice(0, 10);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  answer({ version: '9.1.0' });
});

test('it asks cpl-api, with the app key, which version the store of this phone has', async () => {
  const service = loadService();

  await expect(service.checkForNewApp()).resolves.toBe('checked');

  expect(global.fetch).toHaveBeenCalledWith(
    'https://cpl-api.canmartorell.dev/v1/app/latest?platform=ios',
    expect.objectContaining({ headers: { 'X-CPL-App-Key': 'the-app-key' } }),
  );
});

test('an Android phone asks about Google Play', async () => {
  const service = loadService({ platform: 'android' });

  await service.checkForNewApp();

  expect(global.fetch.mock.calls[0][0]).toBe('https://cpl-api.canmartorell.dev/v1/app/latest?platform=android');
});

test('a newer version in the store is told about', async () => {
  const service = loadService();

  await service.checkForNewApp();

  await expect(service.newerAppInStore()).resolves.toBe('9.1.0');
});

test('the same version, or an older one, is not', async () => {
  for (const version of ['9.0.0', '8.9.9']) {
    await AsyncStorage.clear();
    answer({ version });
    const service = loadService();
    await service.checkForNewApp();

    await expect(service.newerAppInStore()).resolves.toBeNull();
  }
});

test('versions are compared part by part: 9.10.0 is newer than 9.9.0', () => {
  const { compareVersions } = loadService();

  expect(compareVersions('9.10.0', '9.9.0')).toBeGreaterThan(0);
  expect(compareVersions('9.0.0', '9.0.1')).toBeLessThan(0);
  expect(compareVersions('9.1.0', '9.1.0')).toBe(0);
});

test('put away, it does not come back for that version, only for a newer one', async () => {
  const service = loadService();
  await service.checkForNewApp();
  await service.dismissAppUpdate('9.1.0');

  await expect(service.newerAppInStore()).resolves.toBeNull();

  await AsyncStorage.setItem(StorageKeys.AppCheckDay, '2020-01-01');
  answer({ version: '9.2.0' });
  await service.checkForNewApp();
  await expect(service.newerAppInStore()).resolves.toBe('9.2.0');
});

test('when the website has nothing to say any more, the notice goes away', async () => {
  const service = loadService();
  await service.checkForNewApp();

  await AsyncStorage.setItem(StorageKeys.AppCheckDay, '2020-01-01');
  answer(null, 204);
  await service.checkForNewApp();

  await expect(service.newerAppInStore()).resolves.toBeNull();
});

test('it asks once a day', async () => {
  const service = loadService();

  await service.checkForNewApp();
  await expect(service.checkForNewApp()).resolves.toBe('too-soon');

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem(StorageKeys.AppCheckDay)).toBe(today());
});

test('without network nothing changes, and it asks again at the next opening', async () => {
  const service = loadService();
  global.fetch = jest.fn(async () => {
    throw new Error('Network request failed');
  });

  await expect(service.checkForNewApp()).resolves.toBe('failed');
  await expect(service.newerAppInStore()).resolves.toBeNull();

  answer({ version: '9.1.0' });
  await expect(service.checkForNewApp()).resolves.toBe('checked');
});

test('a copy built to be tried out never asks: the notice would get into the screenshots', async () => {
  const service = loadService({ testBuild: true });

  await expect(service.checkForNewApp()).resolves.toBe('test-build');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('without the app key it does not ask', async () => {
  const service = loadService({ appKey: '' });

  await expect(service.checkForNewApp()).resolves.toBe('no-key');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('the web build has no store to ask about', async () => {
  const service = loadService({ platform: 'web' });

  await expect(service.checkForNewApp()).resolves.toBe('no-store');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('the notice opens the App Store on an iPhone', async () => {
  const service = loadService();
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

  await service.openStore();

  expect(openURL).toHaveBeenCalledWith('https://apps.apple.com/app/id1283136025');
});

test('on Android it opens Google Play, and its page on the web when there is no Play Store', async () => {
  const service = loadService({ platform: 'android' });
  const openURL = jest
    .spyOn(Linking, 'openURL')
    .mockRejectedValueOnce(new Error('No Activity found'))
    .mockResolvedValue(true);

  await service.openStore();

  expect(openURL).toHaveBeenNthCalledWith(1, 'market://details?id=cpl.cpl');
  expect(openURL).toHaveBeenNthCalledWith(2, 'https://play.google.com/store/apps/details?id=cpl.cpl');
});
