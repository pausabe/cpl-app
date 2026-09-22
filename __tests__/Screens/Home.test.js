// The new home, with the real liturgy and the clock set to each case of the design: a feast, an
// optional memorial, first Vespers with the evening Mass, Palm Sunday, Holy Saturday, Easter,
// the midnight notice and the calendar. The whole app, as in AppNavigation.test.js.
jest.mock('../../src/Services/DatabaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('expo-asset', () => {
  const assets = [{ localUri: 'file:///bundle/cpl-app.db' }];
  return { ...jest.requireActual('expo-asset'), useAssets: () => [assets, undefined] };
});
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
  isEnabled: true,
  useUpdates: () => ({
    currentlyRunning: { isEmbeddedLaunch: true },
    isChecking: false,
    isDownloading: false,
    isUpdatePending: false,
  }),
  runtimeVersion: 'test',
  channel: 'test',
  updateId: 'test',
}));
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
jest.mock('../../src/Controllers/FirstRun', () => ({ wasOpenedBefore: jest.fn(async () => true) }));

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from '../../App';
import * as DataService from '../../src/Services/DataService';
import { styleOf } from '../helpers/renderWithTheme';
import { wasOpenedBefore } from '../../src/Controllers/FirstRun';

const findText = (text) => screen.findByText(text, {}, { timeout: 15000 });

