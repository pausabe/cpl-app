// The prayer read aloud, against the screen it is read from. For every hour and the Mass readings
// of days of every season:
//
//  - what the voice is handed (the paragraphs PrayerFlow gives its screen) is, word for word and
//    rubric for rubric, the text the screen draws: nothing left out, nothing added;
//  - the script made from it (who says each piece, what is said, the silence after it) is the one
//    of the golden (speech-scripts.json, gitignored like the others, because it is made of the
//    texts of cpl-app.db). The audio of every piece is named after its words: a change here means
//    pieces to make again, and has to be a change on purpose.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);

const RNTL = require('@testing-library/react-native');
const { loadDay } = require('../helpers/liturgyDay');
const { readGolden, writeGolden, diffPaths } = require('../helpers/golden');
const { HOURS, openHour, openMass, runs, press } = require('../helpers/prayerScreens');
const DataService = require('../../src/services/dataService');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const { getScreenSpeech } = require('../../src/controllers/speechStore');
const { speechScript } = require('../../src/view-models/speech/script');
const { StringManagement } = require('../../src/utils/StringManagement');

const DAYS = ['2025-11-30', '2025-12-25', '2026-02-18', '2026-04-05', '2026-05-24', '2026-08-15', '2026-10-09'];
const GOLDEN = 'speech-scripts';

const has = (pattern) => RNTL.screen.queryAllByText(pattern).length > 0;
const squeeze = (text) => text.replace(/\s+/g, '');

// The screen's text as runs of one look (R or T, in italics or not), joined across paragraphs
function lookSequence(pairs) {
  const out = [];
  for (const [look, text] of pairs) {
    const t = squeeze(text);
    if (!t) continue;
    const last = out[out.length - 1];
    if (last && last[0] === look) last[1] += t;
    else out.push([look, t]);
  }
  return out.map(([look, t]) => `${look}|${t}`);
}

// What the screen draws (the golden helper's runs) and what the voice is handed, comparable
function drawn() {
  return lookSequence(
    runs().map((run) => {
      const bar = run.indexOf('|');
      const key = run.slice(0, bar);
      // A colour that is neither rubric nor text is still text (the softer comments)
      const look = (key.startsWith('R') ? 'R' : 'T') + (key.endsWith('i') ? 'i' : '');
      return [look, run.slice(bar + 1)];
    }),
  );
}

function handed() {
  const speech = getScreenSpeech();
  return lookSequence(speech.paragraphs.flat().map((run) => [run.look + (run.italic ? 'i' : ''), run.text]));
}

function scriptOf(hour) {
  const speech = getScreenSpeech();
  expect(speech.hour).toBe(hour === 'Missa' ? 'Missa' : hour);
  return speechScript(hour, speech.paragraphs, LiturgyStore.getSnapshot().ourFather).map((p) => ({
    role: p.role,
    text: p.text,
    pause: p.pause,
  }));
}

describe('the prayer read aloud, against the screen', () => {
  const resolved = {};
  const mismatches = [];
  let golden;

  beforeAll(async () => {
    golden = readGolden(GOLDEN);
    for (const day of DAYS) {
      const scripts = {};
      for (const hour of HOURS) {
        await loadDay(day, 'barcelona');
        await openHour(hour);
        if (hour === 'Laudes' && has(/Començar amb/)) await press(/Començar amb/);
        if (JSON.stringify(handed()) !== JSON.stringify(drawn())) mismatches.push(`${day} ${hour}`);
        scripts[hour] = scriptOf(hour);
      }
      await loadDay(day, 'barcelona');
      const mass = DataService.currentLiturgy().massLiturgy.today;
      await openMass('1Lect', false, StringManagement.hasLiturgyContent(mass.secondReading.reading));
      for (let steps = 0; has(/^Continua amb/) && steps < 6; steps++) await press(/^Continua amb/);
      if (JSON.stringify(handed()) !== JSON.stringify(drawn())) mismatches.push(`${day} Missa`);
      scripts.Missa = scriptOf('Missa');
      resolved[day] = scripts;
    }
    if (!golden) writeGolden(GOLDEN, resolved);
  }, 600000);

  test('the voice is handed exactly the text of the screen', () => {
    expect(mismatches).toEqual([]);
  });

  test('every hour has something to read, and every piece has a voice', () => {
    for (const [day, scripts] of Object.entries(resolved)) {
      for (const [hour, pieces] of Object.entries(scripts)) {
        expect(`${day} ${hour}: ${pieces.length > 5}`).toBe(`${day} ${hour}: true`);
        for (const piece of pieces) expect(piece.text.trim()).not.toBe('');
      }
    }
  });

  test.each(DAYS)('the script of %s is the golden one', (day) => {
    if (!golden) return; // just written from this build
    expect(diffPaths(golden[day], resolved[day])).toEqual([]);
  });
});
