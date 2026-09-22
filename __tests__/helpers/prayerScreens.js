// Opens the prayer and reading screens the way the app does, one by one, for the golden of the
// rendered text. Only this file knows how a screen is mounted: when the screens change their
// props, this changes and the golden stays.
const React = require('react');
// Through the module: `screen` is replaced on every render, a destructured copy would go stale.
const RNTL = require('@testing-library/react-native');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const { HoursPrayerController, MassPrayerController } = require('../../src/controllers/PrayerController');
const AppThemeProvider = require('../../src/controllers/AppThemeProvider').default;
const { textRuns } = require('./renderedText');

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const navigation = { setOptions: () => {}, addListener: () => () => {}, navigate: () => {}, goBack: () => {} };

const HOURS = ['Ofici', 'Laudes', 'Tèrcia', 'Sexta', 'Nona', 'Vespres', 'Completes'];

// As in the app: the theme of the loaded settings around the screen. The day was loaded with
// DataService directly (liturgyDay.loadDay), so the screens are told first. One screen at a
// time, as in the app: the one before is closed.
let current;
function mount(element) {
  if (current) {
    current.unmount();
    current = undefined;
  }
  LiturgyStore.publish();
  current = RNTL.render(
    React.createElement(
      SafeAreaProvider,
      { initialMetrics: METRICS },
      React.createElement(AppThemeProvider, null, element),
    ),
  );
  return current;
}

async function settle() {
  await RNTL.act(async () => {
    await Promise.resolve();
  });
}

async function openHour(type) {
  const params = { type, title: type === 'Ofici' ? 'Ofici de lectura' : type };
  const view = mount(React.createElement(HoursPrayerController, { route: { params }, navigation }));
  await settle();
  return view;
}

async function openMass(type, useVespersTexts, needSecondReading) {
  const params = { type, title: 'Missa', need_lectura2: needSecondReading, useVespersTexts };
  const view = mount(React.createElement(MassPrayerController, { route: { params }, navigation }));
  await settle();
  return view;
}

const runs = () => textRuns(RNTL.screen.toJSON());

async function press(pattern) {
  RNTL.fireEvent.press(RNTL.screen.getByText(pattern));
  await settle();
}

module.exports = { HOURS, openHour, openMass, runs, press, settle };
