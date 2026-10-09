// The tour of what is new, over the home: it starts by itself once, it points at where things are
// and goes on with its buttons only, it never leaves the home, and it does not come back. Whoever
// goes into it gets the headphones pointed at the first hour they open; whoever says «Ara no», not.
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
import { BackHandler } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from '../../App';
import { navigationRef } from '../../src/controllers/NavigationController';
import { resetTour } from '../../src/controllers/tourController';
import { FOOTNOTE, TOUR_VERSION, tourButtons, tourSteps } from '../../src/view-models/tour';
import { getListenState, stop } from '../../src/controllers/listenController';

const NOW = new Date(2026, 9, 9, 8, 0, 0);
const INTRO = 'Hi ha dues coses noves a l’app. Te les ensenyem? Són dos passos.';
const LISTEN =
  'Ara l’app et pot llegir la pregària en veu alta. Obre una hora i toca els auriculars, a dalt a la dreta.';
const CALENDAR = /^És aquí, a dalt a l’esquerra/;
const HINT = 'Toca els auriculars i l’app et llegirà la pregària en veu alta.';
const SEEN = `tourSeen_${TOUR_VERSION}`;
const HINT_KEY = `listenHint_${TOUR_VERSION}`;

const findText = (text) => screen.findByText(text, {}, { timeout: 15000 });
const route = () => navigationRef.getCurrentRoute()?.name;
const stack = () => navigationRef.getRootState().routes.map((r) => r.name);
const next = () => fireEvent.press(screen.getByTestId('tour-next'));
// Long enough for anything that was going to come up to come up
const wait = () =>
  act(async () => {
    jest.advanceTimersByTime(3000);
  });

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

test('the steps: what is coming first, then one per thing, and where to see it again at the end', () => {
  const ids = (options) => tourSteps(options).map((s) => s.id);
  expect(ids({ audio: true })).toEqual(['intro', 'listen', 'calendar']);
  // Without the voice (cpl-cloud has it off), nothing about listening
  expect(ids({ audio: false })).toEqual(['intro', 'calendar']);
  expect(ids({ audio: true, widgets: { platform: 'ios', canPin: false } })).toEqual([
    'intro',
    'listen',
    'calendar',
    'widgets',
  ]);

  const [intro, , calendar] = tourSteps({ audio: true });
  expect(intro.text).toBe(INTRO);
  expect(intro.items.map((i) => i.label)).toEqual(['Escoltar la pregària', 'El calendari litúrgic']);
  expect(calendar.footnote).toBe(FOOTNOTE);
  expect(tourSteps({ audio: false })[0].text).toBe('Hi ha una cosa nova a l’app. Te l’ensenyem?');
  const all = tourSteps({ audio: true, widgets: { platform: 'android', canPin: true } });
  expect(all[0].text).toBe('Hi ha tres coses noves a l’app. Te les ensenyem? Són tres passos.');
  expect(all.filter((s) => s.footnote).map((s) => s.id)).toEqual(['widgets']);

  // On the home, and nothing to touch: every step goes on with its button
  expect(all.every((s) => s.route === 'Home' && !s.endsWhen)).toBe(true);

  expect(tourButtons(0, 4)).toEqual({ primary: 'Som-hi', secondary: 'Ara no', progress: null });
  expect(tourButtons(1, 4)).toEqual({ primary: 'Següent', secondary: 'Surt', progress: { at: 1, of: 3 } });
  expect(tourButtons(3, 4)).toEqual({ primary: 'Fet', secondary: null, progress: { at: 3, of: 3 } });
  // Alone, a hint
  expect(tourButtons(0, 1)).toEqual({ primary: 'D’acord', secondary: null, progress: null });
});

test('the widgets of the home screen: how to put one there, or a button that does it', () => {
  const widgetsOf = (widgets) => tourSteps({ audio: true, widgets }).find((s) => s.id === 'widgets');
  const ios = widgetsOf({ platform: 'ios', canPin: false });
  expect(ios).toMatchObject({ route: 'Home', target: null, illustration: 'widget' });
  expect(ios.detail).toMatch(/toca «Edita» o «\+» i busca la CPL/);
  expect(ios.action).toBeUndefined();

  const android = widgetsOf({ platform: 'android', canPin: true });
  expect(android.action).toEqual({ label: 'Posa-la a l’inici', does: 'pin-widget' });
  expect(android.detail).toBeUndefined();
  // A launcher that cannot: by hand
  const byHand = widgetsOf({ platform: 'android', canPin: false });
  expect(byHand.action).toBeUndefined();
  expect(byHand.detail).toMatch(/toca «Widgets» i busca la CPL/);
});

