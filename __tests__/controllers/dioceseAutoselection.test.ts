// Choosing the diocese from where the phone is: what gets written, and above all what does not.
// The position comes from the phone, so it is mocked here; the table it is looked up in is the
// real one, which today holds the episcopal sees.
jest.mock('../../src/services/deviceLocationService', () => ({ currentPosition: jest.fn() }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsService, { DioceseName } from '../../src/services/SettingsService';
import { currentPosition } from '../../src/services/deviceLocationService';
import { autoselectDiocese, shouldOfferAutoselection } from '../../src/controllers/dioceseAutoselection';

const asked = currentPosition as jest.MockedFunction<typeof currentPosition>;

// Girona and Tarragona, far from every other see and from each other
const IN_GIRONA = { kind: 'position' as const, latitude: 41.9794, longitude: 2.8214, accuracyMeters: 50 };
const IN_TARRAGONA = { kind: 'position' as const, latitude: 41.1189, longitude: 1.2445, accuracyMeters: 50 };

beforeEach(async () => {
  await AsyncStorage.clear();
  asked.mockReset();
});

test('where they are becomes the diocese, and it is saved', async () => {
  asked.mockResolvedValueOnce(IN_GIRONA);
  expect(await autoselectDiocese()).toEqual({ kind: 'saved', diocese: DioceseName.Girona });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Girona);
});

test('having already the diocese they are in changes nothing', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  asked.mockResolvedValueOnce(IN_GIRONA);
  expect(await autoselectDiocese()).toEqual({ kind: 'unchanged', diocese: DioceseName.Girona });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Girona);
});

test('a diocese chosen before is replaced, because the button was asked for', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  asked.mockResolvedValueOnce(IN_TARRAGONA);
  expect(await autoselectDiocese()).toEqual({ kind: 'saved', diocese: DioceseName.Tarragona });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Tarragona);
});

// --- Everything that must leave the setting alone -------------------------------------------

test('with no permission nothing is written', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  asked.mockResolvedValueOnce({ kind: 'denied' });
  expect(await autoselectDiocese()).toEqual({ kind: 'denied' });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Girona);
});

test('with no position nothing is written', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  asked.mockResolvedValueOnce({ kind: 'failed' });
  expect(await autoselectDiocese()).toEqual({ kind: 'failed' });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Girona);
});

test('outside the territory nothing is written', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  // Paris
  asked.mockResolvedValueOnce({ kind: 'position', latitude: 48.8566, longitude: 2.3522, accuracyMeters: 50 });
  expect(await autoselectDiocese()).toEqual({ kind: 'nowhere' });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Girona);
});

test('a position too vague to tell dioceses apart writes nothing', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  asked.mockResolvedValueOnce({ ...IN_TARRAGONA, accuracyMeters: 100000 });
  expect(await autoselectDiocese()).toEqual({ kind: 'nowhere' });
  expect(await SettingsService.getSettingDiocese()).toBe(DioceseName.Girona);
});

// --- Who gets offered it --------------------------------------------------------------------

test('whoever has never chosen a diocese is offered it', async () => {
  expect(await shouldOfferAutoselection()).toBe(true);
});

test('whoever chose a diocese is left alone, even the default one', async () => {
  await SettingsService.setSettingDiocese(DioceseName.Girona, undefined);
  expect(await shouldOfferAutoselection()).toBe(false);

  await SettingsService.setSettingDiocese(DioceseName.Barcelona, undefined);
  expect(await shouldOfferAutoselection()).toBe(false);
});
