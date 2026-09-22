// The prayer screens as the user touches them: the "Aa" button of the top bar, the text size and
// the dark mode, and the choices that are kept for the next time (invitatory psalm, Marian
// antiphon). With the real liturgy of a day.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => {
  const { View } = require('react-native');
  return (props) => <View testID="youtube" {...props} />;
});

import React from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, fireEvent, act, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as DataService from '../../src/services/dataService';
import * as LiturgyStore from '../../src/controllers/liturgyStore';
import { HoursPrayerController, MassPrayerController } from '../../src/controllers/PrayerController';
import AppThemeProvider from '../../src/controllers/AppThemeProvider';
import { loadDay } from '../helpers/liturgyDay';
import { METRICS, styleOf } from '../helpers/renderWithTheme';

function withApp(ui) {
  return (
    <SafeAreaProvider initialMetrics={METRICS}>
      <AppThemeProvider>{ui}</AppThemeProvider>
    </SafeAreaProvider>
  );
}

// Mounts a controller as the stack navigator would, and draws the header button it asks for
async function open(Controller, params) {
  const navigation = { setOptions: jest.fn(), addListener: () => () => {} };
  LiturgyStore.publish();
  const view = render(withApp(<Controller route={{ params }} navigation={navigation} />));
  await act(async () => {
    await Promise.resolve();
  });
  const options = navigation.setOptions.mock.calls[navigation.setOptions.mock.calls.length - 1][0];
  return { view, headerRight: options.headerRight };
}

// The header belongs to the navigator: the button the screen asks for is pressed as it is given
async function pressHeaderButton(headerRight) {
  const button = headerRight();
  expect(button.props.accessibilityLabel).toBe('Mida del text i tema');
  expect(button.props.text).toBe('Aa');
  await act(async () => {
    button.props.onPress();
  });
}

beforeEach(async () => {
  await loadDay('2026-09-21');
});

test('el botó Aa obre el full; A+ fa el text més gran a l’instant i ho desa', async () => {
  const { view, headerRight } = await open(HoursPrayerController, { type: 'Laudes', title: 'Laudes' });
  expect(styleOf(view.getByText('Sigueu amb nosaltres, Déu nostre.')).fontSize).toBe(21);

  await pressHeaderButton(headerRight);
  expect(view.getByText('Mida 3 de 10')).toBeTruthy();
  await act(async () => {
    fireEvent.press(view.getByRole('button', { name: 'Text més gran' }));
  });

  expect(styleOf(view.getByText('Sigueu amb nosaltres, Déu nostre.')).fontSize).toBe(24);
  expect(view.getByText('Mida 4 de 10')).toBeTruthy();
  expect(DataService.CurrentSettings.textSize).toBe('4');
  expect(await AsyncStorage.getItem('textSize')).toBe('4');

  fireEvent.press(view.getByRole('button', { name: 'Fet' }));
  expect(view.queryByText('Mida 4 de 10')).toBeNull();
});

test('el tema fosc es tria al mateix full i la pregària es torna fosca', async () => {
  const { view, headerRight } = await open(HoursPrayerController, { type: 'Vespres', title: 'Vespres' });
  await pressHeaderButton(headerRight);
  await act(async () => {
    fireEvent.press(view.getByRole('radio', { name: 'Fosc' }));
  });
  expect(DataService.CurrentSettings.darkModeEnabled).toBe(true);
  expect(await AsyncStorage.getItem('darkMode')).toBe('Activat');
  expect(styleOf(view.getByText('HIMNE')).color).toBe('#F28B82');
});

test('el salm invitatori triat es recorda', async () => {
  await open(HoursPrayerController, { type: 'Laudes', title: 'Laudes' });
  fireEvent.press(screen.getByRole('button', { name: "Començar amb l'invitatori" }));
  expect(screen.getByRole('radio', { name: 'Salm 94' }).props.accessibilityState.checked).toBe(true);
  fireEvent.press(screen.getByRole('radio', { name: 'Salm 99' }));
  expect(screen.getByRole('radio', { name: 'Salm 99' }).props.accessibilityState.checked).toBe(true);
  expect(screen.getByText(/Invitació a lloar Déu en el seu temple/)).toBeTruthy();
  expect(DataService.CurrentSettings.invitationPsalmOption).toBe('99');
  await act(async () => {
    await Promise.resolve();
  });
  expect(await AsyncStorage.getItem('salmInvitatori')).toBe('99');
  expect(screen.getByRole('button', { name: "Amagar l'invitatori" })).toBeTruthy();
});

