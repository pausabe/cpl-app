// Content join: cpl-app -> saints-app commons/ca (see PLAN.md, "Estratègia de join").
// For every real date in the manifest (date -> litcalId, produced by litcal's
// scripts/build-date-to-key-manifest.ts), resolves cpl-app's REAL liturgy for one or
// more Hours, and writes the Catalan text into commons/ca/<table>.json under the SAME
// numeric id that the existing es/it index (all_laudes.json / all_visperas.json / ...)
// already assigns for that field on that day. All configured hours accumulate into the
// SAME commons tables (they share the same id space), so a mismatch between e.g. what
// Laudes and Vespers each want for id 63 is caught too, not just mismatches within one
// hour.
//
// Resolution policy (see PLAN.md 6b): an id is only written if EVERY observation of it
// (across every date and every hour that references it) agrees on the same value. If
// cpl-app computes different content for the same shared id on different dates
// (confirmed real for Christmas Octave, likely also Holy Week/Easter — cpl-app and the
// existing es/it index disagree on which psalter belongs there), the id is left OUT of
// commons/ca entirely and reported in join-pending-review.json instead of guessing —
// it'll render as blank/"not found" in the app for every day that shares that slot
// until someone resolves it manually.
//
// Run with: HOURS=Laudes,Vespers npx jest migration-to-saints/join-content.test.js --silent
// (HOURS defaults to "Laudes,Vespers"; takes a couple of minutes for a 3-year window)

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const MANIFEST_PATH = path.resolve(__dirname, 'webui/run/date-to-key-manifest.json');
const DAY_TEXTS_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts';
const OUTPUT_DIR = path.resolve(__dirname, 'output/commons-ca');
const PENDING_PATH = path.resolve(__dirname, 'output/join-pending-review.json');

const DIOCESE_NAME = 'Barcelona';
const PRAYING_PLACE = 'Diòcesi';

// Which Hours to join, and where each one's existing index lives. All of them share
// the SAME commons/ca/<table>.json id space.
const HOURS_CONFIG = {
  Laudes: { allXFile: 'all_laudes.json' },
  Vespers: { allXFile: 'all_visperas.json' },
};
const HOURS_TO_RUN = (process.env.HOURS || 'Laudes,Vespers')
  .split(',')
  .map((h) => h.trim())
  .filter((h) => HOURS_CONFIG[h]);

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

async function resolveHoursLiturgy(date, settings) {
  const ldi = await obtainLiturgyDayInformation(date, settings);
  const tomorrowLdi = await obtainLiturgyDayInformation(ldi.Tomorrow.Date, settings);
  const todayMasters = await ObtainLiturgyMasters(ldi, settings);
  const tomorrowMasters = await ObtainLiturgyMasters(tomorrowLdi, settings);
  return ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);
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

const TABLES = [
  'himnos', 'salmos_citas', 'salmos_antifonas', 'salmos_textos',
  'lectura_breve_citas', 'lectura_breve_textos', 'responsorios',
  'cantico_evangelico_antifonas', 'preces_intro', 'preces_respuesta',
  'preces_contenido', 'oraciones_finales',
];

