// The step of the tour about the widgets of the home screen, on Android: the widget drawn in the
// bubble, and a button that asks the system to put it on the home screen. The rest of the tour is in
// tour.test.js, where there are no widgets.
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
jest.mock('../../src/components/measureInWindow', () => ({
  measureInWindow: async () => ({ x: 20, y: 120, width: 160, height: 56 }),
}));
jest.mock('../../src/services/widgetService', () => ({
  hasWidgets: () => true,
  writeWidgetPayload: jest.fn(),
  canPinWidget: () => true,
  pinWidget: jest.fn(async () => true),
}));

import React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react-native';
import App from '../../App';
import { currentStep, nextStep, resetTour } from '../../src/controllers/tourController';
import { navigationRef } from '../../src/controllers/NavigationController';
import { pinWidget } from '../../src/services/widgetService';

const realOS = Platform.OS;

beforeEach(async () => {
  jest.useFakeTimers({ now: new Date(2026, 9, 9, 8, 0, 0), advanceTimers: true });
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  await AsyncStorage.setItem('DioceseOfferSeen', 'true');
  resetTour();
  globalThis.__CPL_NO_TOUR__ = false;
  Platform.OS = 'android';
});
afterEach(() => {
  globalThis.__CPL_NO_TOUR__ = true;
  Platform.OS = realOS;
  jest.useRealTimers();
});

test('the widget of now in the bubble, and «Posa-la a l’inici» asks the system to put it there', async () => {
  render(<App />);
  await screen.findByText('Hi ha tres coses noves a l’app. Te les ensenyem? Són tres passos.', {}, { timeout: 15000 });
  // Straight to the step of the widgets: the others are tried in tour.test.js
  while (currentStep()?.id !== 'widgets') act(() => nextStep());

  await screen.findByText('A la pantalla d’inici', {}, { timeout: 15000 });
  expect(navigationRef.getCurrentRoute()?.name).toBe('Home');
  // A drawing, which the screen reader skips: the words of the bubble say it
  const hidden = { includeHiddenElements: true };
  const preview = screen.getByTestId('widget-preview', hidden);
  // At 8 h, Lauds
  expect(within(preview).getByText('Laudes', hidden)).toBeTruthy();
  expect(within(preview).getByText('ARA', hidden)).toBeTruthy();
  expect(within(preview).getByText('Divendres 9 oct.', hidden)).toBeTruthy();

  // The last step: it closes the tour, whatever the system answers
  fireEvent.press(screen.getByTestId('tour-action'));
  await waitFor(() => expect(pinWidget).toHaveBeenCalledWith('ara'));
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
});
