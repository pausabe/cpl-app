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
const { textKey } = require('./lib/text-key');
const { mergeCitationHeadings } = require('./lib/citation-headings');
const memorialFerial = require('./lib/memorial-ferial');
// The comparator's flattener, reused so "which fields did cpl-app take from the weekday"
// is answered in the same vocabulary the join observes in — and can't drift from it.
const { extractHourFields } = require('./lib/cpl-day-resolver');

// Tables whose values are psalm/canticle headings ("Salm 50\nOració de penediment"), the
// only ones where the proper/psalter spelling split applies. The biblical citations of
// lectura_breve_citas are not headings and show none of it.
const CITATION_TABLES = new Set(['salmos_citas']);

const MANIFEST_PATH = path.resolve(__dirname, 'webui/run/date-to-key-manifest.json');
const CELL_MAP_PATH = path.resolve(__dirname, 'output/app-cell-map.json');
const DAY_TEXTS_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts';
const OUTPUT_DIR = path.resolve(__dirname, 'output/commons-ca');
const PENDING_PATH = path.resolve(__dirname, 'output/join-pending-review.json');

const DIOCESE_NAME = process.env.DIOCESE || 'Barcelona';
const PRAYING_PLACE = 'Diòcesi';

// Which Hours to join, and where each one's existing index lives. All of them share
// the SAME commons/ca/<table>.json id space.
//
// `observe` defaults to observeHour (the full Laudes/Vespers field set). The Invitatory
// is shaped differently — its all_invitatorios.json entry is a single `{ val: <id> }`
// pointing at one antiphon line, not the ~20 fields of an Hour — so it brings its own.
const HOURS_CONFIG = {
  Laudes: { allXFile: 'all_laudes.json' },
  Vespers: { allXFile: 'all_visperas.json' },
  Invitation: {
    allXFile: 'all_invitatorios.json',
    observe: (entry, hourData, tag, observe) =>
      observe('invitatorios', entry.val, hourData.InvitationAntiphon, tag),
  },
  // Not an Hour: the celebration's own name, shown as the header of every Hour page.
  // Its index (all_celebrations.json) keys on the bare litcal id with no `__CYCLE`
  // suffix, which the shared prefix lookup already handles (prefix === whole key).
  //
  // Only PROPER celebrations (a named saint/feast) are taken. For a ferial id like
  // `ordinary_time_1_wednesday` the es/it index stores the weekday's own name
  // ("Miércoles de la 1ª semana del Tiempo Ordinario"), but cpl-app's Title for that
  // same date reports the optional memorial that happens to fall on it ("Sant Hilari").
  // Writing that would pin one saint's name onto every recurrence of that weekday
  // forever — and the agreement check can't catch it, because it is consistently
  // wrong rather than inconsistent. Verified against ids 10/11/13/19/20 (see PLAN 6d).
  Celebration: {
    allXFile: 'all_celebrations.json',
    dataKey: 'TodayCelebrationInformation',
    isFerialKey: (key) =>
      /^(ordinary_time|advent|lent|easter|christmas_time|holy_week|octave)_/.test(key) ||
      /_after_epiphany$|_after_ash_wednesday$/.test(key) ||
      key === 'second_sunday_after_christmas',
    observe: (entry, data, tag, observe, key) => {
      if (HOURS_CONFIG.Celebration.isFerialKey(key)) return;
      observe('celebration_names', entry.name, data.Title, tag);
    },
  },
};
const HOURS_TO_RUN = (process.env.HOURS || 'Laudes,Vespers,Invitation,Celebration')
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
const LaudesService = require('../src/Services/Liturgy/LaudesService');
const VespersService = require('../src/Services/Liturgy/VespersService');
const Laudes = require('../src/Models/HoursLiturgy/Laudes').default;
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

  // The same day with the celebration taken out, to tell a proper text from a weekday one
  // field by field (lib/memorial-ferial.js). Taken BEFORE the merge runs and via a fresh
  // call: hoursLiturgy.VespersOptions.VespersWithoutCelebration looks like the same thing
  // but MergeVespersWithCelebration mutates that object in place (`let vespers =
  // withoutCelebrationVespers`), so by the time it's read here it IS the rendered Vespers
  // and ferialFields marks every field ferial — every switch-day's real content then gets
  // filed under the "_Ferial" measured cell instead of its own (see PLAN, review paranys).
  const ferial = {
    Laudes: LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings),
    Vespers: VespersService.ObtainVespers(todayMasters, ldi.Today, settings),
  };
  const hoursLiturgy = await ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);
  return { hoursLiturgy, ferial };
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
  'preces_contenido', 'oraciones_finales', 'invitatorios', 'celebration_names',
];

