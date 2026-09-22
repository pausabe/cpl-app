// The seam between the screens and DataService: snapshots, notices of change, and one reload at
// a time.
jest.mock('../../src/Services/DataService', () => {
  const state = { running: 0, maxRunning: 0, calls: [] };
  // An ES module, as the real one: `import * as` sees the variables it reassigns
  const module = {
    __esModule: true,
    __state: state,
    CurrentSettings: { DarkModeEnabled: false, TextSize: '3' },
    CurrentDatabaseInformation: {},
    CurrentLiturgyDayInformation: { Today: { Date: undefined } },
    CurrentCelebrationInformation: {},
    CurrentHoursLiturgy: {},
    CurrentMassLiturgy: {},
    LastRefreshDate: new Date(2026, 8, 21),
    ReloadAllData: jest.fn(async (date) => {
      state.running++;
      state.maxRunning = Math.max(state.maxRunning, state.running);
      state.calls.push(date);
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (date === 'error') {
        state.running--;
        throw new Error('database closed');
      }
      module.CurrentLiturgyDayInformation = { Today: { Date: date } };
      state.running--;
    }),
  };
  return module;
});

import React from 'react';
import { Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';
import * as DataService from '../../src/Services/DataService';
import * as LiturgyStore from '../../src/Controllers/LiturgyStore';

beforeEach(() => {
  DataService.__state.running = 0;
  DataService.__state.maxRunning = 0;
  DataService.__state.calls = [];
});

test('dues recàrregues seguides es fan una darrere l’altra, mai alhora', async () => {
  const first = new Date(2026, 8, 21);
  const second = new Date(2026, 8, 22);
  await Promise.all([LiturgyStore.reload(first), LiturgyStore.reload(second)]);
  expect(DataService.__state.calls).toEqual([first, second]);
  expect(DataService.__state.maxRunning).toBe(1);
  expect(LiturgyStore.currentDate()).toBe(second);
});

test('si una recàrrega falla, la següent es fa igualment, i qui l’ha demanada se n’assabenta', async () => {
  const failing = LiturgyStore.reload('error');
  const next = LiturgyStore.reload(new Date(2026, 8, 23));
  await expect(failing).rejects.toThrow('database closed');
  await expect(next).resolves.toBeUndefined();
  expect(LiturgyStore.currentDate()).toEqual(new Date(2026, 8, 23));
});

test('cada recàrrega avisa les pantalles amb una foto nova', async () => {
  const listener = jest.fn();
  const unsubscribe = LiturgyStore.subscribe(listener);
  const before = LiturgyStore.getSnapshot();
  await LiturgyStore.reload(new Date(2026, 8, 24));
  expect(listener).toHaveBeenCalledTimes(1);
  const after = LiturgyStore.getSnapshot();
  expect(after).not.toBe(before);
  expect(after.revision).toBe(before.revision + 1);
  expect(after.day).toBe(DataService.CurrentLiturgyDayInformation);
  unsubscribe();
  await LiturgyStore.reload(new Date(2026, 8, 25));
  expect(listener).toHaveBeenCalledTimes(1);
});

test('la foto no canvia si no hi ha res de nou', () => {
  expect(LiturgyStore.getSnapshot()).toBe(LiturgyStore.getSnapshot());
});

test('la mida del text i el mode fosc es canvien sense recarregar, i avisen', () => {
  const listener = jest.fn();
  const unsubscribe = LiturgyStore.subscribe(listener);
  LiturgyStore.updateSettings({ TextSize: '5', DarkModeEnabled: true });
  expect(DataService.CurrentSettings).toMatchObject({ TextSize: '5', DarkModeEnabled: true });
  expect(listener).toHaveBeenCalledTimes(1);
  expect(DataService.ReloadAllData).not.toHaveBeenCalledWith(undefined);
  LiturgyStore.updateSettings({ InvitationPsalmOption: '99' }, false);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
});

test('useAppearance dona el mode fosc i la mida, i es posa al dia', () => {
  function Probe() {
    const { dark, textSize } = LiturgyStore.useAppearance();
    return <Text>{`${dark ? 'fosc' : 'clar'} ${textSize}`}</Text>;
  }
  LiturgyStore.updateSettings({ TextSize: '3', DarkModeEnabled: false });
  render(<Probe />);
  expect(screen.getByText('clar 3')).toBeTruthy();
  act(() => LiturgyStore.updateSettings({ TextSize: '7', DarkModeEnabled: true }));
  expect(screen.getByText('fosc 7')).toBeTruthy();
});

test('sap si ja hi ha dades i quan es van carregar', async () => {
  await LiturgyStore.reload(new Date(2026, 8, 26));
  expect(LiturgyStore.isLoaded()).toBe(true);
  expect(LiturgyStore.lastRefreshDate()).toEqual(new Date(2026, 8, 21));
});
