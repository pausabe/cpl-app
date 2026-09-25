// The new home, with the real liturgy and the clock set to each case of the design: a feast, an
// optional memorial, first Vespers with the evening Mass, Palm Sunday, Holy Saturday, Easter,
// the midnight notice and the calendar. The whole app, as in AppNavigation.test.js.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-asset', () => {
  const assets = [{ localUri: 'file:///bundle/cpl-app.db' }];
  return { ...jest.requireActual('expo-asset'), useAssets: () => [assets, undefined] };
});
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
jest.mock('react-native-youtube-iframe', () => () => null);
// Whether the app had been opened before, by the old version: yes, unless a test says otherwise
jest.mock('../../src/controllers/firstRun', () => ({ wasOpenedBefore: jest.fn(async () => true) }));
// Where the phone is comes from the phone: here it is said outright
jest.mock('../../src/services/deviceLocationService', () => ({ currentPosition: jest.fn() }));

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from '../../App';
import * as DataService from '../../src/services/dataService';
import { styleOf } from '../helpers/renderWithTheme';
import { wasOpenedBefore } from '../../src/controllers/firstRun';
import { currentPosition } from '../../src/services/deviceLocationService';
import { getPrayerText, findPrayerText } from '../helpers/prayerText';

const findText = (text) => screen.findByText(text, {}, { timeout: 15000 });

async function openAt(date, settings = {}, { offerDiocese = false } = {}) {
  jest.setSystemTime(date);
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  // Clearing the storage leaves nobody having chosen a diocese, which is exactly when the offer
  // comes up: the tests that are not about it put it away first.
  if (!offerDiocese) await AsyncStorage.setItem('DioceseOfferSeen', 'true');
  for (const [key, value] of Object.entries(settings)) await AsyncStorage.setItem(key, value);
  render(<App />);
  await screen.findByTestId('day-card', {}, { timeout: 15000 });
}

const tile = (name) => screen.getByRole('button', { name });