// Which commons table each index field points at — used only to check that the cell map
// and observeHour agree about it.
const FIELD_TABLE = {
  himno: 'himnos',
  primer_salmo_cita: 'salmos_citas', primer_salmo_antifona: 'salmos_antifonas', primer_salmo_texto: 'salmos_textos',
  segundo_salmo_cita: 'salmos_citas', segundo_salmo_antifona: 'salmos_antifonas', segundo_salmo_texto: 'salmos_textos',
  tercer_salmo_cita: 'salmos_citas', tercer_salmo_antifona: 'salmos_antifonas', tercer_salmo_texto: 'salmos_textos',
  lectura_biblica_cita: 'lectura_breve_citas', lectura_biblica: 'lectura_breve_textos',
  responsorios: 'responsorios', cantico_evangelico_antifona: 'cantico_evangelico_antifonas',
  preces_intro: 'preces_intro', preces_respuesta: 'preces_respuesta', preces_contenido: 'preces_contenido',
  oracion_final: 'oraciones_finales',
};

describe('Content join: cpl-app -> saints-app commons/ca', () => {
  test('extracts Catalan text for every mapped numeric id, across all configured Hours', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const settings = buildSettings({ dioceseName: DIOCESE_NAME, prayingPlace: PRAYING_PLACE });

    // Which cell the app REALLY reads for each field of each day, measured by running
    // saints-app itself (app-id-probe.js, see PLAN 8d). The index says which cell applies
    // by default; the stores override it (December 17–24 take their psalms from the
    // ordinary weekday, Holy Thursday resolves to a different celebration id, `-1` means
    // "fall back to the ferial part"...). Reading the index alone files those days'
    // content under cells the app never opens, which manufactures conflicts.
    const cellMap = (() => {
      try {
        return JSON.parse(fs.readFileSync(CELL_MAP_PATH, 'utf8')).days || {};
      } catch {
        console.warn(
          `No hi ha ${CELL_MAP_PATH}. Es farà servir l'índex directament, que dona caselles ` +
            `equivocades als dies amb excepcions (PLAN 8c). Genera'l amb app-id-probe.js --range.`
        );
        return {};
      }
    })();
    const cellMapUse = { fromMap: 0, fromIndex: 0, noEntry: 0 };

    // The probe reports cells as "table/id"; observeHour wants the plain id per field and
    // already knows the table. A field landing in an unexpected table would mean the two
    // sides disagree about what that field is, so it is reported instead of coerced.
    const tableMismatch = new Set();
    function entryFromCells(measured, options) {
      // On a memorial that keeps the weekday psalmody the app carries two offices, and most
      // of what cpl-app renders belongs to the ferial one — so that is the cell its text
      // goes in. Filing it under the memorial cell instead puts a ferial text where the
      // common lives, it disagrees with every other date sharing that cell, and the id is
      // dropped as conflicted forever: cpl-app can never supply it. `fromFerial` says which
      // fields really came from the weekday, per value. See lib/memorial-ferial.js.
      const cells = memorialFerial.cellsForCplApp(measured, options);
      const entry = {};
      for (const [field, cell] of Object.entries(cells)) {
        const list = Array.isArray(cell) ? cell : [cell];
        const expected = FIELD_TABLE[field];
        for (const c of list) {
          const [table] = c.split('/');
          if (expected && table !== expected) tableMismatch.add(`${field}: ${table} ≠ ${expected}`);
        }
        entry[field] = Array.isArray(cell) ? list.map((c) => c.split('/')[1]) : list[0].split('/')[1];
      }
      return entry;
    }

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
    // Grouped by textKey, not by the raw string: cpl-app stores the same text with
    // cosmetic whitespace differences between copies, and keying those apart turns one
    // unanimous text into a fake conflict (see lib/text-key.js). Each group keeps the raw
    // spellings it saw so the value written out stays byte-exact cpl-app output.
    const observations = {};
    for (const table of TABLES) observations[table] = new Map(); // id -> Map(textKey -> group)

    function observe(table, id, value, tag) {
      // `-1` is the index saying "this entry has no text here, take it from the other tab",
      // not a cell. It arrives as a number from the index and as the STRING "-1" from the
      // measured cell map, and comparing only against the number let the string through:
      // every such field was filed under a cell literally called "-1", where texts from
      // unrelated days piled up and reported themselves as one enormous conflict
      // (`salmos_citas/-1`: 2751 observations, 120 variants).
      if (id === undefined || id === null || String(id) === '-1' || value === undefined || value === null || value === '') return;
      const key = String(id);
      let byValue = observations[table].get(key);
      if (!byValue) observations[table].set(key, (byValue = new Map()));
      const vk = textKey(value);
      let group = byValue.get(vk);
      if (!group) byValue.set(vk, (group = { raws: new Map(), tags: [] }));
      group.raws.set(value, (group.raws.get(value) || 0) + 1);
      group.tags.push(tag);
    }

    // The spelling cpl-app produced most often; ties go to the first one seen. Any of them
    // would do — they differ only in blanks — but "the most common one" is a rule, not a
    // coin flip, so re-running the join can't silently swap the whitespace of a text.
    const representative = (group) =>
      [...group.raws.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0];

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

    // cpl-app.db only holds a fixed span of liturgical years. A manifest date outside it
    // makes cpl-app's own services throw on an empty row (e.g. ObtainPentecostDay reading
    // result[0].mes of nothing), which used to kill the whole run over a single edge day.
    // Skip those days and report them instead.
    const rangeDb = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
    const coveredYears = new Set(
      rangeDb.prepare('SELECT DISTINCT any AS y FROM anyliturgic').all().map((r) => String(r.y))
    );
    rangeDb.close();

    const dates = Object.keys(manifest).sort();
    let processed = 0;
    const skippedOutOfRange = [];
    const failedDates = [];
    for (const dateStr of dates) {
      const { litcalId } = manifest[dateStr];
      if (!litcalId) continue;
      // Resolving day D reaches two days ahead: D's first Vespers needs D+1, and
      // building D+1's own information asks for ITS tomorrow, D+2. So all three years
      // must be in the DB or cpl-app throws on an empty row.
      const year = dateStr.slice(0, 4);
      const yearsNeeded = [0, 1, 2].map((offset) => {
        const dd = new Date(Date.UTC(+year, +dateStr.slice(5, 7) - 1, +dateStr.slice(8, 10) + offset));
        return String(dd.getUTCFullYear());
      });
      if (!yearsNeeded.every((y2) => coveredYears.has(y2))) {
        skippedOutOfRange.push(dateStr);
        continue;
      }

      // Does at least one configured hour have a matching entry for this litcalId?
      // If none do, skip resolving cpl-app for this date entirely (saves time).
      const applicableHours = HOURS_TO_RUN.filter((h) => keysByPrefixByHour[h].get(litcalId));
      if (!applicableHours.length) continue;

      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      let hoursLiturgy;
      let ferialHours;
      try {
        ({ hoursLiturgy, ferial: ferialHours } = await resolveHoursLiturgy(date, settings));
      } catch (e) {
        // A single day cpl-app can't resolve must not throw away a 10-year run: record
        // it and carry on, so the failures are visible as data instead of a stack trace.
        failedDates.push({ date: dateStr, error: String(e && e.message ? e.message : e) });
        continue;
      }
      processed++;

      for (const hour of applicableHours) {
        const key = keysByPrefixByHour[hour].get(litcalId);
        const hourData = hoursLiturgy[HOURS_CONFIG[hour].dataKey || hour];
        const observeFn = HOURS_CONFIG[hour].observe;

        // Measured cells win over the index whenever the probe covered this day/hour.
        // The Invitatory and the celebration name are not probed (they live in other
        // stores), so they keep using the index.
        let entry;
        const probed = !HOURS_CONFIG[hour].observe && cellMap[dateStr] && cellMap[dateStr].hours
          ? cellMap[dateStr].hours[hour]
          : null;
        if (probed && probed.__noEntry) {
          // The app shows nothing here (no entry in the shared index): observing anything
          // would attribute cpl-app's text to a cell nobody reads.
          cellMapUse.noEntry++;
          continue;
        } else if (probed) {
          entry = entryFromCells(probed, {
            allXKey: key,
            fromFerial: memorialFerial.ferialFields(extractHourFields(hourData), extractHourFields(ferialHours[hour])),
          });
          cellMapUse.fromMap++;
        } else {
          entry = allXByHour[hour][key];
          cellMapUse.fromIndex++;
        }

        if (!entry || !hourData) continue;
        if (observeFn) observeFn(entry, hourData, `${dateStr} (${hour})`, observe, key);
        else observeHour(entry, hourData, `${dateStr} (${hour})`);
      }
    }

    // --- Resolve: single distinct value per id -> write it. Multiple -> pending. ---
    const commons = {};
    const pending = {};
    for (const table of TABLES) {
      commons[table] = {};
      pending[table] = [];
      for (const [id, rawByValue] of observations[table]) {
        // Psalm headings are printed with or without their descriptive line depending on
        // whether the psalmody is proper or from the psalter. saints-app has one cell for
        // both, so the two spellings are pooled into the fullest one (lib/citation-headings.js).
        const byValue = CITATION_TABLES.has(table)
          ? mergeCitationHeadings(rawByValue, representative)
          : rawByValue;
        if (byValue.size === 1) {
          commons[table][id] = representative([...byValue.values()][0]);
        } else {
          pending[table].push({
            id,
            affectedCount: [...byValue.values()].reduce((n, g) => n + g.tags.length, 0),
            variants: [...byValue.values()].map((group) => {
              const value = representative(group);
              return {
                // Long enough to actually judge the difference in the review queue: at
                // 100 chars two hymns or two intercessions often look identical because
                // only their opening line fits.
                preview: value.slice(0, 300),
                truncated: value.length > 300,
                tags: group.tags,
              };
            }),
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
    console.log(
      `Caselles: ${cellMapUse.fromMap} hores des del mapa mesurat, ${cellMapUse.fromIndex} des de l'índex, ` +
        `${cellMapUse.noEntry} saltades (l'app no hi mostra res).`
    );
    if (tableMismatch.size) {
      console.warn(`⚠️  camps del mapa amb taula inesperada: ${[...tableMismatch].join(' · ')}`);
    }
    if (skippedOutOfRange.length) {
      console.log(
        `Skipped ${skippedOutOfRange.length} date(s) outside cpl-app.db's range ` +
          `(${skippedOutOfRange[0]} … ${skippedOutOfRange[skippedOutOfRange.length - 1]}).`
      );
    }
    fs.writeFileSync(
      path.resolve(__dirname, 'output/join-skipped-dates.json'),
      JSON.stringify({ skippedOutOfRange, failedDates }, null, 2),
      'utf8'
    );
    if (failedDates.length) {
      const byError = {};
      for (const f of failedDates) (byError[f.error] = byError[f.error] || []).push(f.date);
      console.log(`cpl-app failed to resolve ${failedDates.length} date(s):`);
      for (const [err, dates] of Object.entries(byError)) {
        console.log(`  ${dates.length}× ${err}`);
        console.log(`     ${dates.slice(0, 12).join(', ')}${dates.length > 12 ? ` (+${dates.length - 12})` : ''}`);
      }
    }
    for (const table of TABLES) {
      console.log(`  ${table}: ${Object.keys(commons[table]).length} resolved, ${pending[table].length} pending`);
    }
    console.log(`Total: ${totalResolved} resolved, ${totalPending} pending review (see ${PENDING_PATH})`);

    expect(processed).toBeGreaterThan(0);
  }, 300000);
});