describe('Content join: cpl-app -> saints-app commons/ca', () => {
  test('extracts Catalan text for every mapped numeric id, across all configured Hours', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const settings = buildSettings({ dioceseName: DIOCESE_NAME, prayingPlace: PRAYING_PLACE });

    const allXByHour = {};
    const keysByPrefixByHour = {};
    for (const hour of HOURS_TO_RUN) {
      const allX = JSON.parse(fs.readFileSync(path.join(DAY_TEXTS_DIR, HOURS_CONFIG[hour].allXFile), 'utf8'));
      allXByHour[hour] = allX;
      const keysByPrefix = new Map();
      for (const key of Object.keys(allX)) {
        const prefix = key.split('__')[0];
        if (!keysByPrefix.has(prefix)) keysByPrefix.set(prefix, key);
      }
      keysByPrefixByHour[hour] = keysByPrefix;
    }

    // Two-pass: first collect EVERY (table, id) -> [{value, date, hour}, ...]
    // observation across the whole range and every configured Hour, then decide per id
    // whether all observed values agree. If not, the id is left out of commons/ca
    // entirely and reported as pending (see file header).
    const observations = {};
    for (const table of TABLES) observations[table] = new Map(); // id -> Map(value -> [ "date/hour", ... ])

    function observe(table, id, value, tag) {
      if (id === undefined || id === null || id === -1 || value === undefined || value === null || value === '') return;
      const key = String(id);
      let byValue = observations[table].get(key);
      if (!byValue) observations[table].set(key, (byValue = new Map()));
      if (!byValue.has(value)) byValue.set(value, []);
      byValue.get(value).push(tag);
    }

    function observeHour(entry, hourData, tag) {
      observe('himnos', entry.himno, hourData.Anthem, tag);
      if (hourData.FirstPsalm) {
        observe('salmos_citas', entry.primer_salmo_cita, hourData.FirstPsalm.Title, tag);
        observe('salmos_antifonas', entry.primer_salmo_antifona, hourData.FirstPsalm.Antiphon, tag);
        observe('salmos_textos', entry.primer_salmo_texto, hourData.FirstPsalm.Psalm, tag);
      }
      if (hourData.SecondPsalm) {
        observe('salmos_citas', entry.segundo_salmo_cita, hourData.SecondPsalm.Title, tag);
        observe('salmos_antifonas', entry.segundo_salmo_antifona, hourData.SecondPsalm.Antiphon, tag);
        observe('salmos_textos', entry.segundo_salmo_texto, hourData.SecondPsalm.Psalm, tag);
      }
      if (hourData.ThirdPsalm) {
        observe('salmos_citas', entry.tercer_salmo_cita, hourData.ThirdPsalm.Title, tag);
        observe('salmos_antifonas', entry.tercer_salmo_antifona, hourData.ThirdPsalm.Antiphon, tag);
        observe('salmos_textos', entry.tercer_salmo_texto, hourData.ThirdPsalm.Psalm, tag);
      }
      if (hourData.ShortReading) {
        observe('lectura_breve_citas', entry.lectura_biblica_cita, hourData.ShortReading.Quote, tag);
        observe('lectura_breve_textos', entry.lectura_biblica, hourData.ShortReading.ShortReading, tag);
      }
      const resp = expandResponsory(hourData.ShortResponsory);
      if (resp && resp.parts && Array.isArray(entry.responsorios)) {
        entry.responsorios.forEach((id, i) => observe('responsorios', id, resp.parts[i], tag));
      }
      observe('cantico_evangelico_antifonas', entry.cantico_evangelico_antifona, hourData.EvangelicalAntiphon, tag);
      const prayers = parsePrayers(hourData.Prayers);
      if (prayers) {
        observe('preces_intro', entry.preces_intro, prayers.intro, tag);
        observe('preces_respuesta', entry.preces_respuesta, prayers.respuesta, tag);
        if (Array.isArray(entry.preces_contenido)) {
          entry.preces_contenido.forEach((id, i) => {
            const item = prayers.contenido[i];
            if (item) observe('preces_contenido', id, `${item.peticion}\n${item.cierre}`, tag);
          });
        }
      }
      observe('oraciones_finales', entry.oracion_final, hourData.FinalPrayer, tag);
    }

    const dates = Object.keys(manifest).sort();
    let processed = 0;
    for (const dateStr of dates) {
      const { litcalId } = manifest[dateStr];
      if (!litcalId) continue;

      // Does at least one configured hour have a matching entry for this litcalId?
      // If none do, skip resolving cpl-app for this date entirely (saves time).
      const applicableHours = HOURS_TO_RUN.filter((h) => keysByPrefixByHour[h].get(litcalId));
      if (!applicableHours.length) continue;

      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const hoursLiturgy = await resolveHoursLiturgy(date, settings);
      processed++;

      for (const hour of applicableHours) {
        const key = keysByPrefixByHour[hour].get(litcalId);
        const entry = allXByHour[hour][key];
        const hourData = hoursLiturgy[hour];
        if (entry && hourData) observeHour(entry, hourData, `${dateStr} (${hour})`);
      }
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
            affectedCount: [...byValue.values()].flat().length,
            variants: [...byValue.entries()].map(([value, tags]) => ({
              preview: value.slice(0, 100),
              tags,
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
    console.log(`Hours: ${HOURS_TO_RUN.join(', ')}. Processed ${processed} dates.`);
    for (const table of TABLES) {
      console.log(`  ${table}: ${Object.keys(commons[table]).length} resolved, ${pending[table].length} pending`);
    }
    console.log(`Total: ${totalResolved} resolved, ${totalPending} pending review (see ${PENDING_PATH})`);

    expect(processed).toBeGreaterThan(0);
  }, 300000);
});
