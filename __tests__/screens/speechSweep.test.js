// The audio the voice will need, day by day: every hour and the Mass readings opened as a user would
// (with and without the invitatory, every Marian antiphon, the Dies iræ of the last week of Ordinary
// Time, «Continua amb…», the evening Mass, the Easter Vigil), for the settings that change the text (the invitatory psalm, the Marian antiphon,
// the Latin hymns, the optional memorial) and for every diocese on the days its text is not
// Barcelona's. On a day with more than one optional memorial, each of them too, chosen as the sheet
// of the home («Què celebres avui?») chooses it, in every place that offers it. It writes, as JSON
// lines, the pieces each day needs: scripts/speechSweep.mjs runs it in parallel and joins them for
// the generator (scripts/audio/).
//
// It only runs when SPEECH_SWEEP_OUT is set: SPEECH_SWEEP_FROM (2026-10-08) and SPEECH_SWEEP_DAYS.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);

const fs = require('fs');
const crypto = require('crypto');
const RNTL = require('@testing-library/react-native');
const { PROFILES, loadDay } = require('../helpers/liturgyDay');
const { HOURS, openHour, openMass, press } = require('../helpers/prayerScreens');
const DataService = require('../../src/services/dataService');
const LiturgyStore = require('../../src/controllers/liturgyStore');
const { getScreenSpeech } = require('../../src/controllers/speechStore');
const { MAX_PIECE_CHARS, pieceKey, speechScript, splitWords } = require('../../src/view-models/speech/script');
const { SpecificLiturgyTimeType } = require('../../src/services/celebrationTimeEnums');
const { StringManagement } = require('../../src/utils/StringManagement');

const OUT = process.env.SPEECH_SWEEP_OUT;
const FROM = process.env.SPEECH_SWEEP_FROM;
const DAYS = parseInt(process.env.SPEECH_SWEEP_DAYS || '0', 10);
// Settings that change the text, drawn on every day; the other dioceses only when their day differs
const FULL_PROFILES = ['barcelona', 'tarragonaCatedral', 'gironaCiutat', 'andorra', 'mallorcaLliure'];
const OTHER_PROFILES = Object.keys(PROFILES).filter((p) => !FULL_PROFILES.includes(p));

const has = (pattern) => RNTL.screen.queryAllByText(pattern).length > 0;
const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// The pieces of what is on the screen now
function pieces(hour, into) {
  const speech = getScreenSpeech();
  if (!speech) return;
  for (const p of speechScript(hour, speech.paragraphs, LiturgyStore.getSnapshot().ourFather)) {
    into.set(p.key, { voice: p.voice, text: p.text });
  }
}

// What a day says, to tell whether another diocese has to be drawn too
function fingerprint() {
  const { hoursLiturgy, massLiturgy } = DataService.currentLiturgy();
  return crypto
    .createHash('sha256')
    .update(JSON.stringify([hoursLiturgy, massLiturgy]))
    .digest('hex');
}

async function massPieces(day, profile, into, choice) {
  const { massLiturgy: mass, liturgyDayInformation: info } = DataService.currentLiturgy();
  const chain = async (type, vespers, second) => {
    await loadDay(day, profile, choice);
    await openMass(type, vespers, second);
    pieces('Missa', into);
    for (let steps = 0; has(/^Continua amb/) && steps < 6; steps++) {
      await press(/^Continua amb/);
      pieces('Missa', into);
    }
    if (has(/Alternatiu/)) {
      await press(/Alternatiu/);
      pieces('Missa', into);
    }
  };
  if (info.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    await chain('VetllaPasquaLecturesSalms', false, false);
    await chain('VetllaPasquaEvangeli', false, false);
    return;
  }
  const masses = [[false, mass.today]];
  if (mass.hasVespers) masses.push([true, mass.vespers]);
  for (const [vespers, m] of masses) {
    const second = StringManagement.hasLiturgyContent(m.secondReading.reading);
    if (info.today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) await chain('Rams', vespers, second);
    await chain('1Lect', vespers, second);
    for (const type of ['Salm', ...(second ? ['2Lect'] : []), 'Evangeli']) {
      await loadDay(day, profile, choice);
      await openMass(type, vespers, second);
      pieces('Missa', into);
    }
  }
}

