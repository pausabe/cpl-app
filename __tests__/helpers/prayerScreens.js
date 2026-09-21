// Opens the prayer and reading screens the way the app does, one by one, for the golden of the
// rendered text. Only this file knows how a screen is mounted: when the screens change their
// props, this changes and the golden stays.
const React = require('react');
// Through the module: `screen` is replaced on every render, a destructured copy would go stale.
const RNTL = require('@testing-library/react-native');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const DataService = require('../../src/Services/DataService');
const HoursLiturgyPrayerScreen = require('../../src/Views/HoursLiturgy/HoursLiturgyPrayerScreen').default;
const MassLiturgyPrayerScreen = require('../../src/Views/MassLiturgy/MassLiturgyPrayerScreen').default;
const { textRuns } = require('./renderedText');

const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const navigation = { setOptions: () => {}, addListener: () => () => {}, navigate: () => {}, goBack: () => {} };

const HOURS = ['Ofici', 'Laudes', 'Tèrcia', 'Sexta', 'Nona', 'Vespres', 'Completes'];

function mount(element) {
  return RNTL.render(React.createElement(SafeAreaProvider, { initialMetrics: METRICS }, element));
}

async function settle() {
  await RNTL.act(async () => { await Promise.resolve(); });
}

function hoursParams(type) {
  return {
    title: type === 'Ofici' ? 'Ofici de lectura' : type,
    props: {
      type,
      superTestMode: false,
      nextDayTestCB: () => {},
      setNumSalmInv: (n) => { DataService.CurrentSettings.InvitationPsalmOption = n; },
      setNumAntMare: (n) => { DataService.CurrentSettings.VirginAntiphonOption = n; },
      events: undefined,
    },
  };
}

async function openHour(type) {
  const view = mount(React.createElement(HoursLiturgyPrayerScreen, { route: { params: hoursParams(type) }, navigation }));
  await settle();
  return view;
}

function massParams(type, useVespersTexts, needSecondReading) {
  return { title: 'Missa', props: { type, events: undefined, need_lectura2: needSecondReading, useVespersTexts } };
}

async function openMass(type, useVespersTexts, needSecondReading) {
  const view = mount(React.createElement(MassLiturgyPrayerScreen, {
    route: { params: massParams(type, useVespersTexts, needSecondReading) }, navigation,
  }));
  await settle();
  return view;
}

const runs = () => textRuns(RNTL.screen.toJSON());

async function press(pattern) {
  RNTL.fireEvent.press(RNTL.screen.getByText(pattern));
  await settle();
}

module.exports = { HOURS, openHour, openMass, runs, press, settle };
