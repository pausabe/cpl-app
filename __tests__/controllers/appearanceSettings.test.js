// Text size and dark mode: saved in the same place as always, and applied without reloading.
jest.mock('../../src/services/dataService', () => {
  const current = {
    settings: { darkModeEnabled: false, textSize: '3' },
    databaseInformation: {},
    liturgyDayInformation: { today: {} },
    celebrationInformation: {},
    hoursLiturgy: {},
    massLiturgy: {},
    lastRefreshDate: new Date(),
  };
  return { __esModule: true, currentLiturgy: () => current, reloadAllData: jest.fn() };
});

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
  DataService.currentLiturgy().settings.darkModeEnabled = false;
  DataService.currentLiturgy().settings.textSize = '3';
});

test('the dark mode: on, off or the one of the system', () => {
  expect(darkModeEnabledFor('Activat', 'light')).toBe(true);
  expect(darkModeEnabledFor('Desactivat', 'dark')).toBe(false);
  expect(darkModeEnabledFor('Automàtic', 'dark')).toBe(true);
  expect(darkModeEnabledFor('Automàtic', 'light')).toBe(false);
  expect(darkModeEnabledFor('?', 'dark')).toBe(false);
});

test('the text size is saved as text, applied right away and does not reload the liturgy', async () => {
  const listener = jest.fn();
  const unsubscribe = LiturgyStore.subscribe(listener);
  await setTextSize(5);
  expect(await AsyncStorage.getItem('textSize')).toBe('5');
  expect(DataService.currentLiturgy().settings.textSize).toBe('5');
  expect(listener).toHaveBeenCalled();
  expect(DataService.reloadAllData).not.toHaveBeenCalled();
  await setTextSize(14);
  expect(await AsyncStorage.getItem('textSize')).toBe('10');
  unsubscribe();
});

test('the dark mode is saved under the same name as always and is applied', async () => {
  await setDarkMode('Activat');
  expect(await AsyncStorage.getItem('darkMode')).toBe('Activat');
  expect(DataService.currentLiturgy().settings.darkModeEnabled).toBe(true);
  expect(await loadDarkMode()).toBe('Activat');
  await setDarkMode('Desactivat');
  expect(DataService.currentLiturgy().settings.darkModeEnabled).toBe(false);
});

test('on automatic, it follows the system when it changes', async () => {
  const scheme = jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
  await followSystemAppearance();
  expect(DataService.currentLiturgy().settings.darkModeEnabled).toBe(true);

  await setDarkMode('Desactivat');
  await followSystemAppearance();
  expect(DataService.currentLiturgy().settings.darkModeEnabled).toBe(false);
  scheme.mockRestore();
});