test('once, by itself, on the home: listening and the calendar, without going anywhere', async () => {
  render(<App />);

  await findText(INTRO);
  expect(screen.getByText('Escoltar la pregària')).toBeTruthy();
  next();

  await findText(LISTEN);
  expect(screen.getByText('1 de 2')).toBeTruthy();
  next();

  await findText(CALENDAR);
  expect(screen.getByText(FOOTNOTE)).toBeTruthy();
  expect(screen.getByTestId('tour-next')).toHaveTextContent('Fet');
  // It never left the home
  expect(stack()).toEqual(['Home']);
  next();

  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(await AsyncStorage.getItem(SEEN)).toBe('true');
  expect(await AsyncStorage.getItem(HINT_KEY)).toBe('pending');
  // Nothing was opened, nothing is heard
  expect(getListenState().phase).toBe('idle');
});

test('after «Som-hi», the first hour points at the headphones; touching them starts the prayer, once', async () => {
  render(<App />);
  await findText(INTRO);
  next();
  await findText(LISTEN);
  fireEvent.press(screen.getByTestId('tour-leave'));
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());

  fireEvent.press(screen.getByTestId('hour-laudes'));
  await findText(HINT);
  expect(route()).toBe('LHDisplay');
  expect(screen.getByText('Nou')).toBeTruthy();

  // The real headphones, through the hole: the prayer starts as always, and the hint goes
  fireEvent.press(screen.getByTestId('listen-button'));
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(getListenState().phase).not.toBe('idle');
  expect(await AsyncStorage.getItem(HINT_KEY)).toBe('done');

  // Another hour: nothing
  stop();
  act(() => navigationRef.goBack());
  fireEvent.press(await screen.findByTestId('hour-vespres'));
  await wait();
  expect(screen.queryByTestId('tour')).toBeNull();
});

test('«D’acord» puts the hint away without playing anything', async () => {
  await AsyncStorage.setItem(SEEN, 'true');
  await AsyncStorage.setItem(HINT_KEY, 'pending');
  render(<App />);
  fireEvent.press(await screen.findByTestId('hour-laudes', {}, { timeout: 15000 }));
  await findText(HINT);
  expect(screen.getByTestId('tour-next')).toHaveTextContent('D’acord');
  next();
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(getListenState().phase).toBe('idle');
  expect(await AsyncStorage.getItem(HINT_KEY)).toBe('done');
});

test('«Ara no» puts it away for good, with no hint after it; Configuració shows it again', async () => {
  const view = render(<App />);
  await findText(INTRO);
  fireEvent.press(screen.getByTestId('tour-leave'));
  await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
  expect(await AsyncStorage.getItem(SEEN)).toBe('true');
  expect(await AsyncStorage.getItem(HINT_KEY)).toBeNull();

  // An hour: no headphones pointed at
  fireEvent.press(screen.getByTestId('hour-laudes'));
  await waitFor(() => expect(route()).toBe('LHDisplay'));
  await wait();
  expect(screen.queryByTestId('tour')).toBeNull();

  // Opened again: nothing
  view.unmount();
  resetTour();
  render(<App />);
  await screen.findByTestId('hour-laudes', {}, { timeout: 15000 });
  await wait();
  expect(screen.queryByTestId('tour')).toBeNull();

  // Unless it is asked for
  fireEvent.press(screen.getByTestId('settings-button'));
  fireEvent.press(await screen.findByTestId('show-tour', {}, { timeout: 15000 }));
  await findText(INTRO);
  // Back to the home, without Configuració under it
  expect(stack()).toEqual(['Home']);
});

test('Android’s back leaves the tour, as it closes a dialog', async () => {
  const handlers = [];
  const listen = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
    handlers.push(handler);
    return { remove: () => handlers.splice(handlers.indexOf(handler), 1) };
  });
  try {
    render(<App />);
    await findText(INTRO);
    next();
    await findText(LISTEN);

    let handled;
    act(() => {
      handled = handlers[handlers.length - 1]();
    });
    expect(handled).toBe(true);
    await waitFor(() => expect(screen.queryByTestId('tour')).toBeNull());
    expect(stack()).toEqual(['Home']);
    expect(await AsyncStorage.getItem(SEEN)).toBe('true');
  } finally {
    listen.mockRestore();
  }
});
