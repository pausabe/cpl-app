// Stage B of the day_specific_texts content join (see PLAN.md, "Estratègia de join").
// Takes the date -> {litcalId, allXKey} manifest produced by litcal's
// scripts/build-date-to-key-manifest.ts and, for each date, runs cpl-app's REAL
// resolution (same technique as laudes.extract.test.js) to get the Catalan text, then
// writes it into commons/ca/<table>.json under the SAME numeric id that all_laudes.json
// already assigns for that field on that day (shared across es/it/ca — see PLAN.md
// section 2).
//
// Resolution policy (see PLAN.md 6b): an id is only written if EVERY date that
// references it agrees on the same value. If cpl-app computes different content for
// the same shared id on different dates (confirmed real for Christmas Octave, likely
// also Holy Week/Easter — cpl-app and the existing es/it index disagree on which
// psalter belongs there), the id is left OUT of commons/ca entirely and reported in
// join-pending-review.json instead of guessing — it'll render as blank/"not found" in
// the app for every day that shares that slot until someone resolves it manually.
//
// Run with: npx jest migration-to-saints/join-laudes.test.js --silent
// (takes a minute or two for a 3-year window — one full cpl-app resolution per date)

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const MANIFEST_PATH = path.resolve(__dirname, 'webui/run/date-to-key-manifest.json');
const ALL_LAUDES_PATH = path.resolve(
  '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts/all_laudes.json'
);
const OUTPUT_DIR = path.resolve(__dirname, 'output/commons-ca');
const PENDING_PATH = path.resolve(__dirname, 'output/join-pending-review.json');

const DIOCESE_NAME = 'Barcelona';
const PRAYING_PLACE = 'Diòcesi';

// Fixed short-form doxology used mid-responsory (distinct from the full "...com era al
// principi..." ending recited after psalms) — confirmed against cpl's own psalm texts,
// which always open their doxology with this exact sentence.
const GLORIA_PATRI_SHORT = 'Glòria al Pare, i al Fill, i a l’Esperit Sant.';

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

function buildSettings({ dioceseName, prayingPlace, useLatin = false }) {
  const settings = new Settings();
  settings.PrayingPlace = prayingPlace;
  settings.DioceseName = dioceseName;
  settings.DioceseCode = DatabaseDataHelper.GetDioceseCodeFromDioceseName(dioceseName, prayingPlace);
  settings.DioceseCode2Letters =
    settings.DioceseCode === DioceseCode.Andorra ? settings.DioceseCode : settings.DioceseCode.substring(0, 2);
  settings.UseLatin = useLatin;
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

async function resolveLaudes(date, settings) {
  const ldi = await obtainLiturgyDayInformation(date, settings);
  const tomorrowLdi = await obtainLiturgyDayInformation(ldi.Tomorrow.Date, settings);
  const todayMasters = await ObtainLiturgyMasters(ldi, settings);
  const tomorrowMasters = await ObtainLiturgyMasters(tomorrowLdi, settings);
  const hoursLiturgy = await ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);
  return hoursLiturgy.Laudes;
}

// --- Prayers-blob parser (confirmed against bridget_of_sweden_religious, 2026-07-23 —
// see PLAN.md section 5): first paragraph minus its last line = intro; that last line =
// the refrain (preces_respuesta); middle paragraphs each split on the em-dash into
// (petition, closing) = preces_contenido entries; final paragraph = the Pare Nostre
// intro (handled separately, via a static translated table, not from this parse).
function parsePrayers(blob) {
  if (!blob) return null;
  const paragraphs = blob.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) return null;
  const firstLines = paragraphs[0].split('\n').map((l) => l.trim()).filter(Boolean);
  const intro = firstLines.slice(0, -1).join('\n');
  const respuesta = firstLines[firstLines.length - 1];
  const middle = paragraphs.slice(1, -1);
  const contenido = middle.map((p) => {
    const idx = p.indexOf('—');
    if (idx === -1) return { peticion: p.trim(), cierre: '' };
    return { peticion: p.slice(0, idx).trim(), cierre: p.slice(idx + 1).replace(/^\t/, '').trim() };
  });
  return { intro, respuesta, contenido };
}

function expandResponsory(r) {
  if (!r) return null;
  if (r.HasSpecialAntiphon) return { special: r.SpecialAntiphon };
  const full = `${r.FirstPart || ''} ${r.SecondPart || ''}`.trim();
  return {
    parts: [
      `℣. ${r.FirstPart || ''} * ${r.SecondPart || ''}`,
      `℟. ${full}`,
      `℣. ${r.ThirdPart || ''}`,
      `℟. ${r.SecondPart || ''}`,
      `℣. ${GLORIA_PATRI_SHORT}`,
      `℟. ${full}`,
    ],
  };
}

