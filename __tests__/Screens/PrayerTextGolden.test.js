// Every word the prayer and reading screens show, on the days of the liturgy golden, compared
// with what they showed before the redesign. The redesign changes spacing, colours and
// controls; this proves it did not change a single word, rubric or italic of the liturgy.
//
// It opens each hour and each reading as a user would, and also presses what reveals more
// text: «Començar amb l'invitatori», each invitatory psalm, each Marian antiphon, every
// «Continua amb…» and the alternative Easter Gospel.
jest.mock('../../src/Services/DatabaseManagerService', () => require('../helpers/mockDatabaseManager'));
jest.mock('react-native-youtube-iframe', () => () => null);

const { loadDay } = require('../helpers/liturgyDay');
const { readGolden, writeGolden, diffPaths } = require('../helpers/golden');
const { HOURS, openHour, openMass, runs, press } = require('../helpers/prayerScreens');
const DataService = require('../../src/Services/DataService');
const { SpecificLiturgyTimeType } = require('../../src/Services/CelebrationTimeEnums');
const { StringManagement } = require('../../src/Utils/StringManagement');
const RNTL = require('@testing-library/react-native');

const DAYS = [
  '2025-11-30',
  '2025-12-08',
  '2025-12-17',
  '2025-12-24',
  '2025-12-25',
  '2025-12-28',
  '2025-12-31',
  '2026-01-01',
  '2026-01-06',
  '2026-01-11',
  '2026-01-20',
  '2026-02-02',
  '2026-02-18',
  '2026-02-22',
  '2026-03-19',
  '2026-03-28',
  '2026-03-29',
  '2026-04-01',
  '2026-04-02',
  '2026-04-03',
  '2026-04-04',
  '2026-04-05',
  '2026-04-06',
  '2026-04-12',
  '2026-05-14',
  '2026-05-23',
  '2026-05-24',
  '2026-05-31',
  '2026-06-04',
  '2026-06-24',
  '2026-08-15',
  '2026-09-19',
  '2026-09-21',
  '2026-09-22',
  '2026-09-26',
  '2026-09-27',
  '2026-10-31',
  '2026-11-01',
  '2026-11-02',
  '2026-11-22',
  '2026-11-28',
  '2026-12-08',
];
// Other settings change the invitatory psalm, the Marian antiphon, the Latin hymns and the
// optional memorial; a few days with each are enough.
const OTHER_PROFILES = ['tarragonaCatedral', 'gironaCiutat', 'andorra', 'mallorcaLliure'];
const OTHER_DAYS = ['2025-12-24', '2026-02-18', '2026-04-05', '2026-06-24', '2026-09-26', '2026-10-31'];
const CASES = [
  ...DAYS.map((day) => [day, 'barcelona']),
  ...OTHER_DAYS.flatMap((day) => OTHER_PROFILES.map((profile) => [day, profile])),
];
const GOLDEN = 'prayer-screens';

const buttonMatching = (pattern) => RNTL.screen.queryAllByText(pattern).length > 0;

async function hourTexts(type) {
  const out = {};
  await openHour(type);
  out[type] = runs();
  if ((type === 'Ofici' || type === 'Laudes') && buttonMatching(/Començar amb/)) {
    await press(/Començar amb/);
    out[`${type} + invitatori`] = runs();
    if (type === 'Laudes') {
      for (const psalm of ['94', '99', '66', '23']) {
        const chip = new RegExp(`^\\s*Salm ${psalm}\\s*$`);
        if (!buttonMatching(chip)) continue;
        await press(chip);
        out[`${type} + invitatori, salm ${psalm}`] = runs();
      }
    }
  }
  if (type === 'Completes') {
    for (const antiphon of ['1', '2', '3', '4']) {
      const chip = new RegExp(`^\\s*Ant\\. ${antiphon}\\s*$`);
      if (!buttonMatching(chip)) continue;
      await press(chip);
      out[`${type} + antífona ${antiphon}`] = runs();
    }
  }
  return out;
}

// From one reading, «Continua amb…» until the end, as someone reading the whole Mass.
async function massChain(label, type, vespers, needSecondReading) {
  const out = {};
  await openMass(type, vespers, needSecondReading);
  out[label] = runs();
  let steps = 0;
  while (buttonMatching(/^Continua amb/) && steps < 6) {
    await press(/^Continua amb/);
    steps++;
  }
  if (steps > 0) out[`${label} → fins al final`] = runs();
  if (buttonMatching(/Alternatiu/)) {
    await press(/Alternatiu/);
    out[`${label} → evangeli alternatiu`] = runs();
  }
  return out;
}

async function massTexts() {
  const { CurrentMassLiturgy, CurrentLiturgyDayInformation } = DataService;
  const out = {};
  if (CurrentLiturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    Object.assign(out, await massChain('Vetlla: lectures i salms', 'VetllaPasquaLecturesSalms', false, false));
    Object.assign(out, await massChain('Vetlla: evangeli', 'VetllaPasquaEvangeli', false, false));
    return out;
  }
  const masses = [['Avui', false, CurrentMassLiturgy.Today]];
  if (CurrentMassLiturgy.HasVespers) masses.push(['Vespertina', true, CurrentMassLiturgy.Vespers]);
  for (const [name, vespers, mass] of masses) {
    const needSecondReading = StringManagement.HasLiturgyContent(mass.SecondReading.Reading);
    if (CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
      Object.assign(out, await massChain(`${name}: Rams`, 'Rams', vespers, needSecondReading));
    }
    Object.assign(out, await massChain(`${name}: 1Lect`, '1Lect', vespers, needSecondReading));
    for (const type of ['Salm', ...(needSecondReading ? ['2Lect'] : []), 'Evangeli']) {
      await openMass(type, vespers, needSecondReading);
      out[`${name}: ${type}`] = runs();
    }
  }
  return out;
}

describe('text de les pantalles de pregària i de lectures, contra el golden', () => {
  const resolved = {};
  let golden;

  beforeAll(async () => {
    golden = readGolden(GOLDEN);
    for (const [day, profile] of CASES) {
      await loadDay(day, profile);
      const texts = {};
      for (const hour of HOURS) {
        await loadDay(day, profile); // each hour starts from the saved settings, as in the app
        Object.assign(texts, await hourTexts(hour));
      }
      Object.assign(texts, await massTexts());
      resolved[`${day} ${profile}`] = texts;
    }
    if (!golden) writeGolden(GOLDEN, resolved);
  }, 900000);

  test.each(CASES.map(([day, profile]) => `${day} ${profile}`))('%s', (key) => {
    if (!golden) return; // just written from this build
    expect(golden[key]).toBeDefined();
    expect(diffPaths(golden[key], resolved[key])).toEqual([]);
  });
});
