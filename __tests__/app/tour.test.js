// The tour of what is new, over the whole app: it starts by itself once, it points at the real
// buttons, it goes on when they are touched (the calendar, Configuració, Lauds, the headphones) or
// with «Següent», it takes the app to the screen of the next step, and it does not come back. The
// headphones open the player paused: nothing is heard unless ▶ is touched.
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
// Nothing is drawn in a test: everything the tour points at is here
jest.mock('../../src/components/measureInWindow', () => ({
  measureInWindow: async () => ({ x: 20, y: 120, width: 160, height: 56 }),
}));
// cpl-api, here: every piece is a second of silence, which is enough for the tour
jest.mock('../../src/services/audio/pieceClient', () => {
  const actual = jest.requireActual('../../src/services/audio/pieceClient');
  const { FRAME_SECONDS, silence } = jest.requireActual('../../src/services/audio/mp3');
  const second = () => silence(1).slice(0, Math.round(1 / FRAME_SECONDS) * 144);
  return {
    ...actual,
    fetchPieces: jest.fn(async (batch) => ({ found: new Map(batch.map((p) => [p.key, second()])), missing: [] })),
  };
});

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from '../../App';
import { navigationRef } from '../../src/controllers/NavigationController';
import { currentStep, nextStep, resetTour } from '../../src/controllers/tourController';
import { TOUR_VERSION, tourButtons, tourSteps } from '../../src/view-models/tour';
import { getListenState, stop } from '../../src/controllers/listenController';

const fakeAudio = jest.requireMock('expo-audio');
const heard = () => fakeAudio.__players.some((player) => player.playing);

const NOW = new Date(2026, 9, 9, 8, 0, 0);
const findText = (text) => screen.findByText(text, {}, { timeout: 15000 });
const route = () => navigationRef.getCurrentRoute()?.name;
const next = () => fireEvent.press(screen.getByTestId('tour-next'));

beforeEach(async () => {
  jest.useFakeTimers({ now: NOW, advanceTimers: true });
  await AsyncStorage.clear();
  // The notices of before have been seen: the tour comes when the home has nothing else to say
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  await AsyncStorage.setItem('DioceseOfferSeen', 'true');
  resetTour();
  globalThis.__CPL_NO_TOUR__ = false;
});
afterEach(() => {
  globalThis.__CPL_NO_TOUR__ = true;
  stop();
  jest.useRealTimers();
});

test('the steps: without the voice (cpl-cloud has it off) there is nothing about listening', () => {
  const all = tourSteps({ audio: true }).map((s) => s.id);
  const silent = tourSteps({ audio: false }).map((s) => s.id);
  expect(all).toEqual(expect.arrayContaining(['laudes', 'listen-button', 'listen-bar', 'day-audio']));
  expect(silent).not.toEqual(expect.arrayContaining(['listen-button']));
  expect(silent).toContain('calendar-button');
  const steps = tourSteps({ audio: true });
  expect(tourButtons(steps[0], 0, steps.length)).toEqual({ primary: 'Som-hi', secondary: 'Ara no', progress: null });
  expect(tourButtons(steps[1], 1, steps.length)).toMatchObject({ primary: null, progress: `1 de ${steps.length - 2}` });
  expect(tourButtons(steps[steps.length - 1], steps.length - 1, steps.length)).toMatchObject({
    primary: 'Fet',
    secondary: null,
  });
});

test('once, by itself, through the real app: the calendar, Configuració, Lauds and the headphones', async () => {
  render(<App />);

  await findText("Hi ha unes quantes coses noves a l'app. Te les ensenyem en un minut?");
  next();

  await findText('El calendari litúrgic és nou. Toca’l.');
  // The real button, through the hole: the step goes on when the calendar opens
  fireEvent.press(screen.getByTestId('calendar-button'));
  await findText(/Cada mes amb el color del seu temps/);
  expect(route()).toBe('Calendar');
  next();

  // Back to the home by itself, where Configuració is
  await findText('A Configuració també hi ha coses noves. Toca-la.');
  expect(route()).toBe('Home');
  fireEvent.press(screen.getByTestId('settings-button'));
  await findText('La diòcesi es pot triar sola, amb la ubicació del mòbil.');
  next();
  await findText(/Laudes porta l’Evangeli del dia/);
  next();
  await findText(/baixa't l'àudio d'avui/);
  next();

  await findText('I la novetat més gran: escoltar la pregària. Obre Laudes.');
  expect(route()).toBe('Home');
  fireEvent.press(screen.getByTestId('hour-laudes'));
  await findText(/Toca els auriculars/);
  fireEvent.press(screen.getByTestId('listen-button'));
  await findText(/La pantalla va marcant el que es diu/);
  // The player is there, paused, and nothing is heard
  expect(screen.getByTestId('listen-bar')).toBeTruthy();
  expect(getListenState().phase).toBe('paused');
  next();

  await findText('Això és tot');
  expect(heard()).toBe(false);
  next();
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(await AsyncStorage.getItem(`tourSeen_${TOUR_VERSION}`)).toBe('true');
  // And it goes away with the tour
  expect(getListenState().phase).toBe('idle');
  expect(screen.queryByTestId('listen-bar')).toBeNull();
  expect(heard()).toBe(false);
});

test('▶ touched during the tour is heard, and the end of the tour leaves it playing', async () => {
  render(<App />);
  await findText("Hi ha unes quantes coses noves a l'app. Te les ensenyem en un minut?");
  // Straight to Lauds
  act(() => {
    while (currentStep()?.id !== 'laudes') nextStep();
  });
  await findText('I la novetat més gran: escoltar la pregària. Obre Laudes.');
  fireEvent.press(screen.getByTestId('hour-laudes'));
  await findText(/Toca els auriculars/);
  fireEvent.press(screen.getByTestId('listen-button'));
  await findText(/La pantalla va marcant el que es diu/);

  fireEvent.press(screen.getByTestId('listen-toggle'));
  await waitFor(() => expect(heard()).toBe(true), { timeout: 15000 });

  fireEvent.press(screen.getByTestId('tour-leave'));
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(getListenState().phase).toBe('playing');
  expect(screen.getByTestId('listen-bar')).toBeTruthy();
});

test('«Ara no» puts it away for good; Configuració shows it again', async () => {
  const view = render(<App />);
  await findText("Hi ha unes quantes coses noves a l'app. Te les ensenyem en un minut?");
  fireEvent.press(screen.getByTestId('tour-leave'));
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(await AsyncStorage.getItem(`tourSeen_${TOUR_VERSION}`)).toBe('true');

  // Opened again: nothing
  view.unmount();
  resetTour();
  render(<App />);
  await findText('Laudes');
  await act(async () => {
    jest.advanceTimersByTime(3000);
  });
  expect(screen.queryByTestId('tour')).toBeNull();

  // Unless it is asked for
  fireEvent.press(screen.getByTestId('settings-button'));
  fireEvent.press(await screen.findByTestId('show-tour', {}, { timeout: 15000 }));
  await findText("Hi ha unes quantes coses noves a l'app. Te les ensenyem en un minut?");
  expect(route()).toBe('Home');
});
