// Text size and dark mode: saved in the same place as always, and applied without reloading.
jest.mock('../../src/services/dataService', () => ({
  __esModule: true,
  CurrentSettings: { darkModeEnabled: false, textSize: '3' },
  CurrentDatabaseInformation: {},
  CurrentLiturgyDayInformation: { today: {} },
  CurrentCelebrationInformation: {},
  CurrentHoursLiturgy: {},
  CurrentMassLiturgy: {},
  LastRefreshDate: new Date(),
  reloadAllData: jest.fn(),
}));

import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DataService from '../../src/services/dataService';
import * as LiturgyStore from '../../src/controllers/liturgyStore';
import {
  darkModeEnabledFor,
  followSystemAppearance,
  loadDarkMode,
  setDarkMode,
  setTextSize,
} from '../../src/controllers/appearanceSettings';

beforeEach(async () => {
  await AsyncStorage.clear();
  DataService.CurrentSettings.darkModeEnabled = false;
  DataService.CurrentSettings.textSize = '3';
});

test('el mode fosc: activat, desactivat o el del sistema', () => {
  expect(darkModeEnabledFor('Activat', 'light')).toBe(true);
  expect(darkModeEnabledFor('Desactivat', 'dark')).toBe(false);
  expect(darkModeEnabledFor('Automàtic', 'dark')).toBe(true);
  expect(darkModeEnabledFor('Automàtic', 'light')).toBe(false);
  expect(darkModeEnabledFor('?', 'dark')).toBe(false);
});

test('la mida del text es desa com a text, s’aplica tot seguit i no recarrega la litúrgia', async () => {
  const listener = jest.fn();
  const unsubscribe = LiturgyStore.subscribe(listener);
  await setTextSize(5);
  expect(await AsyncStorage.getItem('textSize')).toBe('5');
  expect(DataService.CurrentSettings.textSize).toBe('5');
  expect(listener).toHaveBeenCalled();
  expect(DataService.reloadAllData).not.toHaveBeenCalled();
  await setTextSize(14);
  expect(await AsyncStorage.getItem('textSize')).toBe('10');
  unsubscribe();
});

test('el mode fosc es desa amb el mateix nom de sempre i s’aplica', async () => {
  await setDarkMode('Activat');
  expect(await AsyncStorage.getItem('darkMode')).toBe('Activat');
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(true);
  expect(await loadDarkMode()).toBe('Activat');
  await setDarkMode('Desactivat');
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(false);
});

test('en automàtic, segueix el sistema quan canvia', async () => {
  const scheme = jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
  await followSystemAppearance();
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(true);

  await setDarkMode('Desactivat');
  await followSystemAppearance();
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(false);
  scheme.mockRestore();
});
