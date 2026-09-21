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
jest.mock('expo-splash-screen', () => ({ hideAsync: jest.fn(async () => {}), preventAutoHideAsync: jest.fn(async () => {}) }));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const WebView = (props) => <View testID="webview" {...props} />;
  return { __esModule: true, default: WebView, WebView };
});

import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
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

  // Home: today's celebration
  await findText('Diumenge de Pasqua');
  expect(DataService.CurrentLiturgyDayInformation.Today.Date.getDate()).toBe(5);

  // Liturgy of the Hours: every hour opens and shows its texts
  fireEvent.press(screen.getByLabelText('Litúrgia de les hores'));
  for (const hour of ['Ofici de lectura', 'Laudes', 'Tèrcia', 'Sexta', 'Nona', 'Vespres', 'Completes']) {
    fireEvent.press(await findText(hour));
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
    await goBack(new RegExp(escape(firstWords(expected))));
  }

  // Mass: the readings open
  fireEvent.press(screen.getByLabelText('Missa'));
  fireEvent.press(await findText(/Evangeli/));
  const gospel = new RegExp(escape(firstWords(DataService.CurrentMassLiturgy.Today.Gospel.Gospel)));
  await waitFor(() => expect(screen.getAllByText(gospel).length).toBeGreaterThan(0));
  await goBack(gospel);

  // Home: the contact page opens in a web view; the donation goes to Stripe in the browser
  // (the tests run as iOS; on Android it is a web view too)
  fireEvent.press(screen.getByLabelText('Inici'));
  fireEvent.press(await findText('Missatge'));
  await screen.findByTestId('webview', {}, { timeout: 15000 });
  fireEvent.press(screen.getAllByRole('button', { name: /back|enrere/i })[0]);
  await waitFor(() => expect(screen.queryByTestId('webview')).toBeNull(), { timeout: 15000 });
  await act(async () => { jest.advanceTimersByTime(2000); });
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  fireEvent.press(await findText('Donatiu lliure'));
  expect(openURL).toHaveBeenCalledWith(expect.stringContaining('stripe.com'));

  // Settings open from Home
  fireEvent.press(await screen.findByLabelText('Configuració'));
  await findText(/Diòcesi/);
});

function firstWords(text) {
  expect(typeof text).toBe('string');
  return text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 4).join(' ');
}
function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
