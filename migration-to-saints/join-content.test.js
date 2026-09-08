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
// The Common of the Saints, the second source: cpl-app never renders it on a memorial, so
// without this the Catalan half of saints-app's memorial tab can never be filled. See
// lib/common-office.js and decisions/D-001-el-comu-a-les-memories.md.
const commonOffice = require('./lib/common-office');
const { fingerprint } = require('./lib/citation-key');
// The comparator's flattener, reused so "which fields did cpl-app take from the weekday"
// is answered in the same vocabulary the join observes in — and can't drift from it.
const {
  extractHourFields, hourDataOf, psalmAntiphons, responsoryParts, extractOfficeFields,
  extractMassFields, MASS_ROLES,
} = require('./lib/cpl-day-resolver');

// Tables whose values are psalm/canticle headings ("Salm 50\nOració de penediment"), the
// only ones where the proper/psalter spelling split applies. The biblical citations of
// lectura_breve_citas are not headings and show none of it.
const CITATION_TABLES = new Set(['salmos_citas']);

const MANIFEST_PATH = path.resolve(__dirname, 'webui/run/date-to-key-manifest.json');
const CELL_MAP_PATH = path.resolve(__dirname, 'output/app-cell-map.json');
const DAY_TEXTS_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts';
// Overridable so a targeted run (a handful of dates, for a regression test) can write
// somewhere else instead of overwriting the real 10-year output with a partial one.
const OUTPUT_ROOT = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve(__dirname, 'output');
const OUTPUT_DIR = path.join(OUTPUT_ROOT, 'commons-ca');
const PENDING_PATH = path.join(OUTPUT_ROOT, 'join-pending-review.json');

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
  // Terce, Sext and None. Same field vocabulary as Laudes (15 of its 20 fields) and the
  // SAME commons tables — they add no table of their own — so nothing here needs a special
  // observer. Where they differ is in cpl-app's model, and that is handled once in
  // lib/cpl-day-resolver.js: they hang off `hoursLiturgy.Hours`, their responsory is a
  // versicle/response pair rather than six lines, and a celebration says ONE antiphon over
  // all three psalms instead of one each.
  // `dualOffice: false` because these three have no memorial/weekday selector: on a
  // `MEMORY_FERIAL` day the store REPLACES the whole record with the weekday's
  // (`terciaStore.ts`, "Override with ferial if MEMORY_FERIAL") instead of carrying both
  // behind a switch, and it writes no `<field>_Ferial` twin. So the measured cell is
  // already the right one and must not be redirected — nor is there a second tab for the
  // Common of the Saints to fill (lib/common-office.js only models Laudes and Vespers).
  Tercia: { allXFile: 'all_tercia.json', dualOffice: false },
  Sexta: { allXFile: 'all_sexta.json', dualOffice: false },
  Nona: { allXFile: 'all_nona.json', dualOffice: false },
  // The Office of Readings. Its own three tables (`oficio_citas`, `oficio_titulos`,
  // `oficio_textos`) on top of the shared ones, and a field vocabulary nothing else uses:
  // two long readings, each with a three-part responsory, plus the Office's own
  // versicle/response. That vocabulary lives in `lib/cpl-day-resolver.js`
  // (`extractOfficeFields`) so the join, the inspector and the comparator read it the same
  // way; `observeOffice` below is just the loop that files it.
  //
  // `dualOffice: false` for the same reason as the little Hours: on a memorial `officeStore`
  // REPLACES the psalmody, the biblical reading and their responsories with the weekday's
  // (the `cycle === "MEMORY"` block) instead of carrying two offices behind a switch, and it
  // writes no `<field>_Ferial` twin. The measured cell is already the right one.
  //
  // Only the `_a` (annual) cycle is written. `_i`/`_p` are the optional biennial cycle, which
  // Catalan does not have — `LanguageFeatures.biennialReadings` is `["es", "it"]`, so the
  // selector never appears and the app always reads `_a`. See FASES.md, fase 3.
  Office: { allXFile: 'all_oficio.json', dualOffice: false },
  // The Mass. Not an Hour, and the one part of the day where cpl-app can fill BOTH of
  // saints-app's two columns by itself: `CELEBRATION_*` (the celebration's own Mass) and the
  // plain roles (the weekday's), because `GetNormalDaysMassLiturgy` gives the second on
  // demand. In the Hours that second half had to be inferred from the Common (D-001).
  //
  // Which of the two goes in which cell is not decided by a rule here — it is READ OFF the
  // Spanish citation already in the cell (`observeMass`). Mass readings always carry one, and
  // it is the same currency in both languages, so the question "is this the cell for Acts 12
  // or for Acts 3?" has an answer instead of a heuristic. On the feast of Peter and Paul the
  // plain roles hold the VIGIL Mass and `CELEBRATION_*` the day Mass; a rule keyed on
  // "proper or ferial" would have filed the day Mass into the vigil's cells every year and
  // the agreement check could not have caught it, because it would be consistently wrong.
  //
  // Its index entry is shaped differently from every other one — `{ lecturas: { ROLE: { ref,
  // texto } } }` rather than one key per field — and so is what the store hands back (an
  // ARRAY of `Lecture`, flattened by the probe). `fromIndex` brings the index side into the
  // same `{ROLE}_ref` / `{ROLE}_texto` vocabulary the probe reports, so the two are
  // interchangeable here exactly as they are for every other Hour.
  Mass: {
    allXFile: 'all_lectures.json',
    dualOffice: false,
    fromIndex: (entry) => {
      const out = {};
      for (const [role, cell] of Object.entries((entry && entry.lecturas) || {})) {
        if (cell.ref !== undefined && cell.ref !== null) out[`${role}_ref`] = cell.ref;
        if (cell.texto !== undefined && cell.texto !== null) out[`${role}_texto`] = cell.texto;
      }
      return out;
    },
  },
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
// A comma-separated list of dates, to validate a change without waiting for the whole
// 10-year window. Empty means every date in the manifest, which is the real run.
const ONLY_DATES = (process.env.DATES || '').split(',').map((d) => d.trim()).filter(Boolean);

