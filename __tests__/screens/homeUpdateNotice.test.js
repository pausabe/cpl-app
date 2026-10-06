// The notice of a newer app in the store, on the home: a card above the day with a button that
// opens the store, and a cross that puts it away until a newer version comes. The whole app,
// as in home.test.js; what the store has is what the last check left written on the phone.
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
jest.mock('react-native-youtube-iframe', () => () => null);
jest.mock('../../src/controllers/firstRun', () => ({ wasOpenedBefore: jest.fn(async () => true) }));
jest.mock('expo-application', () => ({ nativeApplicationVersion: '9.0.0' }));

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react-native';
import App from '../../App';
import StorageKeys from '../../src/services/storage/storageKeys';

async function openWithStoreAt(version) {
  jest.setSystemTime(new Date(2026, 8, 21, 7, 30));
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  await AsyncStorage.setItem('DioceseOfferSeen', 'true');
  if (version) await AsyncStorage.setItem(StorageKeys.AppInStore, version);
  render(<App />);
  await screen.findByTestId('day-card', {}, { timeout: 15000 });
}

beforeAll(() => {
  jest.useFakeTimers({ advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

test('with a newer app in the store, the home says so and the button opens the App Store', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  await openWithStoreAt('9.1.0');

  expect(await screen.findByRole('header', { name: 'Hi ha una versió nova' })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Actualitza-la' }));

  expect(openURL).toHaveBeenCalledWith('https://apps.apple.com/app/id1283136025');
});

test('with the same version, or none known, there is nothing to say', async () => {
  for (const version of ['9.0.0', null]) {
    await openWithStoreAt(version);
    expect(screen.queryByTestId('update-notice')).toBeNull();
    screen.unmount();
  }
});

test('the card is the first thing on the home, above the day', async () => {
  await openWithStoreAt('9.1.0');
  const notice = await screen.findByTestId('update-notice');
  const inOrder = within(screen.getByTestId('home-column')).getAllByTestId(/^(update-notice|day-card)$/);
  expect(inOrder.map((element) => element.props.testID)).toEqual(['update-notice', 'day-card']);
  expect(screen.getByTestId('home-footer')).not.toContainElement(notice);
});

test('the cross puts it away, and it does not come back for that version', async () => {
  await openWithStoreAt('9.1.0');
  fireEvent.press(await screen.findByRole('button', { name: 'Amaga l’avís' }));

  await waitFor(() => expect(screen.queryByTestId('update-notice')).toBeNull());
  expect(await AsyncStorage.getItem(StorageKeys.AppUpdateDismissed)).toBe('9.1.0');
});
