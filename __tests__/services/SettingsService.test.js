// What a user picks in Settings is stored as strings in AsyncStorage and read back on every
// launch. A fresh install must get the documented defaults, and invalid values must never
// be stored (a bad diocese would break every query).
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsService, { DarkModeOption, DioceseName, PrayingPlace } from '../../src/services/SettingsService';

beforeEach(() => AsyncStorage.clear());

test('a fresh install has the default settings', async () => {
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Barcelona);
  expect(await SettingsService.getSettingPrayingPlace()).toBe(PrayingPlace.Diocese);
  expect(await SettingsService.getSettingUseLatin()).toBe('false');
  expect(await SettingsService.getSettingTextSize()).toBe('3');
  expect(await SettingsService.getSettingDarkMode()).toBe(DarkModeOption.System);
  expect(await SettingsService.getSettingInvitationPsalm()).toBe('94');
  expect(await SettingsService.getSettingVirginAntiphon()).toBe('1');
  expect(await SettingsService.getSettingShowVideos()).toBe('false');
});

test('the valid values are saved and read back', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona);
  await SettingsService.setSettingPrayingPlace(PrayingPlace.Cathedral);
  await SettingsService.setSettingUseLatin('true');
  await SettingsService.setSettingTextSize('5');
  await SettingsService.setSettingDarkMode(DarkModeOption.On);
  await SettingsService.setSettingInvitationPsalm('66');
  await SettingsService.setSettingVirginAntiphon('4');
  await SettingsService.setSettingDayStart('2');

  expect(await SettingsService.getSettingDiocese()).toBe('Girona');
  expect(await SettingsService.getSettingPrayingPlace()).toBe('Catedral');
  expect(await SettingsService.getSettingUseLatin()).toBe('true');
  expect(await SettingsService.getSettingTextSize()).toBe('5');
  expect(await SettingsService.getSettingDarkMode()).toBe('Activat');
  expect(await SettingsService.getSettingInvitationPsalm()).toBe('66');
  expect(await SettingsService.getSettingVirginAntiphon()).toBe('4');
  expect(await SettingsService.getSettingDayStart()).toBe('2');
});

test('the invalid values are not saved', async () => {
  await Promise.resolve(SettingsService.setSettingDiocese('Madrid')).catch(() => {});
  await Promise.resolve(SettingsService.setSettingInvitationPsalm('50')).catch(() => {});
  await Promise.resolve(SettingsService.setSettingDayStart('7')).catch(() => {});

  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Barcelona);
  expect(await SettingsService.getSettingInvitationPsalm()).toBe('94');
  expect(await SettingsService.getSettingDayStart()).toBe('0');
});

describe('the editions', () => {
  test('a fresh install prays in Catalan', async () => {
    expect(await SettingsService.getSettingEdition()).toBe('ca');
  });

  test('an edition is two letters, and nothing else is saved', async () => {
    await SettingsService.setSettingEdition('es');
    await Promise.resolve(SettingsService.setSettingEdition('castellano')).catch(() => {});

    expect(await SettingsService.getSettingEdition()).toBe('es');
  });

  test('each edition keeps its own diocese and place, and the Catalan ones stay where they were', async () => {
    await SettingsService.setSettingDiocese('Girona');
    await SettingsService.setSettingDiocese('España', ['España'], 'es');
    await SettingsService.setSettingPrayingPlace('Diòcesi', ['Diòcesi'], 'es');

    expect(await AsyncStorage.getItem('diocesis')).toBe('Girona');
    expect(await SettingsService.getSettingDiocese()).toBe('Girona');
    expect(await SettingsService.getSettingDiocese('es')).toBe('España');
    expect(await SettingsService.getSettingPrayingPlace('es')).toBe('Diòcesi');
  });

  test('another edition has no place until one is chosen in it', async () => {
    expect(await SettingsService.getSettingDiocese('es')).toBe('');
    expect(await SettingsService.getSettingPrayingPlace('es')).toBe('');
  });

  test('a place that is not among those of the edition is not saved', async () => {
    await Promise.resolve(SettingsService.setSettingDiocese('Madrid', ['España'], 'es')).catch(() => {});

    expect(await SettingsService.getSettingDiocese('es')).toBe('');
  });
});
