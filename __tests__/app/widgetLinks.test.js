// A touch on a widget of the home screen opens the app at what the widget showed (cpl://…, see
// view-models/widgets): the hour of that day, the readings of its Mass or the home, with the app
// closed or open. From midnight to 2 h the widget shows yesterday's Completes, and opening them asks
// nothing.
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

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import App from '../../App';
import { navigationRef } from '../../src/controllers/NavigationController';
import * as LiturgyStore from '../../src/controllers/liturgyStore';

const route = () => navigationRef.getCurrentRoute();
const shownDay = () => {
  const date = LiturgyStore.currentDate();
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

let urlListeners = [];
const touchWidget = (url) =>
  act(async () => {
    urlListeners.forEach((listener) => listener({ url }));
  });

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  await AsyncStorage.setItem('DioceseOfferSeen', 'true');
  urlListeners = [];
  jest.spyOn(Linking, 'addEventListener').mockImplementation((event, listener) => {
    if (event === 'url') urlListeners.push(listener);
    return { remove: () => (urlListeners = urlListeners.filter((other) => other !== listener)) };
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function openAt(now, initialUrl = null) {
  jest.useFakeTimers({ now, advanceTimers: true });
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(initialUrl);
  render(<App />);
}

test('at 1 h, yesterday’s Completes, straight away and without the midnight question', async () => {
  openAt(new Date(2026, 9, 9, 1, 10), 'cpl://hour/completes?day=2026-10-08');
  await waitFor(() => expect(route()?.name).toBe('LHDisplay'), { timeout: 15000 });
  expect(route().params).toMatchObject({ type: 'Completes', title: 'Completes' });
  expect(shownDay()).toBe('8/10');
  expect(screen.queryByTestId('late-prayer')).toBeNull();
});

test('opened by hand at the same hour, the question is still there', async () => {
  openAt(new Date(2026, 9, 9, 1, 10));
  await waitFor(() => expect(screen.getByTestId('late-prayer')).toBeTruthy(), { timeout: 15000 });
  expect(route()?.name).toBe('Home');
});

test('with the app open: an hour, the Gospel of another day, and the home again', async () => {
  openAt(new Date(2026, 9, 9, 19, 30));
  await waitFor(() => expect(route()?.name).toBe('Home'), { timeout: 15000 });
  await waitFor(() => expect(urlListeners.length).toBeGreaterThan(0));

  await touchWidget('cpl://hour/vespres?day=2026-10-09');
  await waitFor(() => expect(route()?.name).toBe('LHDisplay'), { timeout: 15000 });
  expect(route().params).toMatchObject({ type: 'Vespres', title: 'Vespres' });

  // The widget of the Gospel, still on the day of Saint Teresa: that day, and the Mass of the day
  await touchWidget('cpl://mass/Evangeli?day=2026-10-15');
  await waitFor(() => expect(route()?.name).toBe('LDDisplay'), { timeout: 15000 });
  expect(route().params).toMatchObject({ type: 'Evangeli', title: 'Missa', useVespersTexts: false });
  expect(shownDay()).toBe('15/10');

  await touchWidget('cpl://today');
  await waitFor(() => expect(route()?.name).toBe('Home'), { timeout: 15000 });
  await waitFor(() => expect(shownDay()).toBe('9/10'), { timeout: 15000 });
});

test('a link that is not of the widgets opens nothing', async () => {
  openAt(new Date(2026, 9, 9, 10, 0), 'cpl://hour/matines?day=2026-10-09');
  await waitFor(() => expect(route()?.name).toBe('Home'), { timeout: 15000 });
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(route()?.name).toBe('Home');
  expect(shownDay()).toBe('9/10');
});
