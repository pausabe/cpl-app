// Android Auto: the phone gets the hours of today ready out of sight (CarScriptPreparer), the car
// offers them, and what the car plays of an hour is exactly what the screen of that hour reads.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);
jest.mock('expo-file-system', () => require('../helpers/fakeFileSystem'));
const mockCar = { handlers: {}, catalogs: [], used: true };
jest.mock('../../src/services/audio/carAudio', () => ({
  hasCarSession: () => true,
  carWasUsed: () => mockCar.used,
  onCar: (event, listener) => {
    mockCar.handlers[event] = listener;
    return () => undefined;
  },
  carReady: jest.fn(),
  setCarCatalog: (day, items, current) => mockCar.catalogs.push({ day, items, current }),
  attachToCar: jest.fn(),
  updateCar: jest.fn(),
  detachFromCar: jest.fn(),
}));

const React = require('react');
const RNTL = require('@testing-library/react-native');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const { loadDay } = require('../helpers/liturgyDay');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const AppThemeProvider = require('../../src/controllers/AppThemeProvider').default;
const HoursLiturgyPrayerScreen = require('../../src/views/hours-liturgy/HoursLiturgyPrayerScreen').default;
const { SpeechSink } = require('../../src/components/SpeechSink');
const { speechScript } = require('../../src/view-models/speech/script');
const Car = require('../../src/controllers/carController');
const CarScriptPreparer = require('../../src/controllers/CarScriptPreparer').default;
const Listen = require('../../src/controllers/listenController');

const DAY = '2026-04-05';
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const wrap = (child) =>
  React.createElement(
    SafeAreaProvider,
    { initialMetrics: METRICS },
    React.createElement(AppThemeProvider, null, child),
  );

// What the screen of an hour reads when its headphones are pressed
function screenScript(hour) {
  let paragraphs = [];
  const { hours, day, settings } = LiturgyStore.getSnapshot();
  const view = RNTL.render(
    wrap(
      React.createElement(
        SpeechSink.Provider,
        { value: (handed) => (paragraphs = handed) },
        React.createElement(HoursLiturgyPrayerScreen, {
          type: hour,
          hours,
          today: day.today,
          settings,
          laudesGospel: null,
          onInvitationPsalmChange: () => undefined,
          onVirginAntiphonChange: () => undefined,
        }),
      ),
    ),
  );
  view.unmount();
  return speechScript(hour, paragraphs, LiturgyStore.getSnapshot().ourFather);
}

beforeEach(async () => {
  const { File, Paths } = jest.requireMock('expo-file-system');
  for (const name of ['car-hours.json', 'car-resume.json']) {
    const file = new File(Paths.document, name);
    if (file.exists) file.delete();
  }
  jest.useFakeTimers({ now: new Date(`${DAY}T09:00:00`), doNotFake: ['queueMicrotask', 'nextTick', 'setImmediate'] });
  Car.resetCar();
  mockCar.handlers = {};
  mockCar.catalogs = [];
  mockCar.used = true;
  await loadDay(DAY);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function prepareToday() {
  const view = RNTL.render(wrap(React.createElement(CarScriptPreparer)));
  for (let i = 0; i < 60 && (Car.getPreparation() || !Car.preparedDay()); i++) {
    await RNTL.act(async () => {
      jest.advanceTimersByTime(500);
    });
  }
  return view;
}

test('on a phone that has been in a car, the hours of today get ready out of sight, as the screen reads them', async () => {
  const preparer = await prepareToday();
  // Nothing of it stays on the screen
  expect(preparer.queryByTestId('car-script-preparer')).toBeNull();
  preparer.unmount();

  const prepared = Car.preparedDay();
  expect(prepared.day).toBe(DAY);
  expect(prepared.hours.map((h) => h.hour)).toEqual([
    'Ofici',
    'Laudes',
    'Tèrcia',
    'Sexta',
    'Nona',
    'Vespres',
    'Completes',
  ]);
  for (const hour of ['Laudes', 'Completes']) {
    const car = prepared.hours.find((h) => h.hour === hour).pieces.map((p) => p.key);
    expect(car).toEqual(screenScript(hour).map((p) => p.key));
  }
});

test('the car offers them, and an hour chosen there plays with the words kept', async () => {
  await prepareToday();
  const { items } = mockCar.catalogs[mockCar.catalogs.length - 1];
  expect(items[1]).toEqual({ id: `${DAY}|Laudes`, title: 'Laudes', subtitle: '' });

  const listen = jest.spyOn(Listen, 'listen').mockResolvedValue(undefined);
  Car.wireCar();
  await mockCar.handlers.onCarPlay({ id: `${DAY}|Laudes` });
  expect(listen).toHaveBeenCalledWith('Laudes', 'Laudes', Car.preparedDay().hours[1].pieces);
});

test('⏮ ⏭ in the car jump a part, as in the app', () => {
  const next = jest.spyOn(Listen, 'nextPart').mockImplementation(() => undefined);
  const previous = jest.spyOn(Listen, 'previousPart').mockImplementation(() => undefined);
  Car.wireCar();
  mockCar.handlers.onCarCommand({ type: 'next' });
  mockCar.handlers.onCarCommand({ type: 'previous' });
  expect(next).toHaveBeenCalledTimes(1);
  expect(previous).toHaveBeenCalledTimes(1);
});

test('on a phone that has never been in a car, nothing is drawn', async () => {
  mockCar.used = false;
  RNTL.render(wrap(React.createElement(CarScriptPreparer)));
  await RNTL.act(async () => {
    jest.advanceTimersByTime(2000);
  });
  expect(Car.getPreparation()).toBeNull();
  expect(Car.preparedDay()).toBeNull();
});