beforeAll(() => {
  jest.useFakeTimers({ advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

test('a feast: the day in words, the colour, the type, the title and the week; Lauds, now', async () => {
  await openAt(new Date(2026, 8, 21, 7, 30));
  expect(screen.getByText('Dilluns, 21 de setembre')).toBeTruthy();
  expect(screen.getByText('Barcelona (Diòcesi)')).toBeTruthy();
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Vermell')).toBeTruthy();
  expect(screen.getByText('Festa')).toBeTruthy();
  expect(screen.getByText('Sant Mateu, apòstol i evangelista')).toBeTruthy();
  expect(screen.getByText('Setmana XXV · Any A · Setmana I del salteri')).toBeTruthy();
  expect(tile('Laudes').props.accessibilityValue).toEqual({ text: 'Ara' });
  expect(tile('Tèrcia').props.accessibilityValue?.text).toBeUndefined();
  expect(screen.getByText('Evangeli · Mt 9,9-13')).toBeTruthy();
  expect(screen.getByText('Vine amb mi. Ell s’aixecà i se n’anà amb Jesús')).toBeTruthy();
  expect(screen.queryByText('Segona lectura')).toBeNull();
});

test('«Llegeix-ne més» opens the sheet with the life of the saint, and «Tanca» closes it', async () => {
  await openAt(new Date(2026, 8, 21, 9, 0));
  expect(screen.queryByTestId('description-sheet')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Llegeix-ne més' }));
  expect(await screen.findByTestId('description-sheet')).toBeTruthy();
  expect(getPrayerText(DataService.CurrentCelebrationInformation.description)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Tanca' }));
  await waitFor(() => expect(screen.queryByTestId('description-sheet')).toBeNull());
});

test('a weekday: the day of the week is the title, with no «Llegeix-ne més»', async () => {
  await openAt(new Date(2026, 8, 22, 10, 0));
  expect(screen.getByText('Dimarts de la setmana XXV')).toBeTruthy();
  expect(screen.getByText("Durant l'any · Any A · Setmana I del salteri")).toBeTruthy();
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Verd')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Llegeix-ne més' })).toBeNull();
  expect(tile('Tèrcia').props.accessibilityValue).toEqual({ text: 'Ara' });
});

test('Sunday: four readings, which on a narrow phone get smaller before breaking a word', async () => {
  await openAt(new Date(2026, 8, 27, 12, 0));
  for (const reading of ['Primera lectura', 'Salm', 'Segona lectura', 'Evangeli']) {
    expect(screen.getByRole('button', { name: reading })).toBeTruthy();
  }
  expect(screen.getByText('Primera lectura').props).toMatchObject({ numberOfLines: 2, adjustsFontSizeToFit: true });
  expect(screen.getByText('Evangeli').props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
});

test('an optional memorial: the switch makes it celebrated, and it is remembered for the day', async () => {
  await openAt(new Date(2026, 8, 26, 8, 0));
  expect(screen.getByText('Memòria lliure')).toBeTruthy();
  // The screen reader hears the name and the line under it together
  const memory = screen.getByRole('switch', { name: 'Celebrar la memòria. Si no l’actives, avui es resa la fèria.' });
  expect(memory.props.accessibilityState.checked).toBe(false);
  expect(screen.getByText('Si no l’actives, avui es resa la fèria.')).toBeTruthy();
  expect(styleOf(screen.getByText('Sants Cosme i Damià, màrtirs')).color).toBe('#475756');

  fireEvent.press(memory);
  await waitFor(() => expect(DataService.CurrentSettings.optionalFestivityEnabled).toBe(true));
  await findText('Avui es resa la memòria.');
  expect(await AsyncStorage.getItem('lliureDate')).toBe('26:8:2026');
  expect(styleOf(screen.getByText('Sants Cosme i Damià, màrtirs')).color).toBe('#182322');
});

test('first Vespers and the evening Mass: at 19 h, the evening one is the chosen one', async () => {
  await openAt(new Date(2026, 9, 31, 19, 0));
  expect(screen.getByText('Memòria de Santa Maria en dissabte')).toBeTruthy();
  expect(tile('Vespres').props.accessibilityValue).toEqual({ text: 'Ara' });
  expect(tile('Vespres').props.accessibilityHint).toBe('Tots Sants');
  // Under «Vespres», and under «Vespertina»
  expect(screen.getAllByText('Tots Sants')).toHaveLength(2);

  const evening = screen.getByRole('radio', { name: 'Vespertina, Tots Sants' });
  await waitFor(() => expect(evening.props.accessibilityState.checked).toBe(true));
  expect(screen.getByText('Tots Sants · Evangeli · Mt 5,1-12a')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Segona lectura' })).toBeTruthy();
  await waitFor(async () => expect(await AsyncStorage.getItem('none')).toBe('31:9:2026_vespers'));

  fireEvent.press(screen.getByRole('radio', { name: 'Avui' }));
  expect(screen.getByText('Evangeli · Lc 14,1.7-11')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Segona lectura' })).toBeNull();
  expect(await AsyncStorage.getItem('none')).toBe('31:9:2026_normal');
});

test('on entering the Vespers of the eve of la Mercè, the title seen on the home is there in full', async () => {
  await openAt(new Date(2026, 8, 23, 19, 0));
  expect(tile('Vespres').props.accessibilityHint).toBe('Mare de Déu de la Mercè');
  fireEvent.press(tile('Vespres'));
  const heading = await screen.findByTestId('hour-celebration', {}, { timeout: 15000 });
  expect(heading.props.children).toBe('Mare de Déu de la Mercè');
});

test('in the morning, the Mass of the day; the choice made is kept all day', async () => {
  await openAt(new Date(2026, 9, 31, 9, 0), { none: '31:9:2026_vespers' });
  await waitFor(() =>
    expect(screen.getByRole('radio', { name: 'Vespertina, Tots Sants' }).props.accessibilityState.checked).toBe(true),
  );
});

test('Palm Sunday: the phrase and the button of the blessing, which opens the Gospel of the palms', async () => {
  await openAt(new Date(2026, 2, 29, 10, 0));
  expect(screen.getByText('Diumenge de Rams')).toBeTruthy();
  expect(screen.getByText('Benedicció dels Rams · Mt 21,1-11')).toBeTruthy();
  expect(screen.getByText('Beneït el qui ve en nom del Senyor')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Benedicció dels Rams' }));
  await findPrayerText(/Quan eren prop de Jerusalem, arribaren a Betfagé/);
});

test('Holy Saturday: the Easter Vigil, with «Lectures i salms» and «Evangeli»', async () => {
  await openAt(new Date(2026, 3, 4, 10, 0));
  expect(screen.getByText('Vetlla Pasqual')).toBeTruthy();
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Morat')).toBeTruthy();
  expect(screen.getByText('Ha ressuscitat i anirà davant vostre a Galilea')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Lectures i salms' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Primera lectura' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Lectures i salms' }));
  await findPrayerText('Lectures de la Vetlla Pasqual');
});

test('Easter Sunday: white and a solemnity', async () => {
  await openAt(new Date(2026, 3, 5, 10, 0));
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Blanc')).toBeTruthy();
  expect(screen.getByText('Solemnitat')).toBeTruthy();
  expect(screen.getByText('Pasqua · Any A · Setmana I del salteri')).toBeTruthy();
});

test('at midnight it asks about the liturgy of yesterday, and «Sí, la d’ahir» loads it', async () => {
  await openAt(new Date(2026, 8, 22, 0, 30));
  expect(await findText('Ja estem a dimarts, 22 de setembre.')).toBeTruthy();
  expect(screen.getByText('Vols la litúrgia d’ahir, dilluns 21 de setembre?')).toBeTruthy();
  expect(tile('Completes').props.accessibilityValue).toEqual({ text: 'Ara' });
  fireEvent.press(screen.getByRole('button', { name: 'Sí, la d’ahir. Dilluns, 21 de setembre' }));
  await findText('Dilluns, 21 de setembre');
  expect(screen.queryByText('Ja estem a dimarts, 22 de setembre.')).toBeNull();
});

test('at midnight, «No, la d’avui» stays on the day', async () => {
  await openAt(new Date(2026, 8, 22, 1, 0));
  fireEvent.press(await screen.findByRole('button', { name: 'No, la d’avui. Dimarts, 22 de setembre' }));
  await waitFor(() => expect(screen.queryByText('Ja estem a dimarts, 22 de setembre.')).toBeNull());
  expect(screen.getByText('Dimarts, 22 de setembre')).toBeTruthy();
});

test('the calendar changes the day; touching outside closes it without changing it', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0));
  fireEvent.press(screen.getByRole('button', { name: 'Calendari' }));
  expect(await screen.findByTestId('calendar')).toBeTruthy();
  expect(screen.getByText('setembre de 2026')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'dimarts, 15 de setembre' }));
  fireEvent.press(screen.getByTestId('calendar-backdrop', { includeHiddenElements: true }));
  await waitFor(() => expect(screen.queryByTestId('calendar')).toBeNull());
  expect(screen.getByText('Dilluns, 21 de setembre')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Calendari' }));
  fireEvent.press(await screen.findByRole('button', { name: 'dimarts, 15 de setembre' }));
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  await findText('Dimarts, 15 de setembre');
});

test('in the calendar you move from month to month, and «Avui» goes back to today', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0));
  fireEvent.press(screen.getByRole('button', { name: 'Calendari' }));
  fireEvent.press(await screen.findByRole('button', { name: 'Mes següent' }));
  expect(screen.getByText('octubre de 2026')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'dissabte, 31 d’octubre' }));
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  await findText('Dissabte, 31 d’octubre');

  fireEvent.press(screen.getByRole('button', { name: 'Calendari' }));
  expect(await screen.findByText('octubre de 2026')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Avui' }));
  await findText('Dilluns, 21 de setembre');
});