test('l’antífona de la Mare de Déu triada es recorda', async () => {
  await open(HoursPrayerController, { type: 'Completes', title: 'Completes' });
  expect(screen.getByRole('header', { name: 'Antífona final de la Mare de Déu' })).toBeTruthy();
  fireEvent.press(screen.getByRole('radio', { name: 'Ant. 3' }));
  expect(screen.getByRole('radio', { name: 'Ant. 3' }).props.accessibilityState.checked).toBe(true);
  expect(DataService.CurrentSettings.virginAntiphonOption).toBe('3');
  await act(async () => {
    await Promise.resolve();
  });
  expect(await AsyncStorage.getItem('antMare')).toBe('3');
});

test('les primeres vespres porten a dalt, sencer, el títol que l’inici escurça', async () => {
  await loadDay('2026-09-23');
  await open(HoursPrayerController, { type: 'Vespres', title: 'Vespres', subtitle: 'Mare de Déu de la Mercè' });
  const heading = screen.getByRole('header', { name: 'Mare de Déu de la Mercè' });
  expect(heading.props.testID).toBe('hour-celebration');
  expect(heading.props.numberOfLines).toBeUndefined();
  // Red and centred, like the heading of the final antiphon of Completes
  expect(styleOf(heading)).toMatchObject({ color: '#B3261E', textAlign: 'center' });
});

test('una hora sense res a sota del nom, a l’inici, no porta cap títol de més', async () => {
  await loadDay('2026-09-22');
  await open(HoursPrayerController, { type: 'Vespres', title: 'Vespres' });
  expect(screen.queryByTestId('hour-celebration')).toBeNull();
});

test('a Pasqua només hi ha la cinquena antífona, sense selector', async () => {
  await loadDay('2026-04-05');
  await open(HoursPrayerController, { type: 'Completes', title: 'Completes' });
  expect(screen.queryAllByRole('radio')).toHaveLength(0);
  expect(DataService.CurrentSettings.virginAntiphonOption).toBe('5');
});

test('les lectures: «Continua amb el Salm» mostra el salm a sota', async () => {
  await open(MassPrayerController, { type: '1Lect', title: 'Missa', need_lectura2: false, useVespersTexts: false });
  expect(screen.getByRole('header', { name: 'Lectura primera' })).toBeTruthy();
  expect(screen.queryByRole('header', { name: 'Salm responsorial' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Continua amb el Salm' }));
  expect(screen.getByRole('header', { name: 'Salm responsorial' })).toBeTruthy();
  expect(screen.getByRole('button', { name: "Continua amb l'Evangeli" })).toBeTruthy();
});

test('el vídeo de llengua de signes només surt si està activat', async () => {
  await open(MassPrayerController, { type: 'Evangeli', title: 'Missa', need_lectura2: false, useVespersTexts: false });
  expect(screen.queryByTestId('gospel-video')).toBeNull();
});

// The only Mass with a video in the database: the 30th Sunday of the year, cycle C
test('amb el vídeo activat, surt sobre l’Evangeli del 26 d’octubre de 2025, tan ample com la columna', async () => {
  await loadDay('2025-10-26');
  await AsyncStorage.setItem('showVideos', 'true');
  await open(MassPrayerController, { type: 'Evangeli', title: 'Missa', need_lectura2: false, useVespersTexts: false });
  // The setting is read when the screen opens
  const frame = await screen.findByTestId('gospel-video');
  expect(styleOf(frame)).toMatchObject({ width: '100%', aspectRatio: 16 / 9 });
  // The player, once the frame knows its width: 16:9 of it
  fireEvent(frame, 'layout', { nativeEvent: { layout: { width: 352, height: 198 } } });
  expect(screen.getByTestId('youtube').props).toMatchObject({ videoId: 'futmD6C8ryw', width: 352, height: 198 });
  await AsyncStorage.removeItem('showVideos');
});

test('les lectures s’alineen a l’esquerra i tenen una amplada màxima', async () => {
  await open(MassPrayerController, { type: 'Evangeli', title: 'Missa', need_lectura2: false, useVespersTexts: false });
  const gospel = DataService.CurrentMassLiturgy.today.gospel.gospel.replace(/\s+$/, '');
  expect(styleOf(screen.getByText(gospel)).textAlign).toBe('left');
});

// iOS has no bar at the bottom, only the home indicator (34 points on the test phone)
test.each([
  ['an hour', HoursPrayerController, { type: 'Laudes', title: 'Laudes' }],
  [
    'the readings',
    MassPrayerController,
    { type: 'Evangeli', title: 'Missa', need_lectura2: false, useVespersTexts: false },
  ],
])('the text of %s runs to the bottom edge, and ends above the home indicator', async (_, Controller, params) => {
  await open(Controller, params);
  const scroll = screen.getByTestId('prayer-scroll');
  expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBe(40 + 34);
  expect(scroll.props.scrollIndicatorInsets).toEqual({ bottom: 34 });
});
