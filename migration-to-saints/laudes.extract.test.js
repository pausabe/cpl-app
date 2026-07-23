// Migration tool: resolves cpl-app's REAL Laudes (Lauds) content for a range of real
// calendar dates, using cpl-app's own Services/Models — not a reimplementation.
//
// Why a Jest test file: cpl-app's Services reach the database through a single seam,
// `DatabaseManagerService.executeQueryAsync`. The RN/expo runtime is only needed by that
// seam (expo-sqlite) and by a couple of unrelated settings-persistence modules
// (AsyncStorage). Jest + the repo's existing `jest-expo` preset already mocks those
// RN/expo globals for us (that's what the preset is for), so we only need to replace the
// DB seam with a real SQLite connection (Node's built-in `node:sqlite`) and stub the
// settings-persistence module with plain in-memory values. Everything else — season/week
// resolution, precedence rules, saint lookups, per-hour text assembly — runs unmodified.
//
// Run with: npx jest migration-to-saints/laudes.extract.test.js

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.resolve(__dirname, '../src/Assets/db/cpl-app.db');
const OUTPUT_DIR = path.resolve(__dirname, 'output/raw');

jest.mock('../src/Services/SettingsService', () => {
  const DioceseName = {
    Andorra: 'Andorra', Barcelona: 'Barcelona', Girona: 'Girona', Lleida: 'Lleida',
    Mallorca: 'Mallorca', Menorca: 'Menorca', SantFeliu: 'Sant Feliu de Llobregat',
    Solsona: 'Solsona', Tarragona: 'Tarragona', Terrassa: 'Terrassa', Tortosa: 'Tortosa',
    Urgell: 'Urgell', Vic: 'Vic',
  };
  const PrayingPlace = { Diocese: 'Diòcesi', City: 'Ciutat', Cathedral: 'Catedral' };
  return { __esModule: true, DioceseName, PrayingPlace, default: {} };
});

jest.mock('../src/Services/DatabaseManagerService', () => {
  const path = require('path');
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(
    path.resolve(__dirname, '../src/Assets/db/cpl-app.db'),
    { readOnly: true }
  );
  return {
    executeQueryAsync: (query) => {
      try {
        return Promise.resolve(db.prepare(query).all());
      } catch (e) {
        return Promise.reject(e);
      }
    },
  };
});

const DatabaseDataService = require('../src/Services/DatabaseDataService');
const DatabaseDataHelper = require('../src/Services/DatabaseDataHelper');
const SpecialCelebrationService = require('../src/Services/SpecialCelebrationService');
const CelebrationIdentifierService = require('../src/Services/CelebrationIdentifierService');
const { ObtainLiturgyMasters } = require('../src/Services/Liturgy/LiturgyMastersService');
const { ObtainHoursLiturgy } = require('../src/Services/Liturgy/HoursLiturgyService');
const { Settings } = require('../src/Models/Settings');
const LiturgyDayInformation = require('../src/Models/LiturgyDayInformation').default;
const { DioceseCode } = require('../src/Services/DatabaseEnums');

// --- Settings construction (mirrors DataService.ObtainCurrentSettings, minus AsyncStorage) ---
function buildSettings({ dioceseName, prayingPlace, useLatin = false }) {
  const settings = new Settings();
  settings.PrayingPlace = prayingPlace;
  settings.DioceseName = dioceseName;
  settings.DioceseCode = DatabaseDataHelper.GetDioceseCodeFromDioceseName(dioceseName, prayingPlace);
  settings.DioceseCode2Letters = settings.DioceseCode === DioceseCode.Andorra
    ? settings.DioceseCode
    : settings.DioceseCode.substring(0, 2);
  settings.UseLatin = useLatin;
  settings.TextSize = 3;
  settings.DarkModeEnabled = false;
  settings.InvitationPsalmOption = '94';
  settings.VirginAntiphonOption = '1';
  settings.OptionalFestivityEnabled = false;
  return settings;
}

// --- IsSpecialChristmas (copied verbatim from DataService.tsx, it's not exported) ---
function isSpecialChristmas(day) {
  const { SpecificLiturgyTimeType } = require('../src/Services/CelebrationTimeEnums');
  if (day.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) return false;
  if (CelebrationIdentifierService.CheckCelebration(CelebrationIdentifierService.Celebration.SacredFamily, day)) {
    return false;
  }
  const d = day.Date.getDate();
  const m = day.Date.getMonth();
  if (m === 11) return [17, 18, 19, 20, 21, 22, 23, 24, 29, 30, 31].includes(d);
  if (m === 0) return [2, 3, 4, 5, 7, 8, 9, 10, 11, 12].includes(d);
  return false;
}

// --- Composite {Today, Tomorrow} builder (mirrors DataService.ObtainCurrentLiturgyDayInformation) ---
async function obtainLiturgyDayInformation(date, settings) {
  const ldi = new LiturgyDayInformation();
  ldi.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(date, settings);
  ldi.Today.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(ldi.Today, settings);
  ldi.Today.IsSpecialChristmas = isSpecialChristmas(ldi.Today);

  const tomorrowDate = new Date(date);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  ldi.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(tomorrowDate, settings);
  ldi.Tomorrow.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(ldi.Tomorrow, settings);
  ldi.Tomorrow.IsSpecialChristmas = isSpecialChristmas(ldi.Tomorrow);
  return ldi;
}

// --- Full resolution for one date (mirrors DataService.ReloadAllData, Mass liturgy omitted: out of scope for the Laudes pilot) ---
async function resolveDay(date, settings) {
  const ldi = await obtainLiturgyDayInformation(date, settings);
  const tomorrowLdi = await obtainLiturgyDayInformation(ldi.Tomorrow.Date, settings);
  const todayMasters = await ObtainLiturgyMasters(ldi, settings);
  const tomorrowMasters = await ObtainLiturgyMasters(tomorrowLdi, settings);
  const hoursLiturgy = await ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);
  return { liturgyDayInformation: ldi, hoursLiturgy };
}

describe('cpl-app real-content extraction (Laudes pilot)', () => {
  test('resolves Laudes for a handful of known dates and dumps them for inspection', async () => {
    const settings = buildSettings({ dioceseName: 'Barcelona', prayingPlace: 'Diòcesi' });

    const sampleDates = [
      new Date(2026, 6, 23),  // ordinary_time_16_thursday (plain ferial Thursday)
      new Date(2026, 1, 12),  // Santa Eulàlia — Barcelona-diocese Memory (per earlier research)
      new Date(2026, 11, 14), // advent_3_monday-ish window
      new Date(2026, 3, 5),   // Easter season sample
    ];

    const results = [];
    for (const date of sampleDates) {
      const { liturgyDayInformation, hoursLiturgy } = await resolveDay(date, settings);
      results.push({
        date: date.toISOString().slice(0, 10),
        today: {
          SpecificLiturgyTime: liturgyDayInformation.Today.SpecificLiturgyTime,
          Week: liturgyDayInformation.Today.Week,
          WeekCycle: liturgyDayInformation.Today.WeekCycle,
          YearType: liturgyDayInformation.Today.YearType,
          CelebrationType: liturgyDayInformation.Today.CelebrationType,
        },
        celebrationTitle: hoursLiturgy.TodayCelebrationInformation && hoursLiturgy.TodayCelebrationInformation.Title,
        laudes: hoursLiturgy.Laudes,
      });
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'laudes-sample.json'),
      JSON.stringify(results, null, 2),
      'utf8'
    );

    expect(results.length).toBe(sampleDates.length);
    for (const r of results) {
      expect(r.laudes).toBeTruthy();
    }
  });
});