test('with dark mode turned on, the home is dark too', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0), { darkMode: 'Activat' });
  expect(styleOf(screen.getByTestId('home')).backgroundColor).toBe('#0E1413');
});

test('between the top bar and the day card there is air: more than at the sides, less than between sections', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0));
  const column = styleOf(screen.getByTestId('home-column'));
  expect(column.paddingTop).toBeGreaterThan(column.paddingHorizontal);
  expect(column.paddingTop).toBeLessThan(column.gap);
});

// The top bar is dark teal in both modes: on iOS it is drawn dark. Drawn light, iOS 26 made the
// capsules of glass of its buttons whitish and the back arrow black.
test.each([
  ['light', 'Desactivat'],
  ['dark', 'Activat'],
])('in %s mode, the top bar is drawn dark', async (_, darkMode) => {
  await openAt(new Date(2026, 8, 21, 10, 0), { darkMode });
  const bars = screen.root.findAll((node) => node.props.userInterfaceStyle !== undefined, { deep: true });
  expect(bars.length).toBeGreaterThan(0);
  for (const bar of bars) expect(bar.props.userInterfaceStyle).toBe('dark');
});

test('whoever comes from the previous version sees the what’s new notice, and only the first time', async () => {
  jest.setSystemTime(new Date(2026, 8, 21, 10, 0));
  await AsyncStorage.clear();
  render(<App />);
  fireEvent.press(await findText('D’acord'));
  await waitFor(async () => expect(await AsyncStorage.getItem('WhatsNewSeen_9.0.0')).toBe('true'));
});

test('whoever installs the app anew does not see the what’s new notice: there is nothing to compare', async () => {
  wasOpenedBefore.mockResolvedValueOnce(false);
  jest.setSystemTime(new Date(2026, 8, 21, 10, 0));
  await AsyncStorage.clear();
  render(<App />);
  await screen.findByTestId('day-card', {}, { timeout: 15000 });
  await waitFor(async () => expect(await AsyncStorage.getItem('WhatsNewSeen_9.0.0')).toBe('true'));
  expect(screen.queryByText('Ara ho tens tot a l’inici')).toBeNull();
});

// --- The offer to find the diocese ---------------------------------------------------------

