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
const CPL_DB_PATH = require('./lib/cpl-db-path');
const { textKey } = require('./lib/text-key');
const { mergeCitationHeadings } = require('./lib/citation-headings');
const memorialFerial = require('./lib/memorial-ferial');
// The Common of the Saints, the second source: cpl-app never renders it on a memorial, so
// without this the Catalan half of saints-app's memorial tab can never be filled. See
// lib/common-office.js and decisions/D-001-el-comu-a-les-memories.md.
const commonOffice = require('./lib/common-office');
const { fingerprint, readingMatch } = require('./lib/citation-key');
const { alignPreces } = require('./lib/preces-alignment');
// Held cells with an answer that is not a matter of taste: copies of one text, and the psalm
// the Spanish of the cell names (D-012).
const { resolveHeld, psalmScore, lightVariant } = require('./lib/held-resolution');
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
// What lib/held-resolution.js wrote, and what it left for review: the days cpl-app prays another
// psalm than the one the cell is for.
const HELD_RESOLVED_PATH = path.join(OUTPUT_ROOT, 'join-held-resolved.json');
// Held cells Pau has decided one by one: "table/id" -> { take: <date>, because }. Never a rule
// for many cells at once (REGISTRE-DE-CANVIS.md, D-010).
const DECIDED_CELLS = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, 'decided-cells.json'), 'utf8')).cells || {};
  } catch {
    return {};
  }
})();

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
  // lib/cpl-day-resolver.js: they hang off `hoursLiturgy.hours`, their responsory is a
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
      observe('invitatorios', entry.val, hourData.invitationAntiphon, tag),
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
      observe('celebration_names', entry.name, data.title, tag);
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

jest.mock('../src/services/databaseManagerService', () => require('../__tests__/helpers/mockDatabaseManager'));

// cpl-app's own engine, through the one door the migration has (src/liturgy-export). It used to
// be reached from here by hand, with a private copy of the settings, of `isSpecialChristmas` and
// of the whole resolution — the same copy the comparator and the Lauds pilot each had.
const { buildSettings, resolveDay } = require('./lib/cpl-day-resolver');

async function resolveHoursLiturgy(date, settings) {
  const { liturgyDayInformation, hoursLiturgy, ferial, mass } = await resolveDay(date, settings);
  return {
    hoursLiturgy,
    ldi: liturgyDayInformation,
    mass,
    // Keyed by the Hour names of HOURS_CONFIG, which is how the observers below ask for them.
    ferial: {
      Laudes: ferial.laudes,
      Vespers: ferial.vespers,
      Tercia: ferial.tercia,
      Sexta: ferial.sexta,
      Nona: ferial.nona,
    },
  };
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
  const todayPrecedence = hoursLiturgy.todayCelebrationInformation.precedence;
  const tomorrowPrecedence = hoursLiturgy.tomorrowCelebrationInformation.precedence;
  const todaySecond = hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration;
  const tomorrowFirst = hoursLiturgy.vespersOptions.tomorrowFirstVespersWithCelebration;
  if (todayPrecedence === tomorrowPrecedence) {
    return hasLiturgyContent(tomorrowFirst.evangelicalAntiphon) && !hasLiturgyContent(todaySecond.evangelicalAntiphon);
  }
  return tomorrowPrecedence < todayPrecedence;
}

