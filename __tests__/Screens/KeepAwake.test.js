// While a prayer or the readings are open, the screen does not go off; when they close, it can.
jest.mock('../../src/Services/DatabaseManagerService', () => require('../helpers/mockDatabaseManager'));
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

test('les hores mantenen la pantalla encesa mentre són obertes', async () => {
  const view = await openHour('Laudes');
  expect(KeepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith('hours-prayer');
  expect(KeepAwake.deactivateKeepAwake).not.toHaveBeenCalled();
  view.unmount();
  expect(KeepAwake.deactivateKeepAwake).toHaveBeenCalledWith('hours-prayer');
});

test('les lectures de la missa, també', async () => {
  const view = await openMass('Evangeli', false, false);
  expect(KeepAwake.activateKeepAwakeAsync).toHaveBeenCalledWith('mass-readings');
  view.unmount();
  expect(KeepAwake.deactivateKeepAwake).toHaveBeenCalledWith('mass-readings');
});