test('whoever opens the app for the first time is asked, without being told anything', async () => {
  wasOpenedBefore.mockResolvedValueOnce(false);
  await openAt(new Date(2026, 8, 21, 9, 0), {}, { offerDiocese: true });
  expect(await screen.findByTestId('diocese-offer')).toBeTruthy();
  expect(screen.getByRole('header', { name: 'De quina diòcesi ets?' })).toBeTruthy();
});

test('whoever comes from an older version is told which diocese they have been praying with', async () => {
  await openAt(new Date(2026, 8, 21, 9, 0), {}, { offerDiocese: true });
  expect(await screen.findByTestId('diocese-offer')).toBeTruthy();
  expect(screen.getByRole('header', { name: 'Estàs resant amb la diòcesi de Barcelona' })).toBeTruthy();
});

test('whoever chose a diocese once is never asked, and is not asked again later', async () => {
  await openAt(new Date(2026, 8, 21, 9, 0), { diocesis: 'Girona' }, { offerDiocese: true });
  expect(screen.queryByTestId('diocese-offer')).toBeNull();
  await waitFor(async () => expect(await AsyncStorage.getItem('DioceseOfferSeen')).toBe('true'));
});

test('the offer finds the diocese, saves it and the day is drawn again with it', async () => {
  // Girona
  currentPosition.mockResolvedValueOnce({ kind: 'position', latitude: 41.9794, longitude: 2.8214, accuracyMeters: 50 });
  await openAt(new Date(2026, 8, 21, 9, 0), {}, { offerDiocese: true });
  await screen.findByTestId('diocese-offer');
  expect(screen.getByText('Barcelona (Diòcesi)')).toBeTruthy();

  await act(async () => {
    fireEvent.press(screen.getByTestId('diocese-offer-locate'));
  });

  await waitFor(() => expect(screen.queryByTestId('diocese-offer')).toBeNull());
  expect(await AsyncStorage.getItem('diocesis')).toBe('Girona');
  expect(await findText('Girona (Diòcesi)')).toBeTruthy();
});

test('when it cannot say where they are, nothing is saved and the offer stays with the reason', async () => {
  currentPosition.mockResolvedValueOnce({ kind: 'denied' });
  await openAt(new Date(2026, 8, 21, 9, 0), {}, { offerDiocese: true });
  await screen.findByTestId('diocese-offer');

  await act(async () => {
    fireEvent.press(screen.getByTestId('diocese-offer-locate'));
  });

  expect(await findText(/No has donat permís d’ubicació/)).toBeTruthy();
  expect(screen.getByTestId('diocese-offer')).toBeTruthy();
  expect(await AsyncStorage.getItem('diocesis')).toBeNull();
});

test('in the offer too, a refusal turns the button into the way to the phone settings', async () => {
  const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  currentPosition.mockResolvedValue({ kind: 'denied' });
  await openAt(new Date(2026, 8, 21, 9, 0), {}, { offerDiocese: true });
  await screen.findByTestId('diocese-offer');

  await act(async () => {
    fireEvent.press(screen.getByTestId('diocese-offer-locate'));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId('diocese-offer-locate'));
  });

  expect(openSettings).toHaveBeenCalled();
  // The offer is still there, still with both doors, and still nothing written
  expect(screen.getByTestId('diocese-offer')).toBeTruthy();
  expect(screen.getByTestId('diocese-offer-choose')).toBeTruthy();
  expect(await AsyncStorage.getItem('diocesis')).toBeNull();
  openSettings.mockRestore();
});

test('the offer closes without writing when they already had the diocese they are in', async () => {
  currentPosition.mockResolvedValueOnce({ kind: 'position', latitude: 41.9794, longitude: 2.8214, accuracyMeters: 50 });
  await openAt(new Date(2026, 8, 21, 9, 0), { diocesis: 'Girona' }, { offerDiocese: true });
  // Having chosen it, they are not offered anything at all
  expect(screen.queryByTestId('diocese-offer')).toBeNull();
  expect(await findText('Girona (Diòcesi)')).toBeTruthy();
});

test('«La trio jo» puts the offer away and opens Configuració', async () => {
  await openAt(new Date(2026, 8, 21, 9, 0), {}, { offerDiocese: true });
  await screen.findByTestId('diocese-offer');

  await act(async () => {
    fireEvent.press(screen.getByTestId('diocese-offer-choose'));
  });

  await waitFor(() => expect(screen.queryByTestId('diocese-offer')).toBeNull());
  // Configuració is open: its own diocese picker is there, with what they still have
  expect(await findText('Himnes en llatí')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Diòcesi: Barcelona' })).toBeTruthy();
  expect(await AsyncStorage.getItem('DioceseOfferSeen')).toBe('true');
});
