// The home with a database that says the colour of each memorial (_celebration_colors, from litcal):
// the day card takes the colour of the memorial celebrated, as it is chosen in the sheet or with the
// switch, and goes back to that of the day with the weekday. The whole app, as in home.test.js, on a
// copy of the bundled database with the table (helpers/memorialColorsDatabase).
const { memorialColorsDatabase } = require('../helpers/memorialColorsDatabase');

process.env.CPL_DB = memorialColorsDatabase();

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
jest.mock('../../src/controllers/firstRun', () => ({ wasOpenedBefore: jest.fn(async () => true) }));
jest.mock('../../src/services/deviceLocationService', () => ({ currentPosition: jest.fn() }));

const React = require('react');
const AsyncStorage = require('@react-native-async-storage/async-storage');
// The module itself: its screen is replaced on every render, and a copy taken now would not see it
const RNTL = require('@testing-library/react-native');
const { render, fireEvent, waitFor, within } = RNTL;
const App = require('../../App').default;

async function openAt(date, settings = {}) {
  jest.setSystemTime(date);
  await AsyncStorage.clear();
  await AsyncStorage.setItem('WhatsNewSeen_9.0.0', 'true');
  await AsyncStorage.setItem('DioceseOfferSeen', 'true');
  for (const [key, value] of Object.entries(settings)) await AsyncStorage.setItem(key, value);
  render(<App />);
  await RNTL.screen.findByTestId('day-card', {}, { timeout: 15000 });
}

const colorSaid = (name) => `Barcelona (Diòcesi). Color litúrgic: ${name}`;

beforeAll(() => {
  jest.useFakeTimers({ advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

test('9 October 2026: red with Sants Dionís i companys, white with Sant Joan Leonardi, green with the weekday', async () => {
  await openAt(new Date(2026, 9, 9, 8, 0), { lliureDate: '9:9:2026:381' });
  expect(RNTL.screen.getByLabelText(colorSaid('Vermell'))).toBeTruthy();

  fireEvent.press(RNTL.screen.getByRole('button', { name: /^Canviar\./ }));
  await RNTL.screen.findByTestId('memorials-sheet');
  const radio = (name) => within(RNTL.screen.getByTestId('memorials-sheet')).getByRole('radio', { name });
  fireEvent.press(radio('Sant Joan Leonardi, prevere'));
  await waitFor(() => expect(RNTL.screen.getByLabelText(colorSaid('Blanc'))).toBeTruthy());

  fireEvent.press(radio('Fèria'));
  await waitFor(() => expect(RNTL.screen.getByLabelText(colorSaid('Verd'))).toBeTruthy());
});

test('the switch of a day with one memorial: Sants Cosme i Damià, red once it is turned on', async () => {
  await openAt(new Date(2026, 8, 26, 8, 0));
  expect(RNTL.screen.getByLabelText(colorSaid('Verd'))).toBeTruthy();
  fireEvent.press(RNTL.screen.getByRole('switch', { name: /^Celebrar la memòria\./ }));
  await waitFor(() => expect(RNTL.screen.getByLabelText(colorSaid('Vermell'))).toBeTruthy());
});
