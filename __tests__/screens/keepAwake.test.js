// While a prayer or the readings are open, the screen does not go off; when they close, it can.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(async () => {}),
  deactivateKeepAwake: jest.fn(async () => {}),
}));

const KeepAwake = require('expo-keep-awake');
const { loadDay } = require('../helpers/liturgyDay');
const { openHour, openMass } = require('../helpers/prayerScreens');

beforeAll(async () => {
  await loadDay('2026-09-21');
}, 60000);
beforeEach(() => jest.clearAllMocks());

test('the hours keep the screen on while they are open', async () => {
  const view = await openHour('Laudes');
  expect(KeepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith('hours-prayer');
  expect(KeepAwake.deactivateKeepAwake).not.toHaveBeenCalled();
  view.unmount();
  expect(KeepAwake.deactivateKeepAwake).toHaveBeenCalledWith('hours-prayer');
});

test('the readings of the Mass, too', async () => {
  const view = await openMass('Evangeli', false, false);
  expect(KeepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith('mass-readings');
  view.unmount();
  expect(KeepAwake.deactivateKeepAwake).toHaveBeenCalledWith('mass-readings');
});
