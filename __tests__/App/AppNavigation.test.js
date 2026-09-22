// The whole app, from <App/> down, rendered in Node: it opens on a known day, and a user
// goes through every screen. The liturgy comes from the real cpl-app.db and the real
// services; only what needs a phone is replaced (the file system, OTA updates, web views).
//
// What it catches is a screen that no longer mounts or no longer shows its text — the
// typical damage of a library upgrade — not the exact wording, which LiturgyGolden checks.
jest.mock('../../src/Services/DatabaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-asset', () => {
  // Same reference on every render, as the real hook keeps it in state.
  const assets = [{ localUri: 'file:///bundle/cpl-app.db' }];
  return { ...jest.requireActual('expo-asset'), useAssets: () => [assets, undefined] };
});
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
  isEnabled: true,
  useUpdates: () => ({ currentlyRunning: { isEmbeddedLaunch: true }, isChecking: false, isDownloading: false, isUpdatePending: false }),
  runtimeVersion: 'test', channel: 'test', updateId: 'test',
}));
jest.mock('../../src/Controllers/FirstRun', () => ({ wasOpenedBefore: jest.fn(async () => true) }));
jest.mock('expo-splash-screen', () => ({ hideAsync: jest.fn(async () => {}), preventAutoHideAsync: jest.fn(async () => {}), setOptions: jest.fn() }));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const WebView = (props) => <View testID="webview" {...props} />;
  return { __esModule: true, default: WebView, WebView };
});

import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react-native';
import App from '../../App';
import * as DataService from '../../src/Services/DataService';

// Easter Sunday 2026, mid-morning.
const NOW = new Date(2026, 3, 5, 10, 0, 0);

beforeAll(() => {
  jest.useFakeTimers({ now: NOW, advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

const findText = (text) => screen.findByText(text, {}, { timeout: 15000 });
// Back, and wait until the screen is really gone: navigating while it is still closing
// would land on the closing route instead of opening a new one.
async function goBack(textOnTheScreen) {
  fireEvent.press(screen.getAllByRole('button', { name: /back|enrere/i })[0]);
  await waitFor(() => expect(screen.queryAllByText(textOnTheScreen)).toHaveLength(0), { timeout: 15000 });
  await act(async () => { jest.advanceTimersByTime(2000); });
}

test("s'obre al dia d'avui i es pot recórrer tota l'app", async () => {
  render(<App />);

  // The first time 9.0.0 opens, a notice says where everything is now
  fireEvent.press(await findText('D’acord'));
  await waitFor(() => expect(screen.queryByText('Ara ho tens tot a l’inici')).toBeNull());

  // Home: today's celebration, and no tabs any more
  await findText('Diumenge de Pasqua');
  expect(DataService.CurrentLiturgyDayInformation.Today.Date.getDate()).toBe(5);
  expect(screen.queryByLabelText('Litúrgia de les hores')).toBeNull();
  expect(screen.getByText('Diumenge, 5 d’abril')).toBeTruthy();

  // Liturgy of the Hours, from the home: every hour opens, with its whole name on top
  for (const hour of ['Ofici de lectura', 'Laudes', 'Tèrcia', 'Sexta', 'Nona', 'Vespres', 'Completes']) {
    fireEvent.press(screen.getByRole('button', { name: hour }));
    const hours = DataService.CurrentHoursLiturgy;
    const expected = {
      'Ofici de lectura': hours.Office.FirstPsalm.Antiphon,
      Laudes: hours.Laudes.FirstPsalm.Antiphon,
      Tèrcia: hours.Hours.ThirdHour.FirstPsalm.Antiphon ?? hours.Hours.ThirdHour.UniqueAntiphon,
      Sexta: hours.Hours.SixthHour.FirstPsalm.Antiphon ?? hours.Hours.SixthHour.UniqueAntiphon,
      Nona: hours.Hours.NinthHour.FirstPsalm.Antiphon ?? hours.Hours.NinthHour.UniqueAntiphon,
      Vespres: hours.Vespers.FinalPrayer,
      Completes: hours.NightPrayer.FinalPrayer,
    }[hour];
    await waitFor(() => expect(screen.getAllByText(new RegExp(escape(firstWords(expected)))).length).toBeGreaterThan(0));
    expect(screen.getAllByText(hour).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Mida del text i tema' })).toBeTruthy();
    await goBack(new RegExp(escape(firstWords(expected))));
  }

  // Mass, from the home: the phrase of the Gospel, and the Gospel opens
  expect(screen.getByText(DataService.CurrentMassLiturgy.Today.Gospel.Comment)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Evangeli' }));
  const gospel = new RegExp(escape(firstWords(DataService.CurrentMassLiturgy.Today.Gospel.Gospel)));
  await waitFor(() => expect(screen.getAllByText(gospel).length).toBeGreaterThan(0));
  await goBack(gospel);

  // Home: the contact page opens in a sheet with the web, and "Tanca" closes it; the donation
  // goes to Stripe in the browser (the tests run as iOS; on Android it is a sheet too)
  fireEvent.press(await findText('Missatge'));
  const sheet = await screen.findByTestId('message-sheet', {}, { timeout: 15000 });
  expect(within(sheet).getByTestId('webview').props.source).toEqual({ uri: 'https://www.cpl.es/contacto/' });
  fireEvent.press(within(sheet).getByRole('button', { name: 'Tanca' }));
  await waitFor(() => expect(screen.queryByTestId('webview')).toBeNull(), { timeout: 15000 });
  await act(async () => { jest.advanceTimersByTime(2000); });
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  fireEvent.press(await findText('Donatiu lliure'));
  expect(openURL).toHaveBeenCalledWith(expect.stringContaining('stripe.com'));

  // Settings open from the top bar
  fireEvent.press(await screen.findByLabelText('Configuració'));
  expect(await screen.findByRole('button', { name: 'Diòcesi: Barcelona' }, { timeout: 15000 })).toBeTruthy();
});

function firstWords(text) {
  expect(typeof text).toBe('string');
  return text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 4).join(' ');
}
function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
