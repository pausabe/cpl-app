// The headphones with no network and an hour that is not on the phone, through the real app: a
// dialog says why it cannot be heard and where to get it before, and nothing is left on the screen.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-asset', () => {
  const assets = [{ localUri: 'file:///bundle/cpl-app.db' }];
  return { ...jest.requireActual('expo-asset'), useAssets: () => [assets, undefined] };
});
jest.mock('../../src/services/databaseUpdateService', () => ({
  useDatabaseUpdates: () => {},
  checkForNewDatabase: jest.fn(async () => 'up-to-date'),
  knownEditions: jest.fn(async () => []),
  prepareEdition: jest.fn(async () => 'ready'),
}));
jest.mock('../../src/controllers/firstRun', () => ({ wasOpenedBefore: jest.fn(async () => true) }));
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
jest.mock('expo-file-system', () => require('../helpers/fakeFileSystem'));
jest.mock('../../src/services/audio/pieceClient', () => {
  const actual = jest.requireActual('../../src/services/audio/pieceClient');
  return {
    ...actual,
    fetchPieces: jest.fn(async () => {
      throw new actual.AudioNetworkError('offline');
    }),
  };
});

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';
import { PROBLEMS, getListenState, stop } from '../../src/controllers/listenController';

const findText = (text) => screen.findByText(text, {}, { timeout: 15000 });

beforeEach(async () => {
  jest.useFakeTimers({ now: new Date(2026, 9, 9, 8, 0, 0), advanceTimers: true });
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  await AsyncStorage.setItem('DioceseOfferSeen', 'true');
});
afterEach(() => {
  stop();
  jest.useRealTimers();
});

test('no network, Lauds not on the phone: the dialog says so, and «D’acord» puts it away', async () => {
  render(<App />);
  fireEvent.press(await screen.findByTestId('hour-laudes', {}, { timeout: 15000 }));
  fireEvent.press(await screen.findByTestId('listen-button', {}, { timeout: 15000 }));

  await findText(PROBLEMS.offline);
  expect(getListenState().phase).toBe('idle');
  expect(screen.queryByTestId('listen-bar')).toBeNull();

  fireEvent.press(screen.getByText("D'acord"));
  await waitFor(() => expect(screen.queryByText(PROBLEMS.offline)).toBeNull());
});
