// Asks cpl-app itself, for every date of the current manifest window: "what are you
// celebrating today?" — and writes the answers to output/cpl-celebrations.json.
//
// The join already knows what TEXT cpl-app gives each day, but not WHY. When a day's
// content disagrees with every other day sharing its cell, the useful question is not
// "which text wins" but "is cpl-app celebrating something litcal never told us about?".
// Answering that needs cpl-app's own verdict for the day (its celebration name and
// M/F/S/L/V rank), which the join deliberately does not record for ferial litcal keys
// (see join-content.test.js, HOURS_CONFIG.Celebration: writing a saint's name into a
// weekday cell would pin it there forever).
//
// So this is a separate, read-only pass over the same dates. It touches none of the
// join's outputs; missing-celebrations.js is what turns this dump into a verdict.
//
// Run with: npx jest migration-to-saints/celebration-probe.test.js --silent
// (~25 ms per date: a 10-year window is a minute and a half)

const path = require('path');
const fs = require('fs');

const MANIFEST_PATH = path.resolve(__dirname, 'webui/run/date-to-key-manifest.json');
const OUTPUT_PATH = path.resolve(__dirname, 'output/cpl-celebrations.json');

const DIOCESE_NAME = process.env.DIOCESE || 'Barcelona';
const PRAYING_PLACE = 'Diòcesi';

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
  const db = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
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
const { SpecificLiturgyTimeType } = require('../src/Services/CelebrationTimeEnums');

// Same settings the join uses, so the probe answers for the same app the join extracted
// from. OptionalFestivityEnabled=false matters here: with optional memorials switched
// off, an `L`/`V` day serves the plain ferial office, which is exactly why those days
// never contest a cell and must not be reported as a missing celebration.
function buildSettings({ dioceseName, prayingPlace }) {
  const settings = new Settings();
  settings.PrayingPlace = prayingPlace;
  settings.DioceseName = dioceseName;
  settings.DioceseCode = DatabaseDataHelper.GetDioceseCodeFromDioceseName(dioceseName, prayingPlace);
  settings.DioceseCode2Letters =
    settings.DioceseCode === DioceseCode.Andorra ? settings.DioceseCode : settings.DioceseCode.substring(0, 2);
  settings.UseLatin = false;
  settings.TextSize = 3;
  settings.DarkModeEnabled = false;
  settings.InvitationPsalmOption = '94';
  settings.VirginAntiphonOption = '1';
  settings.OptionalFestivityEnabled = false;
  return settings;
}

function isSpecialChristmas(day) {
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

describe('cpl-app celebration probe', () => {
  test('records the celebration cpl-app reports for every date of the manifest', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const dates = Object.keys(manifest).sort();
    expect(dates.length).toBeGreaterThan(0);

    const settings = buildSettings({ dioceseName: DIOCESE_NAME, prayingPlace: PRAYING_PLACE });
    const days = {};
    const failed = [];

    for (const dateStr of dates) {
      const [y, m, d] = dateStr.split('-').map(Number);
      try {
        const ldi = await obtainLiturgyDayInformation(new Date(y, m - 1, d), settings);
        const tomorrowLdi = await obtainLiturgyDayInformation(ldi.Tomorrow.Date, settings);
        const hours = await ObtainHoursLiturgy(
          await ObtainLiturgyMasters(ldi, settings),
          await ObtainLiturgyMasters(tomorrowLdi, settings),
          ldi,
          settings
        );
        const info = hours.TodayCelebrationInformation || {};
        days[dateStr] = {
          // '' for a plain ferial day: cpl-app only names a celebration when there is one.
          title: (info.Title || '').trim(),
          // 'S' Solemnity · 'F' Festivity · 'M' Memory · 'L'/'V' optional · '-' ferial.
          type: ldi.Today.CelebrationType || '-',
          time: ldi.Today.SpecificLiturgyTime,
          week: ldi.Today.LiturgyWeek,
        };
      } catch (e) {
        failed.push({ date: dateStr, error: String(e && e.message ? e.message : e) });
      }
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(
        {
          diocese: DIOCESE_NAME,
          prayingPlace: PRAYING_PLACE,
          generatedAt: new Date().toISOString(),
          dateCount: Object.keys(days).length,
          failed,
          days,
        },
        null,
        1
      ),
      'utf8'
    );

    console.log(
      `cpl-app ha respost per ${Object.keys(days).length}/${dates.length} dates` +
        (failed.length ? ` (${failed.length} han fallat, veure "failed" al fitxer)` : '')
    );
    // Resolving a day also resolves the NEXT one (first Vespers), so the very last date
    // of cpl-app's own `anyliturgic` range has no tomorrow to read and always fails —
    // the same edge the join reports as `skippedOutOfRange`. Anything failing further
    // inside the window is a real problem and must not pass silently.
    const lastDate = dates[dates.length - 1];
    expect(failed.filter((f) => f.date !== lastDate)).toEqual([]);
  }, 1800000);
});