// The prayers blob is parsed in lib/common-office.js — the Common's own blob has the same
// shape, and the two must come apart identically or a Common petition and a rendered one
// would never compare equal.
const { parsePrayers } = commonOffice;

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
  // in the morning (`officeService.isDarkAnthem` — the only `new Date()` in the whole of
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

    // `evidence.psalmScore`: for a psalm text, how the heading cpl-app said it under that day
    // compares with the Spanish heading of the same slot (lib/held-resolution.js).
    function observe(table, id, value, tag, evidence) {
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
      if (evidence && evidence.psalmScore != null) {
        if (!group.psalmScores) group.psalmScores = new Map();
        group.psalmScores.set(evidence.psalmScore, (group.psalmScores.get(evidence.psalmScore) || 0) + 1);
      }
    }

    // The evidence for a psalm text: the heading cpl-app printed over it, against the Spanish of
    // the heading cell the same slot points at. Nothing when the Spanish cell is empty.
    function psalmEvidence(entry, prefix, cplHeading) {
      const es = esTable('salmos_citas')[String(entry[`${prefix}_salmo_cita`])];
      return es == null || cplHeading == null ? null : { psalmScore: psalmScore(cplHeading, es) };
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
    const commonsDb = new DatabaseSync(CPL_DB_PATH, { readOnly: true });
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
      observe('himnos', entry.himno, hourData.anthem, tag);
      // The antiphons come from lib/cpl-day-resolver, not from the psalms directly: on an
      // intermediate Hour of a celebration ONE antiphon covers all three, and the per-psalm
      // ones the model still carries are not what the screen shows.
      const antiphons = psalmAntiphons(hourData);
      const psalms = [
        ['primer', hourData.firstPsalm],
        ['segundo', hourData.secondPsalm],
        ['tercer', hourData.thirdPsalm],
      ];
      psalms.forEach(([prefix, psalm], i) => {
        if (!psalm) return;
        observe('salmos_citas', entry[`${prefix}_salmo_cita`], psalm.title, tag);
        observe('salmos_antifonas', entry[`${prefix}_salmo_antifona`], antiphons[i], tag);
        observe('salmos_textos', entry[`${prefix}_salmo_texto`], psalm.psalm, tag, psalmEvidence(entry, prefix, psalm.title));
      });
      if (hourData.shortReading) {
        observe('lectura_breve_citas', entry.lectura_biblica_cita, hourData.shortReading.quote, tag);
        observe('lectura_breve_textos', entry.lectura_biblica, hourData.shortReading.shortReading, tag);
      }
      // Six lines for Laudes and Vespers, a versicle/response pair for the intermediate
      // Hours — same helper, so the two shapes can't be paired up wrongly here. They are
      // paired by position, which holds only up to the first cell the app shows twice:
      // past it, every line lands in its neighbour's cell. So they are paired up to there,
      // and not at all when the app shows fewer lines than cpl-app has, because then there
      // is no telling where the gap is. With saints-app at dev of 28-9-2026: on 24 July
      // (seven lines, the second cell twice) the first two pair up; on 25 July (five) none
      // do; on 30 November (the Gloria's cell 13 twice, at the end) the first five; and on
      // 12 October the intermediate Hours show four cells for cpl-app's two, the first two.
      const respParts = responsoryParts(hourData);
      const respCells = Array.isArray(entry.responsorios) ? entry.responsorios : null;
      if (respParts && respCells && respCells.length >= respParts.length) {
        const firstRepeat = respCells.findIndex((id, i) => respCells.indexOf(id) !== i);
        const upTo = firstRepeat === -1 ? respCells.length : firstRepeat;
        respCells.slice(0, upTo).forEach((id, i) => observe('responsorios', id, respParts[i], tag));
      }
      observe('cantico_evangelico_antifonas', entry.cantico_evangelico_antifona, hourData.evangelicalAntiphon, tag);
      const prayers = parsePrayers(hourData.prayers);
      if (prayers) {
        observe('preces_intro', entry.preces_intro, prayers.intro, tag);
        observe('preces_respuesta', entry.preces_respuesta, prayers.respuesta, tag);
        if (Array.isArray(entry.preces_contenido)) {
          // By position, except the lists decided one by one (lib/preces-alignment.js).
          const aligned = alignPreces(entry.preces_contenido, prayers.contenido);
          entry.preces_contenido.forEach((id, i) => {
            const item = aligned[i];
            if (item) observe('preces_contenido', id, `${item.peticion}\n${item.cierre}`, tag);
          });
        }
      }
      observe('oraciones_finales', entry.oracion_final, hourData.finalPrayer, tag);
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
    //
    // Book and chapter are not enough to choose (MIGRA-018). The vigil of John the Baptist
    // reads Lc 1, 5-17 and the day Lc 1, 57-66.80; on a memorial without readings of its own,
    // the weekday's Rm 12, 5-16a is the same chapter as the saint's Rm 12, 3-13. Matching on
    // the chapter filed the day into the vigil's cell and the weekday into the saint's, nine
    // readings in all. So the match is graded by the verses (`readingMatch`): verses that do
    // not meet are no match, and a reading of cpl-app goes only to the cell of the day it fits
    // best — the weekday's Rm 12, 5-16a fits the weekday's cell exactly, so it is not also
    // offered to the saint's.
    const massStats = { cells: 0, byCandidate: { rendered: 0, ferial: 0, eve: 0 }, unmatched: 0 };
    function observeMass(entry, candidates, tag) {
      const flat = {
        rendered: extractMassFields(candidates.rendered),
        ferial: extractMassFields(candidates.ferial),
        eve: extractMassFields(candidates.eve),
      };
      const matches = [];
      for (const [field, id] of Object.entries(entry)) {
        const m = /^(CELEBRATION_)?([A-Z]+)_ref$/.exec(field);
        if (!m) continue;                       // `_texto` is filled by whoever wins the `_ref`
        const role = m[2];
        if (!MASS_ROLES[role]) continue;        // ALTERNATIVE_/SHORT_/COMMENT: cpl-app has none
        const want = fingerprint(esTable('lecturas_referencia')[String(id)] || '');
        if (!want) continue;                    // no citation in the cell: nothing to match on
        for (const source of ['rendered', 'ferial', 'eve']) {
          const fields = flat[source];
          if (!fields || !fields[`${role}_ref`]) continue;
          const score = readingMatch(fields[`${role}_ref`], want);
          if (score) matches.push({ field, id, prefix: m[1] || '', role, source, fields, ref: fields[`${role}_ref`], score });
        }
      }
      // Yesterday's Mass counts only where it IS the Mass of the column: two readings or more of
      // it in the same column. That keeps the Easter Vigil and the days after the Epiphany
      // (cpl-app goes by date, saints-app by weekday), and drops a lone psalm that happens to
      // share a chapter — Monday's Sl 95 of week 22, filed into Gregory the Great's cell on
      // Tuesday 3-IX-2019.
      const eveRoles = {};
      for (const x of matches) if (x.source === 'eve') eveRoles[x.prefix] = (eveRoles[x.prefix] || 0) + 1;
      for (let i = matches.length - 1; i >= 0; i--) {
        if (matches[i].source === 'eve' && (eveRoles[matches[i].prefix] || 0) < 2) matches.splice(i, 1);
      }
      const bestFor = new Map();
      for (const x of matches) bestFor.set(x.ref, Math.max(bestFor.get(x.ref) || 0, x.score));
      const pickedFor = {};                     // "<prefix>GOSPEL" -> the Mass that supplied it
      for (const [field, id] of Object.entries(entry)) {
        const m = /^(CELEBRATION_)?([A-Z]+)_ref$/.exec(field);
        if (!m || !MASS_ROLES[m[2]]) continue;
        const own = matches.filter((x) => x.field === field && x.score === bestFor.get(x.ref));
        if (!own.length) {
          if (fingerprint(esTable('lecturas_referencia')[String(id)] || '')) massStats.unmatched++;
          continue;
        }
        // Best score first; between equals, the order of the candidates (rendered, ferial, eve).
        const picked = own.reduce((a, b) => (b.score > a.score ? b : a));
        observe('lecturas_referencia', id, picked.ref, tag);
        const textId = entry[`${picked.prefix}${picked.role}_texto`];
        const body = picked.fields[`${picked.role}_texto`];
        if (textId !== undefined && body) observe('lecturas_texto', textId, body, tag);
        massStats.cells++;
        massStats.byCandidate[picked.source]++;
        pickedFor[`${picked.prefix}${picked.role}`] = picked.fields;
      }
      // The verse before the Gospel is the one role with no citation of its own in the cell
      // (`es` keeps the REFRAIN there — "Aleluya, aleluya, aleluya" — which is not data in
      // cpl-app at all, see PLAN §18.3), so it can't be matched and is filed from the Mass
      // that supplied the Gospel of the same column — and from none if no Mass did.
      for (const prefix of ['', 'CELEBRATION_']) {
        const textId = entry[`${prefix}ACCLAMATION_texto`];
        const fields = pickedFor[`${prefix}GOSPEL`];
        if (textId === undefined || !fields || !fields.ACCLAMATION_texto) continue;
        observe('lecturas_texto', textId, fields.ACCLAMATION_texto, tag);
        massStats.cells++;
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
          const psalmSlot = field.match(/^(primer|segundo|tercer)_salmo_texto$/);
          observe(table, id, value, tag, psalmSlot ? psalmEvidence(entry, psalmSlot[1], fields[`${psalmSlot[1]}_salmo_cita`]) : null);
        }
      }
    }

    // cpl-app.db only holds a fixed span of liturgical years. A manifest date outside it
    // makes cpl-app's own services throw on an empty row (e.g. ObtainPentecostDay reading
    // result[0].mes of nothing), which used to kill the whole run over a single edge day.
    // Skip those days and report them instead.
    const rangeDb = new DatabaseSync(CPL_DB_PATH, { readOnly: true });
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
    // Days where an intermediate Hour's antiphon was left unobserved because the celebration
    // has one and the app reads the weekday's three (see below).
    let antiphonWithheld = 0;

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

        // On a feast or a special day, `terciaStore` (and its Sext/None twins) REPLACE the
        // whole psalmody with the current weekday's — "Partial override for FEAST or SPECIAL:
        // psalms but not short reading nor final prayer" — and in doing so they throw away the
        // celebration's own antiphon, which the index carries for exactly this day
        // (`primer_salmo_antifona: 4811` on the Nativity of the BVM, with `-1` in the other
        // two: ONE antiphon over the three psalms, which is what cpl-app prays too).
        //
        // The psalms themselves agree, so they are observed as always. The antiphon does not:
        // cpl-app has one and the app reads the weekday's three, so cpl-app's has NO CELL OF
        // ITS OWN and filing it under the weekday's is exactly F6 — a celebration's text in a
        // cell 174 ordinary days share, which then conflicts forever and renders as
        // "[ERR-001] Element no trobat" on every one of them. 513 days of the window do this.
        //
        // Unproven means skip, which is the direction that cannot corrupt a shared cell.
        if (entry && ['Tercia', 'Sexta', 'Nona'].includes(hour)) {
          const indexEntry = allXByHour[hour][key];
          // Did the store redirect the psalmody? The index says one cell, the app read
          // another: that is the FEAST/SPECIAL override putting the weekday's psalmody on
          // screen in place of the celebration's.
          const redirected = indexEntry && entry.primer_salmo_antifona !== undefined
            && String(indexEntry.primer_salmo_antifona) !== String(entry.primer_salmo_antifona);
          // And is what cpl-app says there the CELEBRATION's antiphon rather than the
          // weekday's? Asked the way the Hours always ask it: resolve the same day with no
          // celebration and compare (lib/memorial-ferial.js). If they differ, cpl-app's
          // antiphon is proper to the feast, and the cell the app is reading belongs to the
          // weekday — so there is nowhere to put it.
          if (redirected) {
            const renderedFields = extractHourFields(hourData) || {};
            const ferialFieldsHour = extractHourFields(ferialHours[hour]) || {};
            const proper = ['primer', 'segundo', 'tercer'].some((prefix) => {
              const k = `${prefix}_salmo_antifona`;
              return renderedFields[k] && renderedFields[k] !== ferialFieldsHour[k];
            });
            if (proper) {
              entry = { ...entry };
              delete entry.primer_salmo_antifona;
              delete entry.segundo_salmo_antifona;
              delete entry.tercer_salmo_antifona;
              antiphonWithheld++;
            }
          }
        }

        if (!entry || !hourData) continue;
        if (observeFn) observeFn(entry, hourData, `${dateStr} (${hour})`, observe, key);
        else {
          const dayForCommon = {
            title: hoursLiturgy.todayCelebrationInformation && hoursLiturgy.todayCelebrationInformation.title,
            suffix: commonOffice.seasonSuffix(dayInfo && dayInfo.today && dayInfo.today.specificLiturgyTime),
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
    const heldResolved = { light: [], psalm: [] };
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
        // A held cell Pau has decided, one by one (decided-cells.json): the text cpl-app says on
        // the date the decision names. If no observation of that date is left, it stays held.
        const decision = DECIDED_CELLS[`${table}/${id}`];
        const decidedGroup = byValue.size > 1 && decision
          ? [...byValue.values()].find((g) => g.tags.some((t) => t.startsWith(`${decision.take} `)))
          : null;
        const autoGroups = byValue.size > 1 && !decidedGroup
          ? [...byValue.values()].map((g) => ({ group: g, value: representative(g), count: g.tags.length, psalmScores: g.psalmScores }))
          : null;
        const auto = autoGroups
          ? resolveHeld({ table, groups: autoGroups, esCitation: table === 'salmos_citas' ? esTable('salmos_citas')[id] : null })
          : null;
        if (byValue.size === 1) {
          commons[table][id] = representative([...byValue.values()][0]);
        } else if (decidedGroup) {
          commons[table][id] = representative(decidedGroup);
        } else if (auto) {
          const taken = autoGroups[auto.take];
          commons[table][id] = taken.value;
          heldResolved[auto.rule].push({
            cell: `${table}/${id}`,
            ...(table === 'salmos_citas' ? { es: esTable('salmos_citas')[id] } : {}),
            took: { preview: taken.value.slice(0, 120), days: taken.count },
            others: auto.others.map((i) => {
              const g = autoGroups[i];
              const other = { preview: g.value.slice(0, 120), days: g.count };
              // Copies of one text differ in a detail: say which, so a wrong call shows. A psalm
              // cpl-app prays instead is a day to review: say when.
              if (auto.rule === 'light') {
                const diff = lightVariant(taken.value, g.value, table);
                other.changed = diff ? diff.changed.slice(0, 12) : null;
              } else {
                // 0: another psalm. More: the same psalm, spelt or cut differently.
                other.score = table === 'salmos_citas'
                  ? psalmScore(g.value, esTable('salmos_citas')[id])
                  : (g.psalmScores && g.psalmScores.size === 1 ? [...g.psalmScores.keys()][0] : null);
                other.tags = g.group.tags;
              }
              return other;
            }),
          });
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
    fs.writeFileSync(HELD_RESOLVED_PATH, JSON.stringify(heldResolved, null, 1), 'utf8');

    const totalResolved = Object.values(commons).reduce((n, t) => n + Object.keys(t).length, 0);
    const totalPending = Object.values(pending).reduce((n, t) => n + t.length, 0);
    console.log(`Hours: ${HOURS_TO_RUN.join(', ')}. Processed ${processed} dates.`);
    console.log(
      `Caselles: ${cellMapUse.fromMap} hores des del mapa mesurat, ${cellMapUse.fromIndex} des de l'índex, ` +
        `${cellMapUse.noEntry} saltades (l'app no hi mostra res).`
    );
    if (antiphonWithheld) {
      console.log(
        `Hores intermèdies: ${antiphonWithheld} antífones no observades perquè la celebració en ` +
          `té una de sola i l'app llegeix les tres de la fèria (no hi ha casella on posar-la).`
      );
    }
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
    console.log(`Held cells written by D-012: ${heldResolved.light.length} copies of one text, ${heldResolved.psalm.length} psalms the Spanish names (see ${HELD_RESOLVED_PATH})`);

    expect(processed).toBeGreaterThan(0);
  }, 300000);
});
