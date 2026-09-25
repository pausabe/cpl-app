// What the home does on its own: saying so when the liturgy cannot be loaded, moving "Ara" to the
// next hour at o'clock, and loading today's liturgy when the app comes back on another day.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-asset', () => {
  const assets = [{ localUri: 'file:///bundle/cpl-app.db' }];
  return { ...jest.requireActual('expo-asset'), useAssets: () => [assets, undefined] };
});
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(async () => {}),
  preventAutoHideAsync: jest.fn(async () => {}),
  setOptions: jest.fn(),
}));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const WebView = (props) => <View testID="webview" {...props} />;
  return { __esModule: true, default: WebView, WebView };
});

import React from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, act } from '@testing-library/react-native';
import App from '../../App';
import * as DataService from '../../src/services/dataService';

async function openAt(date) {
  jest.setSystemTime(date);
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  render(<App />);
}

// The app comes to the front: what AppState tells every listener
async function comeBack() {
  const listeners = AppState.addEventListener.mock.calls
    .filter(([type]) => type === 'change')
    .map(([, listener]) => listener);
  await act(async () => {
    for (const listener of listeners) await listener('active');
  });
}

beforeAll(() => {
  jest.useFakeTimers({ advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});
afterEach(() => {
  jest.restoreAllMocks();
});

test('if the liturgy cannot be loaded, it says so instead of leaving the home blank', async () => {
  jest.spyOn(DataService, 'reloadAllData').mockRejectedValue(new Error('database closed'));
  await openAt(new Date(2026, 8, 21, 10, 0));
  expect(await screen.findByText(/Ha sorgit un error inesperat/, {}, { timeout: 15000 })).toBeTruthy();
  expect(screen.queryByTestId('day-card')).toBeNull();
});

test('on the hour, «Ara» moves to the next hour', async () => {
  await openAt(new Date(2026, 8, 21, 8, 59, 50));
  await screen.findByTestId('day-card', {}, { timeout: 15000 });
  expect(screen.getByRole('button', { name: 'Laudes' }).props.accessibilityValue?.text).toBe('Ara');
  await act(async () => {
    jest.advanceTimersByTime(20 * 1000);
  });
  expect(screen.getByRole('button', { name: 'Tèrcia' }).props.accessibilityValue?.text).toBe('Ara');
  expect(screen.getByRole('button', { name: 'Laudes' }).props.accessibilityValue?.text).toBeUndefined();
});

test('coming back to the app on another day, it loads the liturgy of today', async () => {
  await openAt(new Date(2026, 8, 21, 22, 0));
  expect(await screen.findByText('Dilluns, 21 de setembre', {}, { timeout: 15000 })).toBeTruthy();
  jest.setSystemTime(new Date(2026, 8, 22, 9, 0));
  await comeBack();
  expect(await screen.findByText('Dimarts, 22 de setembre', {}, { timeout: 15000 })).toBeTruthy();
});

test('coming back to the app on the same day, it reloads nothing', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0));
  await screen.findByTestId('day-card', {}, { timeout: 15000 });
  const reload = jest.spyOn(DataService, 'reloadAllData');
  jest.setSystemTime(new Date(2026, 8, 21, 18, 0));
  await comeBack();
  expect(reload).not.toHaveBeenCalled();
  expect(screen.getByText('Dilluns, 21 de setembre')).toBeTruthy();
});
