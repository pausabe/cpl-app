// The settings that DataService works out on each reload, rather than just reading them.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import * as DataService from '../../src/services/dataService';

const EASTER_MONDAY = new Date(2026, 3, 6);
beforeEach(() => AsyncStorage.clear());

test("la memòria lliure només s'activa el dia en què l'usuari l'ha activat", async () => {
  await AsyncStorage.setItem('lliureDate', '6:3:2026');
  await DataService.reloadAllData(EASTER_MONDAY, null);
  expect(DataService.CurrentSettings.OptionalFestivityEnabled).toBe(true);

  await DataService.reloadAllData(new Date(2026, 3, 7), null);
  expect(DataService.CurrentSettings.OptionalFestivityEnabled).toBe(false);
});

test.each([
  ['Activat', 'light', true],
  ['Desactivat', 'dark', false],
  ['Automàtic', 'dark', true],
  ['Automàtic', 'light', false],
])('mode fosc «%s» amb el sistema en %s → %s', async (option, system, expected) => {
  jest.spyOn(Appearance, 'getColorScheme').mockReturnValue(system);
  await AsyncStorage.setItem('darkMode', option);
  await DataService.reloadAllData(EASTER_MONDAY, null);
  expect(DataService.CurrentSettings.DarkModeEnabled).toBe(expected);
});

test('la diòcesi i el lloc escollits arriben a la consulta', async () => {
  await AsyncStorage.setItem('diocesis', 'Tarragona');
  await AsyncStorage.setItem('lloc', 'Catedral');
  await DataService.reloadAllData(EASTER_MONDAY, null);
  expect(DataService.CurrentSettings.DioceseName).toBe('Tarragona');
  expect(DataService.CurrentSettings.DioceseCode).toBe('TaC');
});