const HOURS_TO_RUN = (process.env.HOURS || 'Laudes,Vespers,Tercia,Sexta,Nona,Office,Mass,Invitation,Celebration')
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
const { ObtainHours } = require('../src/Services/Liturgy/HoursService');
const { ObtainMassLiturgy } = require('../src/Services/Liturgy/MassLiturgyService');
const Hours = require('../src/Models/HoursLiturgy/Hours').default;
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
  // Terce/Sext/None arrive as one object; asking for it with an empty celebration is the
  // same call the app makes, so seasons and psalter weeks behave exactly as on screen.
  const ferialHours = ObtainHours(todayMasters, ldi.Today, new Hours(), settings);
  const ferial = {
    Laudes: LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings),
    Vespers: VespersService.ObtainVespers(todayMasters, ldi.Today, settings),
    Tercia: ferialHours.ThirdHour,
    Sexta: ferialHours.SixthHour,
    Nona: ferialHours.NinthHour,
  };
  const hoursLiturgy = await ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);

  // The Mass, in the two halves saints-app keeps apart: what cpl-app renders, and the
  // weekday's asked for separately. On a memorial the first is the celebration's Mass and the
  // second the one the plain roles of the index hold. See HOURS_CONFIG.Mass and PLAN §18.
  let mass = null;
  try {
    const massLiturgy = await ObtainMassLiturgy(
      ldi, hoursLiturgy.TodayCelebrationInformation, hoursLiturgy.TomorrowCelebrationInformation, settings,
    );
    let massFerial = null;
    try {
      massFerial = await DatabaseDataService.GetNormalDaysMassLiturgy(ldi.Today);
    } catch { massFerial = null; }
    // `massLiturgy.Vespers` is the anticipated evening Mass of the following day. The index
    // has one entry per day and no cell for it, so it is not carried (PLAN §18.5).
    mass = { rendered: massLiturgy.Today, ferial: massFerial };
  } catch {
    mass = null;
  }
  return { hoursLiturgy, ferial, ldi, mass };
}

// Mirrors HoursLiturgyService.tsx's private TomorrowIsMoreImportant/HasLiturgyContent: the
// exact rule cpl-app itself uses to decide whether today's rendered Vespers are actually
// tomorrow's First Vespers (a solemnity/feast whose evening office pre-empts today's own or
// ferial one, per OGLH 61). Needed here — not exported by the app — because the join must
// know NOT to file that content under today's litcalId: saints-app has no First Vespers slot
// (review/findings.js F5), so today's shared cell must not be polluted with tomorrow's
// content, which is what corrupts it for every other date that legitimately shares it (F6).
function hasLiturgyContent(value) {
  return value !== undefined && value !== '' && value !== '-';
}

function vespersComeFromTomorrow(hoursLiturgy) {
  const todayPrecedence = hoursLiturgy.TodayCelebrationInformation.Precedence;
  const tomorrowPrecedence = hoursLiturgy.TomorrowCelebrationInformation.Precedence;
  const todaySecond = hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration;
  const tomorrowFirst = hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration;
  if (todayPrecedence === tomorrowPrecedence) {
    return hasLiturgyContent(tomorrowFirst.EvangelicalAntiphon) && !hasLiturgyContent(todaySecond.EvangelicalAntiphon);
  }
  return tomorrowPrecedence < todayPrecedence;
}

