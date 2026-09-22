// What a user picks in Settings is stored as strings in AsyncStorage and read back on every
// launch. A fresh install must get the documented defaults, and invalid values must never
// be stored (a bad diocese would break every query).
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsService, { DarkModeOption, DioceseName, PrayingPlace } from '../../src/services/SettingsService';

beforeEach(() => AsyncStorage.clear());

test('una instal·lació nova té la configuració per defecte', async () => {
  expect(await SettingsService.getSettingDiocesis()).toBe(DioceseName.Barcelona);
  expect(await SettingsService.getSettingLloc()).toBe(PrayingPlace.Diocese);
  expect(await SettingsService.getSettingUseLatin()).toBe('false');
  expect(await SettingsService.getSettingTextSize()).toBe('3');
  expect(await SettingsService.getSettingDarkMode()).toBe(DarkModeOption.System);
  expect(await SettingsService.getSettingNumSalmInv()).toBe('94');
  expect(await SettingsService.getSettingNumAntMare()).toBe('1');
  expect(await SettingsService.getSettingShowVideos()).toBe('false');
});

test('els valors vàlids es desen i es tornen a llegir', async () => {
  await SettingsService.setSettingDiocesis(DioceseName.Girona);
  await SettingsService.setSettingLloc(PrayingPlace.Cathedral);
  await SettingsService.setSettingUseLatin('true');
  await SettingsService.setSettingTextSize('5');
  await SettingsService.setSettingDarkMode(DarkModeOption.On);
  await SettingsService.setSettingNumSalmInv('66');
  await SettingsService.setSettingNumAntMare('4');
  await SettingsService.setSettingDayStart('2');

  expect(await SettingsService.getSettingDiocesis()).toBe('Girona');
  expect(await SettingsService.getSettingLloc()).toBe('Catedral');
  expect(await SettingsService.getSettingUseLatin()).toBe('true');
  expect(await SettingsService.getSettingTextSize()).toBe('5');
  expect(await SettingsService.getSettingDarkMode()).toBe('Activat');
  expect(await SettingsService.getSettingNumSalmInv()).toBe('66');
  expect(await SettingsService.getSettingNumAntMare()).toBe('4');
  expect(await SettingsService.getSettingDayStart()).toBe('2');
});

test('els valors no vàlids no es desen', async () => {
  await Promise.resolve(SettingsService.setSettingDiocesis('Madrid')).catch(() => {});
  await Promise.resolve(SettingsService.setSettingNumSalmInv('50')).catch(() => {});
  await Promise.resolve(SettingsService.setSettingDayStart('7')).catch(() => {});

  expect(await SettingsService.getSettingDiocesis()).toBe(DioceseName.Barcelona);
  expect(await SettingsService.getSettingNumSalmInv()).toBe('94');
  expect(await SettingsService.getSettingDayStart()).toBe('0');
});
