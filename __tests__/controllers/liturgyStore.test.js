// The seam between the screens and DataService: snapshots, notices of change, and one reload at
// a time.
jest.mock('../../src/services/dataService', () => {
  const state = { running: 0, maxRunning: 0, calls: [] };
  // An ES module, as the real one: `import * as` sees the variables it reassigns
  const module = {
    __esModule: true,
    __state: state,
    CurrentSettings: { darkModeEnabled: false, textSize: '3' },
    CurrentDatabaseInformation: {},
    CurrentLiturgyDayInformation: { today: { date: undefined } },
    CurrentCelebrationInformation: {},
    CurrentHoursLiturgy: {},
    CurrentMassLiturgy: {},
    LastRefreshDate: new Date(2026, 8, 21),
    reloadAllData: jest.fn(async (date) => {
      state.running++;
      state.maxRunning = Math.max(state.maxRunning, state.running);
      state.calls.push(date);
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (date === 'error') {
        state.running--;
        throw new Error('database closed');
      }
      module.CurrentLiturgyDayInformation = { today: { date: date } };
      state.running--;
    }),
  };
  return module;
});

import React from 'react';
import { Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';
import * as DataService from '../../src/services/dataService';
import * as LiturgyStore from '../../src/controllers/liturgyStore';

beforeEach(() => {
  DataService.__state.running = 0;
  DataService.__state.maxRunning = 0;
  DataService.__state.calls = [];
});

test('two reloads in a row happen one after the other, never at the same time', async () => {
  const first = new Date(2026, 8, 21);
  const second = new Date(2026, 8, 22);
  await Promise.all([LiturgyStore.reload(first), LiturgyStore.reload(second)]);
  expect(DataService.__state.calls).toEqual([first, second]);
  expect(DataService.__state.maxRunning).toBe(1);
  expect(LiturgyStore.currentDate()).toBe(second);
});

test('if a reload fails, the next one happens all the same, and whoever asked for it is told', async () => {
  const failing = LiturgyStore.reload('error');
  const next = LiturgyStore.reload(new Date(2026, 8, 23));
  await expect(failing).rejects.toThrow('database closed');
  await expect(next).resolves.toBeUndefined();
  expect(LiturgyStore.currentDate()).toEqual(new Date(2026, 8, 23));
});

test('every reload tells the screens with a new snapshot', async () => {
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

test('the snapshot does not change if there is nothing new', () => {
  expect(LiturgyStore.getSnapshot()).toBe(LiturgyStore.getSnapshot());
});

test('the text size and dark mode change without reloading, and tell the screens', () => {
  const listener = jest.fn();
  const unsubscribe = LiturgyStore.subscribe(listener);
  LiturgyStore.updateSettings({ textSize: '5', darkModeEnabled: true });
  expect(DataService.CurrentSettings).toMatchObject({ textSize: '5', darkModeEnabled: true });
  expect(listener).toHaveBeenCalledTimes(1);
  expect(DataService.reloadAllData).not.toHaveBeenCalledWith(undefined);
  LiturgyStore.updateSettings({ invitationPsalmOption: '99' }, false);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
});

test('useAppearance gives the dark mode and the size, and keeps itself up to date', () => {
  function Probe() {
    const { dark, textSize } = LiturgyStore.useAppearance();
    return <Text>{`${dark ? 'dark' : 'light'} ${textSize}`}</Text>;
  }
  LiturgyStore.updateSettings({ textSize: '3', darkModeEnabled: false });
  render(<Probe />);
  expect(screen.getByText('light 3')).toBeTruthy();
  act(() => LiturgyStore.updateSettings({ textSize: '7', darkModeEnabled: true }));
  expect(screen.getByText('dark 7')).toBeTruthy();
});

test('it knows whether there is data already and when it was loaded', async () => {
  await LiturgyStore.reload(new Date(2026, 8, 26));
  expect(LiturgyStore.isLoaded()).toBe(true);
  expect(LiturgyStore.lastRefreshDate()).toEqual(new Date(2026, 8, 21));
});
