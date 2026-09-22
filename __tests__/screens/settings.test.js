// Settings: the groups, the current values, and each change saved where it has always been
// and applied. With the real liturgy, so that the changes that reload it are real too.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-updates', () => ({
  isEnabled: false,
  useUpdates: () => ({}),
  runtimeVersion: '9.0.0',
  channel: 'production_90',
  updateId: 'abc',
}));
jest.mock('expo-application', () => ({ nativeApplicationVersion: '9.0.0', nativeBuildVersion: '90' }));

import React from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as DataService from '../../src/services/dataService';
import * as LiturgyStore from '../../src/controllers/liturgyStore';
import SettingsController from '../../src/controllers/SettingsController';
import AppThemeProvider from '../../src/controllers/AppThemeProvider';
import { loadDay } from '../helpers/liturgyDay';
import { METRICS, styleOf } from '../helpers/renderWithTheme';

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

beforeEach(async () => {
  await loadDay('2026-09-21');
});

test('three groups with the usual six options, and the saved values', async () => {
  await open();
  for (const group of ['Lectura', 'Calendari', 'Missa'])
    expect(screen.getByRole('header', { name: group })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Diòcesi: Barcelona' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Lloc: Diòcesi' })).toBeTruthy();
  expect(
    screen.getByText('Algunes celebracions canvien segons on reses, com la dedicació de la catedral.'),
  ).toBeTruthy();
  expect(screen.getByRole('switch', { name: 'Himnes en llatí' }).props.accessibilityState.checked).toBe(false);
  expect(
    screen.getByRole('switch', { name: 'Vídeo de llengua de signes a l’Evangeli' }).props.accessibilityState.checked,
  ).toBe(false);
  expect(styleOf(screen.getByTestId('text-size-preview')).fontSize).toBe(21);
  await waitFor(() =>
    expect(screen.getByRole('radio', { name: 'Automàtic' }).props.accessibilityState.checked).toBe(true),
  );
});

test('on a tablet, a column in the middle as wide as the one of the home', async () => {
  await open();
  expect(styleOf(screen.getByTestId('settings-column'))).toMatchObject({
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  });
});

test('the diocese is chosen in a sheet; it is saved and the liturgy reloads with it', async () => {
  await open();
  fireEvent.press(screen.getByRole('button', { name: 'Diòcesi: Barcelona' }));
  expect(await screen.findByTestId('option-sheet')).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getByRole('radio', { name: 'Andorra' }));
  });
  await waitFor(() => expect(DataService.CurrentSettings.dioceseName).toBe('Andorra'));
  expect(await AsyncStorage.getItem('diocesis')).toBe('Andorra');
  expect(screen.getByRole('button', { name: 'Diòcesi: Andorra' })).toBeTruthy();
});

test('the place, too', async () => {
  await open();
  fireEvent.press(screen.getByRole('button', { name: 'Lloc: Diòcesi' }));
  await act(async () => {
    fireEvent.press(screen.getByRole('radio', { name: 'Catedral' }));
  });
  await waitFor(() => expect(DataService.CurrentSettings.prayingPlace).toBe('Catedral'));
  expect(await AsyncStorage.getItem('lloc')).toBe('Catedral');
});

test('the Latin hymns are saved and reload the liturgy', async () => {
  await open();
  await act(async () => {
    fireEvent.press(screen.getByRole('switch', { name: 'Himnes en llatí' }));
  });
  await waitFor(() => expect(DataService.CurrentSettings.useLatin).toBe(true));
  expect(await AsyncStorage.getItem('useLatin')).toBe('true');
});

test('the sign language video is saved', async () => {
  await open();
  await act(async () => {
    fireEvent.press(screen.getByRole('switch', { name: 'Vídeo de llengua de signes a l’Evangeli' }));
  });
  expect(await AsyncStorage.getItem('showVideos')).toBe('true');
});

test('the theme, Automàtic, Clar or Fosc, is applied at once and saved as always', async () => {
  await open();
  await act(async () => {
    fireEvent.press(screen.getByRole('radio', { name: 'Fosc' }));
  });
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(true);
  expect(await AsyncStorage.getItem('darkMode')).toBe('Activat');
});

test('the text size is shown in a sample phrase and is saved on release', async () => {
  await open();
  // The slider is native: its props are the ones of the React component
  const slider = screen.UNSAFE_getByType(require('@react-native-community/slider').default);
  expect(slider.props.accessibilityLabel).toBe('Mida del text');
  act(() => slider.props.onValueChange(6));
  expect(styleOf(screen.getByTestId('text-size-preview')).fontSize).toBe(30);
  await act(async () => {
    slider.props.onSlidingComplete(6);
  });
  expect(DataService.CurrentSettings.textSize).toBe('6');
  expect(await AsyncStorage.getItem('textSize')).toBe('6');
});

// iOS has no bar at the bottom, only the home indicator (34 points on the test phone)
test('Settings scrolls to the bottom edge, and ends above the home indicator', async () => {
  await open();
  const scroll = screen.getByTestId('settings-scroll');
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(34);
  expect(scroll.props.scrollIndicatorInsets).toEqual({ bottom: 34 });
});

// On iOS the native slider drew its thumb at the start the first time Settings opened
test('on iOS the slider gets the chosen size once it has its width, so that its thumb moves there', async () => {
  await AsyncStorage.setItem('textSize', '5');
  await DataService.reloadAllData(new Date(2026, 8, 21), null);
  await open();
  const slider = () => screen.UNSAFE_getByType(require('@react-native-community/slider').default);
  const layout = (width) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 40 } } });
  expect(slider().props.accessibilityValue).toEqual({ text: 'Mida 5 de 10' });
  expect(slider().props.value).toBe(1);

  act(() => slider().props.onLayout(layout(0)));
  expect(slider().props.value).toBe(1);
  act(() => slider().props.onLayout(layout(280)));
  expect(slider().props.value).toBe(5);
});

test('in plain sight, the approval text and the versions; the technical data, behind ten taps', async () => {
  await open();
  expect(screen.getByText(/Versió de l'aplicació: 9\.0\.0 \(90\)/)).toBeTruthy();
  expect(screen.getByText(/Versió de la base de dades: \d+/)).toBeTruthy();
  expect(screen.queryByText(/EAS-channel/)).toBeNull();
  const approval = screen.getByText(/^Text oficial de la Comissió Interdiocesana/);
  for (let i = 0; i < 9; i++) fireEvent.press(approval);
  expect(screen.queryByTestId('technical-data')).toBeNull();
  fireEvent.press(approval);
  expect(screen.getByTestId('technical-data')).toBeTruthy();
  expect(screen.getByText('EAS-channel: production_90')).toBeTruthy();
  expect(screen.getByText(/^Precedència: avui \(\d+\) demà \(\d+\)$/)).toBeTruthy();
});