// The prayers blob is parsed in lib/common-office.js — the Common's own blob has the same
// shape, and the two must come apart identically or a Common petition and a rendered one
// would never compare equal.
const { parsePrayers } = commonOffice;

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
  // The Office of Readings' own three, which no other Hour touches.
  'oficio_citas', 'oficio_titulos', 'oficio_textos',
  // The Mass's own two.
  'lecturas_referencia', 'lecturas_texto',
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
  // Office of Readings. The psalm and hymn fields above are shared with it verbatim; these
  // are the ones only it has. The `_i`/`_p` twins are deliberately absent: they are the
  // biennial cycle, which Catalan never reads, so nothing must be filed under them.
  responsorio1: 'responsorios', responsorio2_a: 'responsorios', responsorio3_a: 'responsorios',
  lectura_biblica_cita_a: 'oficio_citas', lectura_biblica_titulo_a: 'oficio_titulos',
  lectura_biblica_texto_a: 'oficio_textos',
  lectura_patristica_cita_a: 'oficio_citas', lectura_patristica_titulo_a: 'oficio_titulos',
  lectura_patristica_texto_a: 'oficio_textos',
};

// The Mass adds two cells per role, and there are 34 roles once `CELEBRATION_` and the
// Easter Vigil's numbered readings are counted. Generated from the same `MASS_ROLES` table the
// flattener reads, so a role can never exist on one side and not the other.
for (const role of Object.keys(MASS_ROLES)) {
  for (const prefix of ['', 'CELEBRATION_']) {
    FIELD_TABLE[`${prefix}${role}_ref`] = 'lecturas_referencia';
    FIELD_TABLE[`${prefix}${role}_texto`] = 'lecturas_texto';
  }
}