async function openAt(date, settings = {}) {
  jest.setSystemTime(date);
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
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

test('una festa: el dia en paraules, el color, el tipus, el títol i la setmana; Laudes, ara', async () => {
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

test('«Llegeix-ne més» obre el full amb la vida del sant, i «Tanca» el tanca', async () => {
  await openAt(new Date(2026, 8, 21, 9, 0));
  expect(screen.queryByTestId('description-sheet')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Llegeix-ne més' }));
  expect(await screen.findByTestId('description-sheet')).toBeTruthy();
  expect(screen.getByText(DataService.CurrentCelebrationInformation.Description)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Tanca' }));
  await waitFor(() => expect(screen.queryByTestId('description-sheet')).toBeNull());
});

test('una fèria: el dia de la setmana fa de títol, sense «Llegeix-ne més»', async () => {
  await openAt(new Date(2026, 8, 22, 10, 0));
  expect(screen.getByText('Dimarts de la setmana XXV')).toBeTruthy();
  expect(screen.getByText("Durant l'any · Any A · Setmana I del salteri")).toBeTruthy();
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Verd')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Llegeix-ne més' })).toBeNull();
  expect(tile('Tèrcia').props.accessibilityValue).toEqual({ text: 'Ara' });
});

test('diumenge: quatre lectures, que en un mòbil estret es fan petites abans de partir una paraula', async () => {
  await openAt(new Date(2026, 8, 27, 12, 0));
  for (const reading of ['Primera lectura', 'Salm', 'Segona lectura', 'Evangeli']) {
    expect(screen.getByRole('button', { name: reading })).toBeTruthy();
  }
  expect(screen.getByText('Primera lectura').props).toMatchObject({ numberOfLines: 2, adjustsFontSizeToFit: true });
  expect(screen.getByText('Evangeli').props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
});

test('memòria lliure: l’interruptor la fa celebrar, i es recorda per al dia', async () => {
  await openAt(new Date(2026, 8, 26, 8, 0));
  expect(screen.getByText('Memòria lliure')).toBeTruthy();
  // The screen reader hears the name and the line under it together
  const memory = screen.getByRole('switch', { name: 'Celebrar la memòria. Si no l’actives, avui es resa la fèria.' });
  expect(memory.props.accessibilityState.checked).toBe(false);
  expect(screen.getByText('Si no l’actives, avui es resa la fèria.')).toBeTruthy();
  expect(styleOf(screen.getByText('Sants Cosme i Damià, màrtirs')).color).toBe('#475756');

  fireEvent.press(memory);
  await waitFor(() => expect(DataService.CurrentSettings.OptionalFestivityEnabled).toBe(true));
  await findText('Avui es resa la memòria.');
  expect(await AsyncStorage.getItem('lliureDate')).toBe('26:8:2026');
  expect(styleOf(screen.getByText('Sants Cosme i Damià, màrtirs')).color).toBe('#182322');
});

test('primeres vespres i missa vespertina: a les 19 h, la vespertina triada', async () => {
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

test('en entrar a les vespres de la vigília de la Mercè, el títol que es veu a l’inici hi és sencer', async () => {
  await openAt(new Date(2026, 8, 23, 19, 0));
  expect(tile('Vespres').props.accessibilityHint).toBe('Mare de Déu de la Mercè');
  fireEvent.press(tile('Vespres'));
  const heading = await screen.findByTestId('hour-celebration', {}, { timeout: 15000 });
  expect(heading.props.children).toBe('Mare de Déu de la Mercè');
});

test('al matí, la missa del dia; la tria feta es manté tot el dia', async () => {
  await openAt(new Date(2026, 9, 31, 9, 0), { none: '31:9:2026_vespers' });
  await waitFor(() =>
    expect(screen.getByRole('radio', { name: 'Vespertina, Tots Sants' }).props.accessibilityState.checked).toBe(true),
  );
});

test('Diumenge de Rams: la frase i el botó de la benedicció, que obre l’evangeli dels rams', async () => {
  await openAt(new Date(2026, 2, 29, 10, 0));
  expect(screen.getByText('Diumenge de Rams')).toBeTruthy();
  expect(screen.getByText('Benedicció dels Rams · Mt 21,1-11')).toBeTruthy();
  expect(screen.getByText('Beneït el qui ve en nom del Senyor')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Benedicció dels Rams' }));
  await findText(/Quan eren prop de Jerusalem, arribaren a Betfagé/);
});

test('Dissabte Sant: la Vetlla Pasqual, amb «Lectures i salms» i «Evangeli»', async () => {
  await openAt(new Date(2026, 3, 4, 10, 0));
  expect(screen.getByText('Vetlla Pasqual')).toBeTruthy();
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Morat')).toBeTruthy();
  expect(screen.getByText('Ha ressuscitat i anirà davant vostre a Galilea')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Lectures i salms' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Primera lectura' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Lectures i salms' }));
  await findText('Lectures de la Vetlla Pasqual');
});

test('Diumenge de Pasqua: blanc i solemnitat', async () => {
  await openAt(new Date(2026, 3, 5, 10, 0));
  expect(screen.getByLabelText('Barcelona (Diòcesi). Color litúrgic: Blanc')).toBeTruthy();
  expect(screen.getByText('Solemnitat')).toBeTruthy();
  expect(screen.getByText('Pasqua · Any A · Setmana I del salteri')).toBeTruthy();
});

test('a mitjanit pregunta per la litúrgia d’ahir, i «Sí, la d’ahir» la carrega', async () => {
  await openAt(new Date(2026, 8, 22, 0, 30));
  expect(await findText('Ja estem a dimarts, 22 de setembre.')).toBeTruthy();
  expect(screen.getByText('Vols la litúrgia d’ahir, dilluns 21 de setembre?')).toBeTruthy();
  expect(tile('Completes').props.accessibilityValue).toEqual({ text: 'Ara' });
  fireEvent.press(screen.getByRole('button', { name: 'Sí, la d’ahir. Dilluns, 21 de setembre' }));
  await findText('Dilluns, 21 de setembre');
  expect(screen.queryByText('Ja estem a dimarts, 22 de setembre.')).toBeNull();
});

test('a mitjanit, «No, la d’avui» es queda al dia', async () => {
  await openAt(new Date(2026, 8, 22, 1, 0));
  fireEvent.press(await screen.findByRole('button', { name: 'No, la d’avui. Dimarts, 22 de setembre' }));
  await waitFor(() => expect(screen.queryByText('Ja estem a dimarts, 22 de setembre.')).toBeNull());
  expect(screen.getByText('Dimarts, 22 de setembre')).toBeTruthy();
});

test('el calendari canvia de dia; «Cancel·la» el tanca sense canviar-lo', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0));
  fireEvent.press(screen.getByRole('button', { name: 'Calendari' }));
  expect(await screen.findByTestId('calendar')).toBeTruthy();
  expect(screen.getByText('setembre de 2026')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'dimarts, 15 de setembre' }));
  fireEvent.press(screen.getByRole('button', { name: 'Cancel·la' }));
  await waitFor(() => expect(screen.queryByTestId('calendar')).toBeNull());
  expect(screen.getByText('Dilluns, 21 de setembre')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Calendari' }));
  fireEvent.press(await screen.findByRole('button', { name: 'dimarts, 15 de setembre' }));
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  await findText('Dimarts, 15 de setembre');
});

test('al calendari es passa de mes, i «Avui» torna a avui', async () => {
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

test('amb el mode fosc activat, l’inici també és fosc', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0), { darkMode: 'Activat' });
  expect(styleOf(screen.getByTestId('home')).backgroundColor).toBe('#0E1413');
});

test('entre la barra de dalt i la targeta del dia hi ha aire: més que als costats, menys que entre seccions', async () => {
  await openAt(new Date(2026, 8, 21, 10, 0));
  const column = styleOf(screen.getByTestId('home-column'));
  expect(column.paddingTop).toBeGreaterThan(column.paddingHorizontal);
  expect(column.paddingTop).toBeLessThan(column.gap);
});

// The top bar is dark teal in both modes: on iOS it is drawn dark. Drawn light, iOS 26 made the
// capsules of glass of its buttons whitish and the back arrow black.
test.each([
  ['clar', 'Desactivat'],
  ['fosc', 'Activat'],
])('en mode %s, la barra de dalt es dibuixa fosca', async (_, darkMode) => {
  await openAt(new Date(2026, 8, 21, 10, 0), { darkMode });
  const bars = screen.root.findAll((node) => node.props.userInterfaceStyle !== undefined, { deep: true });
  expect(bars.length).toBeGreaterThan(0);
  for (const bar of bars) expect(bar.props.userInterfaceStyle).toBe('dark');
});

test('qui ve de la versió anterior veu l’avís de novetats, i només la primera vegada', async () => {
  jest.setSystemTime(new Date(2026, 8, 21, 10, 0));
  await AsyncStorage.clear();
  render(<App />);
  fireEvent.press(await findText('D’acord'));
  await waitFor(async () => expect(await AsyncStorage.getItem('WhatsNewSeen_9.0.0')).toBe('true'));
});

test('qui instal·la l’app de nou no veu l’avís de novetats: no té res a comparar', async () => {
  wasOpenedBefore.mockResolvedValueOnce(false);
  jest.setSystemTime(new Date(2026, 8, 21, 10, 0));
  await AsyncStorage.clear();
  render(<App />);
  await screen.findByTestId('day-card', {}, { timeout: 15000 });
  await waitFor(async () => expect(await AsyncStorage.getItem('WhatsNewSeen_9.0.0')).toBe('true'));
  expect(screen.queryByText('Ara ho tens tot a l’inici')).toBeNull();
});
