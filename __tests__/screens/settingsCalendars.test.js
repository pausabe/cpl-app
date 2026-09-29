// Settings with a database that has calendars (see calendarService): the dioceses and the places the
// sheets offer are those of the database, and a diocese without the place chosen until now takes its
// first one. The language of the texts is offered when the website has more than one edition. The
// liturgy is the real one, with the database the app carries.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-application', () => ({ nativeApplicationVersion: '9.0.0', nativeBuildVersion: '90' }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('../../src/services/deviceLocationService', () => ({ currentPosition: jest.fn() }));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const WebView = (props) => <View testID="webview" {...props} />;
  return { __esModule: true, default: WebView, WebView };
});
jest.mock('../../src/services/databaseUpdateService', () => ({
  ...jest.requireActual('../../src/services/databaseUpdateService'),
  prepareEdition: jest.fn(async () => 'ready'),
}));
jest.mock('../../src/services/calendarService', () => {
  const actual = jest.requireActual('../../src/services/calendarService');
  const places = { Barcelona: ['Diòcesi', 'Ciutat', 'Catedral'], Andorra: ['Diòcesi'], Mallorca: ['Diòcesi'] };
  return {
    ...actual,
    obtainPlaceOptions: jest.fn(async () => ({
      dioceses: Object.keys(places),
      placesOf: (diocese) => places[diocese] ?? [],
    })),
  };
});

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as LiturgyStore from '../../src/controllers/liturgyStore';
import SettingsController from '../../src/controllers/SettingsController';
import AppThemeProvider from '../../src/controllers/AppThemeProvider';
import { prepareEdition } from '../../src/services/databaseUpdateService';
import { loadDay } from '../helpers/liturgyDay';
import { METRICS } from '../helpers/renderWithTheme';

async function open() {
  LiturgyStore.publish();
  render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <AppThemeProvider>
        <SettingsController />
      </AppThemeProvider>
    </SafeAreaProvider>,
  );
  await screen.findByText('Himnes en llatí');
}

// The sheet offers these options and no others
function expectOptions(sheet, names) {
  const options = within(sheet);
  expect(options.getAllByRole('radio')).toHaveLength(names.length);
  for (const name of names) expect(options.getByRole('radio', { name })).toBeTruthy();
}

beforeEach(async () => {
  await loadDay('2026-09-21', 'gironaCiutat');
  await AsyncStorage.setItem('diocesis', 'Barcelona');
  await AsyncStorage.setItem('lloc', 'Ciutat');
});

test('the dioceses are those of the calendars of the database', async () => {
  await open();
  fireEvent.press(await screen.findByRole('button', { name: 'Diòcesi: Barcelona' }));
  expectOptions(await screen.findByTestId('option-sheet'), ['Barcelona', 'Andorra', 'Mallorca']);
});

test('a diocese with only one place takes it', async () => {
  await open();
  fireEvent.press(await screen.findByRole('button', { name: 'Diòcesi: Barcelona' }));
  await act(async () => {
    fireEvent.press(screen.getByRole('radio', { name: 'Mallorca' }));
  });
  await waitFor(async () => expect(await AsyncStorage.getItem('lloc')).toBe('Diòcesi'));
  expect(await AsyncStorage.getItem('diocesis')).toBe('Mallorca');
  // With a single place there is nothing to choose, and the row goes
  expect(screen.queryByRole('button', { name: /^Lloc/ })).toBeNull();
});

test('the places are those of the diocese', async () => {
  await open();
  fireEvent.press(await screen.findByRole('button', { name: 'Lloc: Ciutat' }));
  expectOptions(await screen.findByTestId('option-sheet'), ['Diòcesi', 'Ciutat', 'Catedral']);
});

describe('the language of the texts', () => {
  // Only the builds that carry EXPO_PUBLIC_CPL_EDITIONS offer it
  beforeEach(() => {
    process.env.EXPO_PUBLIC_CPL_EDITIONS = '1';
  });
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_CPL_EDITIONS;
  });

  test('is not offered by a build without EXPO_PUBLIC_CPL_EDITIONS, whatever the website has', async () => {
    delete process.env.EXPO_PUBLIC_CPL_EDITIONS;
    await AsyncStorage.setItem('KnownEditions', JSON.stringify(['ca', 'es']));
    await open();

    expect(screen.queryByRole('button', { name: /^Llengua dels textos/ })).toBeNull();
  });

  test('is not offered while the website has only the Catalan one', async () => {
    await open();

    expect(screen.queryByRole('button', { name: /^Llengua dels textos/ })).toBeNull();
  });

  test('with more than one, choosing another one downloads its texts first and then keeps it', async () => {
    await AsyncStorage.setItem('KnownEditions', JSON.stringify(['ca', 'es']));
    await open();

    fireEvent.press(await screen.findByRole('button', { name: 'Llengua dels textos: Català' }));
    expectOptions(await screen.findByTestId('option-sheet'), ['Català', 'Castellano']);
    await act(async () => {
      fireEvent.press(screen.getByRole('radio', { name: 'Castellano' }));
    });

    expect(prepareEdition).toHaveBeenCalledWith('es');
    await waitFor(async () => expect(await AsyncStorage.getItem('edicio')).toBe('es'));
    expect(await screen.findByRole('button', { name: 'Llengua dels textos: Castellano' })).toBeTruthy();
  });

  test('if its texts cannot be downloaded, nothing changes and it says why', async () => {
    prepareEdition.mockResolvedValueOnce('unreachable');
    await AsyncStorage.setItem('KnownEditions', JSON.stringify(['ca', 'es']));
    await open();

    fireEvent.press(await screen.findByRole('button', { name: 'Llengua dels textos: Català' }));
    await act(async () => {
      fireEvent.press(screen.getByRole('radio', { name: 'Castellano' }));
    });

    expect(await screen.findByText(/No s’han pogut baixar els textos/)).toBeTruthy();
    expect(await AsyncStorage.getItem('edicio')).toBeNull();
    expect(screen.getByRole('button', { name: 'Llengua dels textos: Català' })).toBeTruthy();
  });
});