describe('Laudes content join: cpl-app -> saints-app commons/ca', () => {
  test('extracts Catalan text for every mapped numeric id in all_laudes.json', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const allLaudes = JSON.parse(fs.readFileSync(ALL_LAUDES_PATH, 'utf8'));
    const settings = buildSettings({ dioceseName: DIOCESE_NAME, prayingPlace: PRAYING_PLACE });

    const TABLES = [
      'himnos', 'salmos_citas', 'salmos_antifonas', 'salmos_textos',
      'lectura_breve_citas', 'lectura_breve_textos', 'responsorios',
      'cantico_evangelico_antifonas', 'preces_intro', 'preces_respuesta',
      'preces_contenido', 'oraciones_finales',
    ];
    // Two-pass: first collect EVERY (table, id) -> [{value, date}, ...] observation
    // across the whole range, then decide per id whether all observed values agree.
    // If an id sees more than one distinct value across different dates, cpl-app and
    // the existing es/it index disagree about what belongs in that (shared!) slot for
    // at least one of those dates (see PLAN.md 6b — confirmed real for Christmas
    // Octave, likely also Holy Week/Easter). We can't tell which date is "wrong"
    // without a manual liturgical review, and because the id is shared, writing ANY
    // single value would silently make it wrong for the other date(s) that use the
    // same slot. So: leave it out of commons/ca entirely (renders as blank/"not
    // found" in the app, same as it already does for any other missing id) and report
    // it as pending review, rather than guessing.
    const observations = {};
    for (const table of TABLES) observations[table] = new Map(); // id -> Map(value -> [dates])

    function observe(table, id, value, date) {
      if (id === undefined || id === null || id === -1 || value === undefined || value === null || value === '') return;
      const key = String(id);
      let byValue = observations[table].get(key);
      if (!byValue) observations[table].set(key, (byValue = new Map()));
      if (!byValue.has(value)) byValue.set(value, []);
      byValue.get(value).push(date);
    }

    const dates = Object.keys(manifest).sort();
    let processed = 0;
    for (const dateStr of dates) {
      const { allXKey } = manifest[dateStr];
      if (!allXKey) continue;
      const entry = allLaudes[allXKey];
      if (!entry) continue;

      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const laudes = await resolveLaudes(date, settings);
      processed++;

      observe('himnos', entry.himno, laudes.Anthem, dateStr);
      if (laudes.FirstPsalm) {
        observe('salmos_citas', entry.primer_salmo_cita, laudes.FirstPsalm.Title, dateStr);
        observe('salmos_antifonas', entry.primer_salmo_antifona, laudes.FirstPsalm.Antiphon, dateStr);
        observe('salmos_textos', entry.primer_salmo_texto, laudes.FirstPsalm.Psalm, dateStr);
      }
      if (laudes.SecondPsalm) {
        observe('salmos_citas', entry.segundo_salmo_cita, laudes.SecondPsalm.Title, dateStr);
        observe('salmos_antifonas', entry.segundo_salmo_antifona, laudes.SecondPsalm.Antiphon, dateStr);
        observe('salmos_textos', entry.segundo_salmo_texto, laudes.SecondPsalm.Psalm, dateStr);
      }
      if (laudes.ThirdPsalm) {
        observe('salmos_citas', entry.tercer_salmo_cita, laudes.ThirdPsalm.Title, dateStr);
        observe('salmos_antifonas', entry.tercer_salmo_antifona, laudes.ThirdPsalm.Antiphon, dateStr);
        observe('salmos_textos', entry.tercer_salmo_texto, laudes.ThirdPsalm.Psalm, dateStr);
      }
      if (laudes.ShortReading) {
        observe('lectura_breve_citas', entry.lectura_biblica_cita, laudes.ShortReading.Quote, dateStr);
        observe('lectura_breve_textos', entry.lectura_biblica, laudes.ShortReading.ShortReading, dateStr);
      }
      const resp = expandResponsory(laudes.ShortResponsory);
      if (resp && resp.parts && Array.isArray(entry.responsorios)) {
        entry.responsorios.forEach((id, i) => observe('responsorios', id, resp.parts[i], dateStr));
      }
      observe('cantico_evangelico_antifonas', entry.cantico_evangelico_antifona, laudes.EvangelicalAntiphon, dateStr);
      const prayers = parsePrayers(laudes.Prayers);
      if (prayers) {
        observe('preces_intro', entry.preces_intro, prayers.intro, dateStr);
        observe('preces_respuesta', entry.preces_respuesta, prayers.respuesta, dateStr);
        if (Array.isArray(entry.preces_contenido)) {
          entry.preces_contenido.forEach((id, i) => {
            const item = prayers.contenido[i];
            if (item) observe('preces_contenido', id, `${item.peticion}\n${item.cierre}`, dateStr);
          });
        }
      }
      observe('oraciones_finales', entry.oracion_final, laudes.FinalPrayer, dateStr);
    }

    // --- Resolve: single distinct value per id -> write it. Multiple -> pending. ---
    const commons = {};
    const pending = {};
    for (const table of TABLES) {
      commons[table] = {};
      pending[table] = [];
      for (const [id, byValue] of observations[table]) {
        if (byValue.size === 1) {
          commons[table][id] = [...byValue.keys()][0];
        } else {
          pending[table].push({
            id,
            affectedDates: [...byValue.values()].flat().sort(),
            variants: [...byValue.entries()].map(([value, dates]) => ({
              value,
              preview: value.slice(0, 100),
              dates,
            })),
          });
        }
      }
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const [table, data] of Object.entries(commons)) {
      fs.writeFileSync(path.join(OUTPUT_DIR, `${table}.json`), JSON.stringify(data, null, 2), 'utf8');
    }
    fs.writeFileSync(PENDING_PATH, JSON.stringify(pending, null, 2), 'utf8');

    const totalResolved = Object.values(commons).reduce((n, t) => n + Object.keys(t).length, 0);
    const totalPending = Object.values(pending).reduce((n, t) => n + t.length, 0);
    console.log(`Processed ${processed} dates.`);
    for (const table of TABLES) {
      console.log(`  ${table}: ${Object.keys(commons[table]).length} resolved, ${pending[table].length} pending`);
    }
    console.log(`Total: ${totalResolved} resolved, ${totalPending} pending review (see ${PENDING_PATH})`);

    expect(processed).toBeGreaterThan(0);
  }, 300000);
});