describe('Content join: cpl-app -> saints-app commons/ca', () => {
  // cpl-app picks a DIFFERENT hymn for the Office of Readings when it is prayed before six
  // in the morning (`OfficeService.IsDarkAnthem` — the only `new Date()` in the whole of
  // `src/Services`). The shared index has ONE cell for the hymn, so which of the two gets
  // migrated must not depend on what time of day the join happens to be run at. Pinned to
  // midday: that is what the app shows for eighteen hours out of twenty-four. The nocturnal
  // hymn has no cell to go in — decisions/D-005-l-himne-nocturn-de-l-ofici.md.
  //
  // Only `Date` is faked. Faking the timers too would hang the run: every date resolves
  // through promises the DB seam settles on real callbacks.
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: [
        'hrtime', 'nextTick', 'performance', 'queueMicrotask', 'requestAnimationFrame',
        'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'setImmediate',
        'clearImmediate', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout',
      ],
      now: new Date(2026, 0, 1, 12, 0, 0),
    });
  });
  afterAll(() => jest.useRealTimers());

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
    function entryFromCells(measured, options, which = 0) {
      // On a memorial that keeps the weekday psalmody the app carries two offices, and most
      // of what cpl-app renders belongs to the ferial one — so that is the cell its text
      // goes in. Filing it under the memorial cell instead puts a ferial text where the
      // common lives, it disagrees with every other date sharing that cell, and the id is
      // dropped as conflicted forever: cpl-app can never supply it. `fromFerial` says which
      // fields really came from the weekday, per value. See lib/memorial-ferial.js.
      const cells = memorialFerial.cellsForMode(measured, options, which);
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

    // --- Segona font: el Comú dels sants -------------------------------------------------
    //
    // Els dies de memòria, cpl-app resa la fèria i el seu text va a la casella ferial. La
    // casella de la pestanya del sant es queda sense ningú que la pugui omplir: cpl-app no
    // demana mai el Comú (`Categoria = '0000'`, vegeu decisions/D-001). En castellà aquella
    // pestanya SÍ que mostra el Comú, i el 3 de setembre de 2026 es va decidir que el català
    // hi faci igual. Això és el que l'omple.
    const commonsDb = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
    const { commons: commonRows, byCategoria: commonsByCategoria } = commonOffice.loadCommons(commonsDb);
    const esTableCache = {};
    function esTable(table) {
      if (!(table in esTableCache)) {
        try {
          esTableCache[table] = JSON.parse(fs.readFileSync(path.join(DAY_TEXTS_DIR, `commons/es/${table}.json`), 'utf8'));
        } catch {
          esTableCache[table] = {};
        }
      }
      return esTableCache[table];
    }
    const esValue = (table, id) => {
      const t = esTable(table);
      const ids = Array.isArray(id) ? id : [id];
      const parts = ids.map((i) => (t[String(i)] == null ? '' : String(t[String(i)])));
      return parts.every((x) => x === '') ? null : parts.join('\u0000');
    };
    const esShortReadingCitations = esTable('lectura_breve_citas');
    const citeKey = (value) => {
      const f = value ? fingerprint(value) : null;
      return f ? f.token : null;
    };
    const commonPools = new Map();   // "títol|sufix|cita" -> { row, pool, pickedBy }
    const commonStats = { days: 0, cells: 0, sameAsFerial: 0, properNoEvidence: 0, noCommon: new Map() };
    // Which ids the Common supplied. The export treats these as additive only: they may fill
    // an empty cell but never change one that already carries Catalan text — see
    // export-to-saints-app.js. Without that, a cell whose only observation in this run is the
    // Common wins unopposed and silently replaces content an earlier run got right.
    const commonSourced = {};

    function commonForDay({ title, suffix, hour, citation }) {
      const cacheKey = `${title}|${suffix}|${hour}|${citation || ''}`;
      if (commonPools.has(cacheKey)) return commonPools.get(cacheKey);
      const picked = commonOffice.pickCommonRow({
        title, suffix, commons: commonRows, byCategoria: commonsByCategoria,
        want: citation ? { [hour]: citation } : {},
        citeKey,
      });
      const result = picked.row
        ? { row: picked.row, pool: commonOffice.poolByField(picked.row), pickedBy: picked.pickedBy }
        : null;
      commonPools.set(cacheKey, result);
      return result;
    }

    // `memorialEntry` holds the memorial tab's cells. Only the fields cpl-app took from the
    // weekday are written: for those the cell is genuinely unclaimed. For a field cpl-app
    // supplies itself — the collect always, the Benedictus antiphon on 153 of the 527
    // memorials — its own text already owns that cell and the Common must not overwrite it.
    function markCommonSourced(table, id) {
      const key = String(id).split('/').pop();
      (commonSourced[table] = commonSourced[table] || new Set()).add(key);
    }

    // Returns the fields the Common actually wrote, so a caller on a single-tab day knows
    // which of cpl-app's own fields it must now withhold.
    function observeCommonHour(memorialEntry, ferialEntry, hour, fromFerial, tag, day, opts = {}) {
      const taken = new Set();
      if (!memorialEntry || !fromFerial || !fromFerial.size) return taken;
      const citation = citeKey(esShortReadingCitations[String(memorialEntry.lectura_biblica_cita)]);
      const picked = commonForDay({ ...day, hour, citation });
      if (!picked) {
        commonStats.noCommon.set(day.title, (commonStats.noCommon.get(day.title) || 0) + 1);
        return taken;
      }
      const pool = picked.pool[hour];
      if (!pool) return taken;
      // One tab only: the Common displaces text instead of filling a gap, so it has to earn
      // the field on the Spanish citation, not on the title. See lib/common-office.js.
      const overrides = opts.properOnly
        ? commonOffice.commonOverrides({ pool, fromFerial, pickedBy: picked.pickedBy })
        : null;
      if (overrides && !overrides.size) { commonStats.properNoEvidence++; return taken; }
      let wrote = 0;
      for (const [field, value] of Object.entries(pool)) {
        if (!fromFerial.has(field)) continue;
        if (overrides && !overrides.has(field)) continue;
        const table = FIELD_TABLE[field];
        const id = memorialEntry[field];
        if (!table || id === undefined || id === null) continue;
        // The premise of writing the Common here is that the saint's tab shows something the
        // weekday's does not. The Spanish index says whether that is true on this day, and it
        // is not always: on several Eastertide memorials it points the memorial's preces at
        // the SEASON's cell, the same one the ferial tab uses (`preces_intro/1218`, "Oremos a
        // Cristo, que resucitado de entre los muertos…", 24 day-hours). Writing the Common
        // there would overwrite content that is already right, in a cell the weekday also
        // owns. So: only where the two tabs really differ in Spanish.
        if (!opts.properOnly) {
          const esMemorial = esValue(table, id);
          const esFerial = esValue(table, ferialEntry[field]);
          if (esMemorial === null || (esFerial !== null && esMemorial === esFerial)) {
            commonStats.sameAsFerial++;
            continue;
          }
        }
        if (Array.isArray(value)) {
          if (!Array.isArray(id)) continue;
          value.forEach((v, i) => {
            if (commonOffice.usable(v) && id[i] !== undefined) {
              observe(table, id[i], v, tag);
              markCommonSourced(table, id[i]);
              wrote++;
              taken.add(field);
            }
          });
        } else if (commonOffice.usable(value)) {
          observe(table, id, value, tag);
          markCommonSourced(table, id);
          wrote++;
          taken.add(field);
        }
      }
      if (wrote) { commonStats.days++; commonStats.cells += wrote; }
      return taken;
    }

    function observeHour(entry, hourData, tag) {
      observe('himnos', entry.himno, hourData.Anthem, tag);
      // The antiphons come from lib/cpl-day-resolver, not from the psalms directly: on an
      // intermediate Hour of a celebration ONE antiphon covers all three, and the per-psalm
      // ones the model still carries are not what the screen shows.
      const antiphons = psalmAntiphons(hourData);
      const psalms = [
        ['primer', hourData.FirstPsalm],
        ['segundo', hourData.SecondPsalm],
        ['tercer', hourData.ThirdPsalm],
      ];
      psalms.forEach(([prefix, psalm], i) => {
        if (!psalm) return;
        observe('salmos_citas', entry[`${prefix}_salmo_cita`], psalm.Title, tag);
        observe('salmos_antifonas', entry[`${prefix}_salmo_antifona`], antiphons[i], tag);
        observe('salmos_textos', entry[`${prefix}_salmo_texto`], psalm.Psalm, tag);
      });
      if (hourData.ShortReading) {
        observe('lectura_breve_citas', entry.lectura_biblica_cita, hourData.ShortReading.Quote, tag);
        observe('lectura_breve_textos', entry.lectura_biblica, hourData.ShortReading.ShortReading, tag);
      }
      // Six lines for Laudes and Vespers, a versicle/response pair for the intermediate
      // Hours — same helper, so the two shapes can't be paired up wrongly here.
      const respParts = responsoryParts(hourData);
      if (respParts && Array.isArray(entry.responsorios)) {
        entry.responsorios.forEach((id, i) => observe('responsorios', id, respParts[i], tag));
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

    // --- The Mass -------------------------------------------------------------------------
    //
    // cpl-app offers up to three Masses for one date and saints-app up to two columns, and
    // nothing in either index says which goes where. What does say it is the citation: a Mass
    // reading always carries one, `es` already has it in the cell, and `fingerprint()` compares
    // the two languages' spellings of it (lib/citation-key.js). So every cell is filled by
    // asking "which of cpl-app's readings is the one this cell is already about?", and a cell
    // whose citation matches none of them is left alone.
    //
    // The three candidates:
    //   rendered   what cpl-app prays that day — the celebration's Mass on a solemnity, the
    //              weekday's otherwise
    //   ferial     the weekday's, asked for separately (`GetNormalDaysMassLiturgy`), which is
    //              what fills the plain roles of a memorial while `rendered` fills CELEBRATION_
    //   eve        yesterday's rendered Mass. Only ever matches on Easter Sunday, whose entry
    //              carries the VIGIL in its plain roles — cpl-app resolves that vigil on Holy
    //              Saturday (PLAN §18.4). Costs nothing: the citation gate keeps it from
    //              reaching any other day.
    const massStats = { cells: 0, byCandidate: { rendered: 0, ferial: 0, eve: 0 }, unmatched: 0 };
    function observeMass(entry, candidates, tag) {
      const flat = {
        rendered: extractMassFields(candidates.rendered),
        ferial: extractMassFields(candidates.ferial),
        eve: extractMassFields(candidates.eve),
      };
      for (const [field, id] of Object.entries(entry)) {
        const m = /^(CELEBRATION_)?([A-Z]+)_ref$/.exec(field);
        if (!m) continue;                       // `_texto` is filled by whoever wins the `_ref`
        const role = m[2];
        if (!MASS_ROLES[role]) continue;        // ALTERNATIVE_/SHORT_/COMMENT: cpl-app has none
        const want = citeKey(esTable('lecturas_referencia')[String(id)]);
        if (!want) continue;                    // no citation in the cell: nothing to match on
        let picked = null;
        for (const source of ['rendered', 'ferial', 'eve']) {
          const fields = flat[source];
          if (!fields || !fields[`${role}_ref`]) continue;
          if (citeKey(fields[`${role}_ref`]) !== want) continue;
          picked = { source, fields };
          break;
        }
        if (!picked) { massStats.unmatched++; continue; }
        observe('lecturas_referencia', id, picked.fields[`${role}_ref`], tag);
        const textId = entry[`${m[1] || ''}${role}_texto`];
        const body = picked.fields[`${role}_texto`];
        if (textId !== undefined && body) observe('lecturas_texto', textId, body, tag);
        massStats.cells++;
        massStats.byCandidate[picked.source]++;
      }
      // The verse before the Gospel is the one role with no citation of its own in the cell
      // (`es` keeps the REFRAIN there — "Aleluya, aleluya, aleluya" — which is not data in
      // cpl-app at all, see PLAN §18.3), so it can't be matched and is filed from whichever
      // Mass supplied the Gospel of the same column.
      for (const prefix of ['', 'CELEBRATION_']) {
        const textId = entry[`${prefix}ACCLAMATION_texto`];
        if (textId === undefined) continue;
        const gospelRef = entry[`${prefix}GOSPEL_ref`];
        const want = citeKey(esTable('lecturas_referencia')[String(gospelRef)]);
        if (!want) continue;
        for (const source of ['rendered', 'ferial', 'eve']) {
          const fields = flat[source];
          if (!fields || !fields.GOSPEL_ref || citeKey(fields.GOSPEL_ref) !== want) continue;
          if (fields.ACCLAMATION_texto) {
            observe('lecturas_texto', textId, fields.ACCLAMATION_texto, tag);
            massStats.cells++;
          }
          break;
        }
      }
    }

    // The Office of Readings, filed straight from the flattener. Every other Hour needs
    // `observeHour`'s hand-written pairing because its fields come off three different
    // shapes of cpl-app model; the Office's come off one, and its index entry uses the very
    // same names, so the loop is the mapping. Fields the flattener doesn't produce (the
    // `_i`/`_p` biennial twins, `himno_latino`) are simply never reached.
    function observeOffice(entry, office, tag) {
      const fields = extractOfficeFields(office);
      if (!fields) return;
      for (const [field, value] of Object.entries(fields)) {
        const table = FIELD_TABLE[field];
        const id = entry[field];
        if (!table || id === undefined || id === null) continue;
        if (Array.isArray(value)) {
          if (!Array.isArray(id)) continue;
          value.forEach((v, i) => observe(table, id[i], v, tag));
        } else {
          observe(table, id, value, tag);
        }
      }
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

    const dates = Object.keys(manifest).sort()
      .filter((d) => !ONLY_DATES.length || ONLY_DATES.includes(d));
    let processed = 0;
    const skippedOutOfRange = [];
    const failedDates = [];
    let skippedVespersFromTomorrow = 0;
    let observedFirstVespers = 0;
    // Yesterday's rendered Mass, kept across the loop so `observeMass` can offer it as a
    // candidate. `dates` is sorted, and it is only ever accepted when its citation matches the
    // cell — which in practice happens on Easter Sunday alone, whose plain roles hold the
    // Vigil that cpl-app resolves on Holy Saturday. `eveDate` guards against the previous
    // ITERATION being some other day, which it is whenever a date was skipped.
    let eveMassHeld = null;
    let eveDate = null;

    // On the eve of a solemnity — and every Saturday evening — cpl-app prays the following
    // day's First Vespers. Whether saints-app does too is not a matter of opinion: since
    // PR #1694 the index says so itself, in `<field>_PrimerasVisperas` fields carried by
    // the celebration's own entry (74 of them: every Sunday plus the major solemnities).
    // The probe then measures which cells the app really reads that evening, and the two
    // agree exactly, so the test is an identity rather than a guess:
    //
    //     measured hymn === tomorrow's `himno_PrimerasVisperas`  ->  the app is showing
    //     tomorrow's First Vespers, and cpl-app's text belongs in those cells.
    //
    // F5 read the index BEFORE that refactor and concluded saints-app has no First Vespers
    // slot at all; the join skipped every such evening on that basis. It has one now, and
    // skipping is what caused MIGRA-006: it threw away nine of the ten observations of
    // `salmos_antifonas/9998` (= the Sacred Heart's `primer_salmo_antifona_PrimerasVisperas`)
    // and left the tenth alone in the cell — the 2022 eve, where cpl-app prays the Nativity
    // of the Baptist, transferred off the Sacred Heart's day. With one observation "every
    // observation agrees" was true by vacuum, and the join wrote the Baptist's antiphon
    // into the Sacred Heart's cell.
    //
    // The skip still stands wherever the identity fails: there the app shows its own
    // evening office, the only cell available is today's, and filing tomorrow's text there
    // is F6. Unproven means skip, which is the direction that cannot corrupt a shared cell.
    const tomorrowKeyCache = new Map();
    function appShowsTomorrowsVespers(dateStr, probed) {
      if (!probed || probed.__noEntry) return false;
      const measured = probed.himno;
      if (typeof measured !== 'string' || !measured.includes('/')) return false;
      if (!tomorrowKeyCache.has(dateStr)) {
        const d = new Date(`${dateStr}T12:00:00`);
        d.setDate(d.getDate() + 1);
        tomorrowKeyCache.set(dateStr, manifest[d.toISOString().slice(0, 10)]);
      }
      const tomorrow = tomorrowKeyCache.get(dateStr);
      if (!tomorrow || !tomorrow.litcalId) return false;
      const entry = allXByHour.Vespers[keysByPrefixByHour.Vespers.get(tomorrow.litcalId)];
      const firstVespersHymn = entry && entry.himno_PrimerasVisperas;
      if (firstVespersHymn === undefined || firstVespersHymn === null || firstVespersHymn === -1) {
        return false;
      }
      return String(firstVespersHymn) === measured.split('/')[1];
    }

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

      // Does at least one configured hour have somewhere to file this date? If none do,
      // skip resolving cpl-app for it entirely (saves time).
      //
      // The index is not the only answer: a date whose litcalId has no entry there can
      // still have a MEASURED cell, and then the app is reading something and the index is
      // simply not what it reads. Gating on the index alone dropped those dates silently —
      // 20 in the ten-year window, 10 of them Holy Thursday (§8d: the manifest resolves
      // `thursday_of_the_lords_supper`, the app `holy_thursday`), plus the eves of the
      // Sacred Heart that fall on a Catalan celebration the index does not carry. Same
      // principle as §8d: ask the app, do not deduce from the index.
      const measuredHours = (cellMap[dateStr] && cellMap[dateStr].hours) || {};
      const applicableHours = HOURS_TO_RUN.filter(
        (h) =>
          keysByPrefixByHour[h].get(litcalId) ||
          (!HOURS_CONFIG[h].observe && measuredHours[h] && !measuredHours[h].__noEntry),
      );
      if (!applicableHours.length) continue;

      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      let hoursLiturgy;
      let ferialHours;
      let dayInfo;
      let dayMass;
      try {
        ({ hoursLiturgy, ferial: ferialHours, ldi: dayInfo, mass: dayMass } = await resolveHoursLiturgy(date, settings));
      } catch (e) {
        // A single day cpl-app can't resolve must not throw away a 10-year run: record
        // it and carry on, so the failures are visible as data instead of a stack trace.
        failedDates.push({ date: dateStr, error: String(e && e.message ? e.message : e) });
        continue;
      }
      processed++;
      // Built at midday so the UTC conversion can't slide the date back an hour and name the
      // wrong day, which is what a bare `new Date(dateStr)` does west of Greenwich.
      const yesterday = new Date(`${dateStr}T12:00:00`);
      yesterday.setDate(yesterday.getDate() - 1);
      const eveMass = eveDate === yesterday.toISOString().slice(0, 10) ? eveMassHeld : null;
      eveMassHeld = dayMass && dayMass.rendered;
      eveDate = dateStr;
      const vespersFromTomorrow = vespersComeFromTomorrow(hoursLiturgy);

      for (const hour of applicableHours) {
        const key = keysByPrefixByHour[hour].get(litcalId);
        const hourData = hour === 'Mass'
          ? dayMass
          : HOURS_CONFIG[hour].dataKey
            ? hoursLiturgy[HOURS_CONFIG[hour].dataKey]
            : hourDataOf(hoursLiturgy, hour);
        const observeFn = HOURS_CONFIG[hour].observe;

        // Measured cells win over the index whenever the probe covered this day/hour.
        // The Invitatory and the celebration name are not probed (they live in other
        // stores), so they keep using the index.
        let entry;
        let fromFerial = null;
        let memorialEntry = null;
        const probed = !HOURS_CONFIG[hour].observe && cellMap[dateStr] && cellMap[dateStr].hours
          ? cellMap[dateStr].hours[hour]
          : null;
        if (hour === 'Vespers' && vespersFromTomorrow) {
          if (!appShowsTomorrowsVespers(dateStr, probed)) {
            // These are D+1's First Vespers (OGLH 61 pre-empts D's own/ferial office), not
            // D's, and the app is NOT showing them: it shows D's own evening office. The
            // only cell available is therefore D's, and filing tomorrow's text there is
            // exactly F6 — it hands D's shared cell a text from an unrelated celebration,
            // which then reads as a "conflict" against every other date that legitimately
            // shares it. Left unobserved rather than attributed to the wrong id.
            skippedVespersFromTomorrow++;
            continue;
          }
          observedFirstVespers++;
        }
        if (probed && probed.__noEntry) {
          // The app shows nothing here (no entry in the shared index): observing anything
          // would attribute cpl-app's text to a cell nobody reads.
          cellMapUse.noEntry++;
          continue;
        } else if (probed) {
          const dualOffice = HOURS_CONFIG[hour].dualOffice !== false;
          if (dualOffice) {
            fromFerial = memorialFerial.ferialFields(extractHourFields(hourData), extractHourFields(ferialHours[hour]));
          }
          const options = dualOffice ? { allXKey: key, fromFerial } : {};
          entry = entryFromCells(probed, options);
          // Only where the app really shows the two tabs: elsewhere index 1 is the cell of
          // the weekday this day displaced, which is not this day's content at all.
          if (dualOffice && memorialFerial.hasSwitch(key)) memorialEntry = entryFromCells(probed, options, 1);
          cellMapUse.fromMap++;
        } else {
          const raw = allXByHour[hour][key];
          entry = HOURS_CONFIG[hour].fromIndex ? HOURS_CONFIG[hour].fromIndex(raw) : raw;
          cellMapUse.fromIndex++;
        }

        if (!entry || !hourData) continue;
        if (observeFn) observeFn(entry, hourData, `${dateStr} (${hour})`, observe, key);
        else {
          const dayForCommon = {
            title: hoursLiturgy.TodayCelebrationInformation && hoursLiturgy.TodayCelebrationInformation.Title,
            suffix: commonOffice.seasonSuffix(dayInfo && dayInfo.Today && dayInfo.Today.SpecificLiturgyTime),
          };
          if (HOURS_CONFIG[hour].dualOffice === false) {
            // No second office and no Common to weigh against it: what cpl-app renders is
            // what the app's single record shows, cell for cell.
            if (hour === 'Office') observeOffice(entry, hourData, `${dateStr} (${hour})`);
            else if (hour === 'Mass') {
              observeMass(entry, { ...hourData, eve: eveMass }, `${dateStr} (${hour})`);
            } else observeHour(entry, hourData, `${dateStr} (${hour})`);
          } else if (memorialFerial.isProperOnly(key)) {
            // No second tab: the memorial's cell IS the only cell, so cpl-app's weekday text
            // and the Common are two answers for one slot rather than one each. The Common
            // goes first because what it takes decides what cpl-app must not fill — leaving
            // both in would put the weekday's reading in a cell the Common owns, which is
            // what kept `lectura_breve_citas/66` conflicted (MIGRA-004).
            const taken = observeCommonHour(entry, entry, hour, fromFerial,
              `${dateStr} (${hour}, Comú)`, dayForCommon, { properOnly: true });
            let mine = entry;
            if (taken.size) {
              mine = { ...entry };
              for (const field of taken) delete mine[field];
            }
            observeHour(mine, hourData, `${dateStr} (${hour})`);
          } else {
            observeHour(entry, hourData, `${dateStr} (${hour})`);
            if (memorialEntry) {
              observeCommonHour(memorialEntry, entry, hour, fromFerial, `${dateStr} (${hour}, Comú)`, dayForCommon);
            }
          }
        }
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
    if (massStats.cells || massStats.unmatched) {
      console.log(
        `Missa: ${massStats.cells} caselles observades ` +
          `(${massStats.byCandidate.rendered} de la missa del dia, ${massStats.byCandidate.ferial} de la ` +
          `ferial, ${massStats.byCandidate.eve} de la Vigília Pasqual) · ${massStats.unmatched} caselles ` +
          `sense cap lectura de cpl-app amb la mateixa cita.`
      );
    }
    if (skippedVespersFromTomorrow || observedFirstVespers) {
      console.log(
        `I Vespres de l'endemà: ${observedFirstVespers} observades a la casella que l'app hi ` +
          `llegeix de veritat, ${skippedVespersFromTomorrow} no observades perquè l'app hi ` +
          `mostra el seu propi ofici (F5/F6).`
      );
    }
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
      path.join(OUTPUT_ROOT, 'join-skipped-dates.json'),
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
    commonsDb.close();
    console.log(
      `Comú dels sants: ${commonStats.cells} caselles observades en ${commonStats.days} hores de memòria ` +
        `(la pestanya del sant, que cpl-app no omple mai).`
    );
    fs.writeFileSync(
      path.join(OUTPUT_ROOT, 'join-common-sourced.json'),
      JSON.stringify(Object.fromEntries(Object.entries(commonSourced).map(([t, ids]) => [t, [...ids].sort()])), null, 2),
      'utf8'
    );
    if (commonStats.sameAsFerial) {
      console.log(
        `  no escrites perquè en castellà la pestanya del sant hi diu el mateix que la ferial: ${commonStats.sameAsFerial}`
      );
    }
    if (commonStats.noCommon.size) {
      const worst = [...commonStats.noCommon.entries()].sort((a, b) => b[1] - a[1]);
      console.log(
        `  sense Comú inferit: ${worst.length} celebracions · ` +
          worst.slice(0, 6).map(([t, n]) => `${t} (${n})`).join(' · ')
      );
    }
    for (const table of TABLES) {
      console.log(`  ${table}: ${Object.keys(commons[table]).length} resolved, ${pending[table].length} pending`);
    }
    console.log(`Total: ${totalResolved} resolved, ${totalPending} pending review (see ${PENDING_PATH})`);

    expect(processed).toBeGreaterThan(0);
  }, 300000);
});
