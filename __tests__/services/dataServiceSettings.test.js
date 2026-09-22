// The settings that DataService works out on each reload, rather than just reading them.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import * as DataService from '../../src/services/dataService';

const EASTER_MONDAY = new Date(2026, 3, 6);
beforeEach(() => AsyncStorage.clear());

test('the optional memorial is only on for the day the user turned it on', async () => {
  await AsyncStorage.setItem('lliureDate', '6:3:2026');
  await DataService.reloadAllData(EASTER_MONDAY, null);
  expect(DataService.CurrentSettings.optionalFestivityEnabled).toBe(true);

  await DataService.reloadAllData(new Date(2026, 3, 7), null);
  expect(DataService.CurrentSettings.optionalFestivityEnabled).toBe(false);
});

test.each([
  ['Activat', 'light', true],
  ['Desactivat', 'dark', false],
  ['Automàtic', 'dark', true],
  ['Automàtic', 'light', false],
])('dark mode «%s» with the system on %s → %s', async (option, system, expected) => {
  jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(system);
  await AsyncStorage.setItem('darkMode', option);
  await DataService.reloadAllData(EASTER_MONDAY, null);
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(expected);
});

test('the diocese and the place chosen reach the query', async () => {
  await AsyncStorage.setItem('diocesis', 'Tarragona');
  await AsyncStorage.setItem('lloc', 'Catedral');
  await DataService.reloadAllData(EASTER_MONDAY, null);
  expect(DataService.CurrentSettings.dioceseName).toBe('Tarragona');
  expect(DataService.CurrentSettings.dioceseCode).toBe('TaC');
});