// The chip of the Dies iræ, instead of the hymn of the day
const DIES_IRAE = /^\s*Dies iræ\s*$/;

async function dayPieces(day, profile, into, everyAntiphon, choice = {}) {
  for (const hour of HOURS) {
    await loadDay(day, profile, choice);
    await openHour(hour);
    pieces(hour, into);
    if ((hour === 'Laudes' || hour === 'Ofici') && has(/Començar amb/)) {
      await press(/Començar amb/);
      pieces(hour, into);
    }
    if (has(DIES_IRAE)) {
      await press(DIES_IRAE);
      pieces(hour, into);
    }
    if (hour === 'Completes' && everyAntiphon) {
      for (const antiphon of ['1', '2', '3', '4', '5']) {
        const chip = new RegExp(`^\\s*Ant\\. ${antiphon}\\s*$`);
        if (!has(chip)) continue;
        await press(chip);
        pieces(hour, into);
      }
    }
  }
  await loadDay(day, profile, choice);
  await massPieces(day, profile, into, choice);
}

// The ways a day is prayed in a place: as it opens and, on a day with more than one optional
// memorial, with each of them, as the sheet of the home saves it (liturgyDay.loadDay)
async function choicesOf(day, profile) {
  await loadDay(day, profile);
  const { options } = DataService.currentLiturgy().optionalMemorials;
  return [{}, ...(options.length > 1 ? options.map((option) => ({ memorial: option.id })) : [])];
}

(OUT ? test : test.skip)(
  'every piece of audio each day needs',
  async () => {
    const out = fs.openSync(OUT, 'w');
    const [y, m, d] = FROM.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    for (let i = 0; i < DAYS; i++, date.setDate(date.getDate() + 1)) {
      const day = iso(date);
      const needed = new Map();
      const errors = [];
      const drawn = new Set();
      for (const profile of [...FULL_PROFILES, ...OTHER_PROFILES]) {
        // A day that cannot be loaded says so below, once
        const choices = await choicesOf(day, profile).catch(() => [{}]);
        for (const choice of choices) {
          const chosen = choice.memorial !== undefined;
          try {
            await loadDay(day, profile, choice);
            const print = `${fingerprint()}`;
            // The settings of every day are drawn always; a memorial or another place, when new
            if ((chosen || !FULL_PROFILES.includes(profile)) && drawn.has(print)) continue;
            drawn.add(print);
            // Every Marian antiphon once a week is enough: they are always the same five
            await dayPieces(day, profile, needed, profile === 'barcelona' && date.getDay() === 0, choice);
          } catch (error) {
            errors.push(`${profile}${chosen ? ` (${choice.memorial})` : ''}: ${error && error.message}`);
          }
        }
      }
      const pieces = [...needed].map(([key, p]) => ({ key, voice: p.voice, text: p.text }));
      fs.writeSync(out, JSON.stringify({ day, pieces, errors }) + '\n');
    }
    fs.closeSync(out);
  },
  24 * 3600 * 1000,
);

// A list of pieces made before long paragraphs were cut (MAX_PIECE_CHARS), cut now the way the app
// cuts them: SPEECH_SPLIT_IN (pieces.json) and SPEECH_SPLIT_OUT
(process.env.SPEECH_SPLIT_IN ? test : test.skip)('long pieces cut as the app cuts them', () => {
  const pieces = JSON.parse(fs.readFileSync(process.env.SPEECH_SPLIT_IN, 'utf8'));
  const out = {};
  for (const [key, piece] of Object.entries(pieces)) {
    if (piece.text.length <= MAX_PIECE_CHARS) {
      out[key] = piece;
      continue;
    }
    for (const text of splitWords(piece.text)) {
      out[pieceKey(piece.voice, text)] = { voice: piece.voice, text, firstDay: piece.firstDay };
    }
  }
  fs.writeFileSync(process.env.SPEECH_SPLIT_OUT, JSON.stringify(out));
});
