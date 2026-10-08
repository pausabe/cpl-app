// The screen follows the voice on the real hours: for every piece of the script, the box the screen
// marks is one, and it is the one that piece is read from (its first word is there). The script
// numbers paragraphs and strophes one way (view-models/speech/script.ts) and the screen splits
// them another (components/ListeningFlow.tsx): this is where the two are held together.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);

const React = require('react');
const RNTL = require('@testing-library/react-native');
const { View } = require('react-native');
const { SafeAreaProvider } = require('react-native-safe-area-context');
const { loadDay } = require('../helpers/liturgyDay');
const { HOURS } = require('../helpers/prayerScreens');
const { styleOf } = require('../helpers/renderWithTheme');
const { shownText } = require('../helpers/prayerText');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const AppThemeProvider = require('../../src/controllers/AppThemeProvider').default;
const HoursLiturgyPrayerScreen = require('../../src/views/hours-liturgy/HoursLiturgyPrayerScreen').default;
const MassLiturgyPrayerScreen = require('../../src/views/mass-liturgy/MassLiturgyPrayerScreen').default;
const { SpeechSink } = require('../../src/components/SpeechSink');
const { SpeechFollow } = require('../../src/components/SpeechFollow');
const { speechScript } = require('../../src/view-models/speech/script');
const { palettes } = require('../../src/theme/colors');

const DAY = '2026-04-05';
const METRICS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const MARKS = [palettes.light.listenHighlight, palettes.dark.listenHighlight];

const firstWord = (text) => (/[\p{L}·]+/u.exec(text) ?? [''])[0].toLowerCase();

function marked() {
  const shown = RNTL.screen
    .UNSAFE_queryAllByType(View)
    .filter((view) => MARKS.includes(styleOf(view).backgroundColor))
    .map((view) => shownText(view));
  return [...new Set(shown)];
}

describe(`the screen follows the voice (${DAY})`, () => {
  let paragraphs;
  const sink = (handed) => (paragraphs = handed);

  // The hour of the screen, or the readings of the Mass from where `hour` says («Missa 1Lect»)
  function screenOf(hour, follow) {
    const { hours, day, settings, mass } = LiturgyStore.getSnapshot();
    const [, massType] = hour.split(' ');
    return React.createElement(
      SafeAreaProvider,
      { initialMetrics: METRICS },
      React.createElement(
        AppThemeProvider,
        null,
        React.createElement(
          SpeechSink.Provider,
          { value: sink },
          React.createElement(
            SpeechFollow.Provider,
            { value: follow },
            massType
              ? React.createElement(MassLiturgyPrayerScreen, {
                  type: massType,
                  needSecondReading: true,
                  useVespersTexts: false,
                  mass,
                  today: day.today,
                  showVideos: false,
                })
              : React.createElement(HoursLiturgyPrayerScreen, {
                  type: hour,
                  hours,
                  today: day.today,
                  settings,
                  onInvitationPsalmChange: () => {},
                  onVirginAntiphonChange: () => {},
                }),
          ),
        ),
      ),
    );
  }

  beforeAll(async () => {
    await loadDay(DAY, 'barcelona');
    LiturgyStore.publish();
  }, 120000);

  test.each([...HOURS, 'Missa 1Lect', 'Missa Evangeli'])('%s', (hour) => {
    paragraphs = undefined;
    const view = RNTL.render(screenOf(hour, null));
    const pieces = speechScript(hour.split(' ')[0], paragraphs, LiturgyStore.getSnapshot().ourFather);
    expect(pieces.length).toBeGreaterThan(2);
    const wrong = [];
    const seen = new Set();
    for (const piece of pieces) {
      const at = `${piece.paragraph}/${piece.strophe}`;
      if (seen.has(at)) continue;
      seen.add(at);
      view.rerender(screenOf(hour, { paragraph: piece.paragraph, strophe: piece.strophe }));
      const boxes = marked();
      const word = firstWord(piece.text);
      if (boxes.length !== 1 || !boxes[0].toLowerCase().includes(word)) {
        wrong.push(`${at} «${piece.text.slice(0, 40)}» → ${JSON.stringify(boxes.map((b) => b.slice(0, 40)))}`);
      }
    }
    view.unmount();
    expect(wrong).toEqual([]);
  });
});
