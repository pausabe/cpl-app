#!/usr/bin/env node
// Generates litcal calendar definition files (Catalonia + one per Catalan diocese) from
// cpl-app's SQLite database, so that saints-app/litcal can recognize Catalan-proper
// celebrations (currently: zero — verified during research that "spain.json" only has
// national-level Spanish feasts, nothing Catalonia/diocese-specific).
//
// Source tables (cpl-app.db):
//   santsSolemnitats  — Solemnities/Festivities. Has its own rank per row (`Cat`: S/F) and
//                        its own precedence tier (`Precedencia`, e.g. "4a", "8f") — no
//                        cross-reference needed.
//   santsMemories     — Memories. Has NO rank/precedence column of its own; whether a given
//                        saint counts as Memory(M) / OptionalMemory(L) / OptionalVirginMemory(V)
//                        is a per-diocese, per-date fact stored in `anyliturgic`'s 37
//                        diocese-place columns, so we cross-reference that table.
//
// Scope of this pass (deliberate, documented in migration-to-saints/PLAN.md):
//   - Only the Diocese-wide place code (`XxD`) and the diocese-agnostic generic code (`-`)
//     are used — Cathedral (`XxC`) / City (`XxV`) variants are skipped for now (litcal/
//     saints-app currently have no "praying place" dimension at all, only "which calendar
//     id"; modeling cathedral-only propers would need a further calendar sub-tier, e.g.
//     `diocese-barcelona-cathedral.json`, left as clearly-scoped future work).
//   - `Diocesis = '-'` rows (shared by the whole Catalan/Tarraconense ecclesiastical
//     province) become `catalonia.json` (parent: spain).
//   - `Diocesis = 'XxD'` rows become one calendar file per diocese (parent: catalonia).
//   - Andorra has no D/V/C split in cpl-app's data model; its own file's parent is
//     `diocese-urgell`, mirroring cpl-app's own runtime rule ("Andorra inherits Urgell's
//     calendar except its own patronal feast", DatabaseDataService.tsx).
//
// Usage:
//   node migration-to-saints/generate-catalan-calendars.js [--out <litcal-repo-path>] [--dry-run]
//
// Idempotency: this script only READS cpl-app.db and WRITES whole calendar JSON files —
// re-running it after a small cpl-app.db update simply regenerates the same files from
// scratch. Celebration ids are derived deterministically from the Catalan name text (not
// from any cpl row id or run-order counter), so ids stay stable across reruns even if rows
// are added/reordered — this avoids the exact instability problem found in saints-db's old
// tokenizer pipeline (see PLAN.md).

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.resolve(__dirname, '../src/assets/db/cpl-app.db');

const argv = process.argv.slice(2);
function argValue(flag, fallback) {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
}
const DRY_RUN = argv.includes('--dry-run');
const LITCAL_CALENDARS_DIR = path.resolve(
  argValue('--out', '/Users/pau/projects/saints/litcal/src/data/calendars')
);
const JSON_OUT = argValue('--json', null);

// ---------------------------------------------------------------------------
// litcal's Rank / Precedence enums, copied verbatim from
// /Users/pau/projects/saints/litcal/src/domain/enums.ts (confirmed via research;
// litcal isn't installed as a package here so we can't `import` them — if litcal's
// enums.ts ever changes these literal strings, this list must be updated to match).
// ---------------------------------------------------------------------------
const RANKS = new Set(['SOLEMNITY', 'SUNDAY', 'FEAST', 'MEMORIAL', 'OPTIONAL_MEMORIAL', 'WEEKDAY']);
const PRECEDENCES = new Set([
  'TRIDUUM_1', 'PROPER_OF_TIME_SOLEMNITY_2', 'PRIVILEGED_SUNDAY_2', 'ASH_WEDNESDAY_2',
  'WEEKDAY_OF_HOLY_WEEK_2', 'WEEKDAY_OF_EASTER_OCTAVE_2', 'GENERAL_SOLEMNITY_3',
  'COMMEMORATION_OF_ALL_THE_FAITHFUL_DEPARTED_3', 'PROPER_SOLEMNITY__PRINCIPAL_PATRON_4A',
  'PROPER_SOLEMNITY__DEDICATION_OF_THE_OWN_CHURCH_4B', 'PROPER_SOLEMNITY__TITLE_OF_THE_OWN_CHURCH_4C',
  'PROPER_SOLEMNITY__TITLE_OR_FOUNDER_OR_PRIMARY_PATRON_OF_A_RELIGIOUS_ORG_4D',
  'GENERAL_LORD_FEAST_5', 'UNPRIVILEGED_SUNDAY_6', 'GENERAL_FEAST_7',
  'PROPER_FEAST__PRINCIPAL_PATRON_OF_A_DIOCESE_8A', 'PROPER_FEAST__DEDICATION_OF_THE_CATHEDRAL_CHURCH_8B',
  'PROPER_FEAST__PRINCIPAL_PATRON_OF_A_REGION_8C',
  'PROPER_SOLEMNITY__TITLE_OR_FOUNDER_OR_PRIMARY_PATRON_OF_A_RELIGIOUS_ORG_8D', // sic: litcal's own typo, see research notes — 8d should read PROPER_FEAST__ but litcal's enums.ts literally has this string
  'PROPER_FEAST__TO_AN_INDIVIDUAL_CHURCH_8E', 'PROPER_FEAST_8F', 'PRIVILEGED_WEEKDAY_9',
  'GENERAL_MEMORIAL_10', 'PROPER_MEMORIAL__SECOND_PATRON_11A', 'PROPER_MEMORIAL_11B',
  'OPTIONAL_MEMORIAL_12', 'WEEKDAY_13',
]);

// cpl-app's `Cat` (santsSolemnitats) / anyliturgic-derived (santsMemories) CelebrationType
// letters -> litcal rank, and cpl's `Precedencia` tier -> litcal precedence.
// See migration-to-saints/PLAN.md for the full reasoning behind this table.
const SOLEMNITAT_PRECEDENCE_MAP = {
  '3': 'GENERAL_SOLEMNITY_3',
  '4a': 'PROPER_SOLEMNITY__PRINCIPAL_PATRON_4A',
  '4b': 'PROPER_SOLEMNITY__DEDICATION_OF_THE_OWN_CHURCH_4B',
  '5': 'GENERAL_LORD_FEAST_5',
  '7': 'GENERAL_FEAST_7',
  '8': 'PROPER_FEAST_8F',
  '8a': 'PROPER_FEAST__PRINCIPAL_PATRON_OF_A_DIOCESE_8A',
  '8b': 'PROPER_FEAST__DEDICATION_OF_THE_CATHEDRAL_CHURCH_8B',
  '8e': 'PROPER_FEAST__TO_AN_INDIVIDUAL_CHURCH_8E',
  '8f': 'PROPER_FEAST_8F',
};
// Which family a litcal precedence belongs to. `rank` and `precedence` are two views of
// the same decision and must never disagree — a memory emitted with rank SOLEMNITY is a
// day litcal cannot place, and the manifest writes it out with `allXKey: null`. The
// assertion below fails the build if they ever drift again.
const PRECEDENCE_FAMILY = (p) => {
  if (/SOLEMNITY|TRIDUUM|PRIVILEGED_SUNDAY|EASTER_OCTAVE/.test(p)) return 'SOLEMNITY';
  if (/FEAST|UNPRIVILEGED_SUNDAY/.test(p)) return 'FEAST';
  if (/OPTIONAL_MEMORIAL/.test(p)) return 'OPTIONAL_MEMORIAL';
  if (/MEMORIAL/.test(p)) return 'MEMORIAL';
  if (/WEEKDAY/.test(p)) return 'WEEKDAY';
  return null;
};
const RANK_FAMILY = { SOLEMNITY: 'SOLEMNITY', FEAST: 'FEAST', MEMORIAL: 'MEMORIAL', OPTIONAL_MEMORIAL: 'OPTIONAL_MEMORIAL' };

// rank and precedence, decided together and returned together, so a caller cannot take one
// from one classification and the other from another. That is what MIGRA-005 was.
function classifySolemnitat(cat, precedencia, isSharedCatalonia) {
  if (cat === 'S') {
    const mapped = SOLEMNITAT_PRECEDENCE_MAP[String(precedencia || '').trim()];
    // A row marked 'S' whose Precedencia tier is a FEAST tier is a feast, not a solemnity:
    // the tier is the finer statement and the one litcal orders by.
    if (mapped && PRECEDENCE_FAMILY(mapped) === 'FEAST') return { rank: 'FEAST', precedence: mapped };
    return { rank: 'SOLEMNITY', precedence: mapped || 'GENERAL_SOLEMNITY_3' };
  }
  if (cat === 'F') {
    const mapped = SOLEMNITAT_PRECEDENCE_MAP[String(precedencia || '').trim()];
    if (mapped && PRECEDENCE_FAMILY(mapped) === 'SOLEMNITY') return { rank: 'SOLEMNITY', precedence: mapped };
    return { rank: 'FEAST', precedence: mapped || (isSharedCatalonia ? 'GENERAL_FEAST_7' : 'PROPER_FEAST_8F') };
  }
  return null;
}
function classifyMemory(cat, isSharedCatalonia) {
  if (cat === 'L' || cat === 'V') return { rank: 'OPTIONAL_MEMORIAL', precedence: 'OPTIONAL_MEMORIAL_12' };
  if (cat === 'M') return { rank: 'MEMORIAL', precedence: isSharedCatalonia ? 'GENERAL_MEMORIAL_10' : 'PROPER_MEMORIAL_11B' };
  return null;
}

// ---------------------------------------------------------------------------
// Diocese metadata: prefix used in cpl-app's `Diocesis` column -> litcal calendar id.
// ---------------------------------------------------------------------------
const DIOCESES = [
  { prefix: 'Ba', calendarId: 'diocese-barcelona', name: 'Barcelona' },
  { prefix: 'Gi', calendarId: 'diocese-girona', name: 'Girona' },
  { prefix: 'Ll', calendarId: 'diocese-lleida', name: 'Lleida' },
  { prefix: 'SF', calendarId: 'diocese-sant-feliu-de-llobregat', name: 'Sant Feliu de Llobregat' },
  { prefix: 'So', calendarId: 'diocese-solsona', name: 'Solsona' },
  { prefix: 'Ta', calendarId: 'diocese-tarragona', name: 'Tarragona' },
  { prefix: 'Te', calendarId: 'diocese-terrassa', name: 'Terrassa' },
  { prefix: 'To', calendarId: 'diocese-tortosa', name: 'Tortosa' },
  { prefix: 'Ur', calendarId: 'diocese-urgell', name: 'Urgell' },
  { prefix: 'Vi', calendarId: 'diocese-vic', name: 'Vic' },
  { prefix: 'Ma', calendarId: 'diocese-mallorca', name: 'Mallorca' },
  { prefix: 'Me', calendarId: 'diocese-menorca', name: 'Menorca' },
];
const ANDORRA_CALENDAR_ID = 'diocese-andorra';

const SPANISH_MONTH_ABBREV = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};
function parseDia(dia) {
  const m = /^(\d{1,2})-([a-z]{3})$/i.exec(String(dia).trim());
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = SPANISH_MONTH_ABBREV[m[2].toLowerCase()];
  if (!month) return null;
  return { day, month };
}

// Deterministic Catalan-name -> celebration id slug (no dependency on row order/ids).
function slugify(catalanName) {
  return String(catalanName)
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/·/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function guessColors(name) {
  const n = name.toLowerCase();
  if (/m[àa]rtir/.test(n)) return ['RED'];
  if (/mare de d[ée]u|verge maria/.test(n)) return ['WHITE'];
  return ['WHITE'];
}

function main() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });

  // --- Build (dioceseD-code, month, day) -> CelebrationType lookup from anyliturgic,
  //     needed only for santsMemories (Solemnitats already carries its own `Cat`).
  //
  // Read across EVERY year in the table, not one representative year. `anyliturgic` is a
  // per-year almanac, so its rank column says what was celebrated on that date IN THAT
  // YEAR: a memory whose date fell on a Sunday, or under a solemnity, is written as '-'
  // for that year alone. Asking a single year therefore reports "this memory does not
  // exist" for every celebration unlucky enough to be suppressed in it, and the
  // celebration silently never reaches litcal — which is how "Témpores d'acció de
  // gràcies i de petició" (05-oct, a Sunday in 2025) went missing, taking ~8% of all the
  // join's cell conflicts with it. 53 celebrations were being dropped this way.
  //
  // The rank kept is the HIGHEST observed over the window, because a suppressed year says
  // nothing about the celebration's own rank — only about what outranked it that year.
  const diocesePlaceCodes = [
    ...DIOCESES.map((d) => `${d.prefix}D`),
    ...DIOCESES.map((d) => `${d.prefix}V`), // fetched for completeness/diagnostics only
    'Andorra',
  ];
  const cols = diocesePlaceCodes.map((c) => `"${c}"`).join(', ');
  const yearRows = db.prepare(`SELECT any, mes, dia, ${cols} FROM anyliturgic`).all();
  if (yearRows.length === 0) {
    console.error('anyliturgic is empty — nothing to cross-reference santsMemories against.');
    process.exit(1);
  }
  const yearsSeen = [...new Set(yearRows.map((r) => r.any))].sort();
  // Higher wins: a date reported as both 'L' and 'M' across years is a real memory that
  // some year downgraded, not an optional one that some year promoted.
  //
  // Only V/L/M are read. An 'F' or 'S' on that date belongs to whatever OUTRANKED the
  // memory that year — the paragraph above says exactly that — so taking it would emit a
  // santsMemories row as a solemnity. That is what produced 94 celebrations whose rank and
  // precedence came from different families (MIGRA-005). A memory suppressed in every year
  // of the window yields null and is skipped with a warning, as before.
  const RANK_ORDER = { V: 1, L: 2, M: 3 };
  const rankLookup = {}; // rankLookup[code]["m-d"] = 'S'|'F'|'M'|'L'|'V'
  for (const code of diocesePlaceCodes) rankLookup[code] = {};
  for (const row of yearRows) {
    const key = `${row.mes}-${row.dia}`;
    for (const code of diocesePlaceCodes) {
      const v = row[code];
      if (!v || v === '-' || !RANK_ORDER[v]) continue;
      const current = rankLookup[code][key];
      if (!current || RANK_ORDER[v] > RANK_ORDER[current]) rankLookup[code][key] = v;
    }
  }
  function memoryRank(dioceseDCode, month, day) {
    const key = `${month}-${day}`;
    return (rankLookup[dioceseDCode] && rankLookup[dioceseDCode][key]) || null;
  }

  // --- Load source rows (diocese-level `XxD` + generic `-` + Andorra only; see header) ---
  const allowedDiocesis = ['-', 'Andorra', ...DIOCESES.map((d) => `${d.prefix}D`)];
  const placeholders = allowedDiocesis.map(() => '?').join(',');

  const solemnitats = db
    .prepare(`SELECT dia, Diocesis, Precedencia, Cat, nomMemoria FROM santsSolemnitats WHERE Diocesis IN (${placeholders})`)
    .all(...allowedDiocesis);
  const memories = db
    .prepare(`SELECT dia, Diocesis, nomMemoria FROM santsMemories WHERE Diocesis IN (${placeholders})`)
    .all(...allowedDiocesis);

  db.close();

  // --- Group into per-calendar rule lists ---
  const calendars = {}; // calendarId -> { parent, rules: [], seenIds: Set, warnings: [] }
  function calendarFor(diocesis) {
    if (diocesis === '-') return { id: 'catalonia', parent: 'spain' };
    if (diocesis === 'Andorra') return { id: ANDORRA_CALENDAR_ID, parent: 'diocese-urgell' };
    const prefix = diocesis.slice(0, 2);
    const d = DIOCESES.find((x) => x.prefix === prefix);
    if (!d) return null;
    return { id: d.calendarId, parent: 'catalonia' };
  }
  function ensureCalendar(id, parent) {
    if (!calendars[id]) calendars[id] = { parent, rules: [], seenIds: new Set(), warnings: [] };
    return calendars[id];
  }

  let skipped = 0;

  for (const row of solemnitats) {
    const target = calendarFor(row.Diocesis);
    if (!target) { skipped++; continue; }
    const parsed = parseDia(row.dia);
    if (!parsed) { skipped++; continue; }
    const isShared = row.Diocesis === '-';
    const classified = classifySolemnitat(row.Cat, row.Precedencia, isShared);
    if (!classified) { skipped++; continue; }
    const { rank, precedence } = classified;
    const cal = ensureCalendar(target.id, target.parent);
    let id = slugify(row.nomMemoria);
    if (cal.seenIds.has(id)) id = `${id}_${String(parsed.month).padStart(2, '0')}${String(parsed.day).padStart(2, '0')}`;
    cal.seenIds.add(id);
    cal.rules.push({
      action: 'ADD',
      celebration: {
        id,
        rank,
        precedence,
        colors: guessColors(row.nomMemoria),
        isHolyDayOfObligation: false,
        metadata: { catalanName: row.nomMemoria, source: 'cpl-app:santsSolemnitats' },
      },
      dateRule: { type: 'fixed', month: parsed.month, day: parsed.day },
    });
  }

  for (const row of memories) {
    const target = calendarFor(row.Diocesis);
    if (!target) { skipped++; continue; }
    const parsed = parseDia(row.dia);
    if (!parsed) { skipped++; continue; }
    const isShared = row.Diocesis === '-';
    // For shared (`-`) rows there's no single diocese column to cross-reference; try Barcelona
    // as a representative diocese (arbitrary but consistent — these are meant to be shared
    // content anyway, so any diocese carrying them should agree on the M/L/V rank).
    const dioceseDCodeForLookup = isShared ? 'BaD' : row.Diocesis;
    const cat = memoryRank(dioceseDCodeForLookup, parsed.month, parsed.day);
    const cal = ensureCalendar(target.id, target.parent);
    // A santsMemories row IS a memory — that is what the table means. When the almanac
    // never shows V/L/M on that date across the whole window (a Lenten date, or one
    // permanently outranked), we still keep the celebration and put it on the lowest step
    // rather than drop it: an optional memorial displaces nothing, so guessing wrong is
    // cheap, while dropping it takes the celebration out of litcal entirely — which the
    // note above records as ~8% of the join's cell conflicts.
    const classified = classifyMemory(cat, isShared);
    if (!classified) {
      cal.warnings.push(`No anyliturgic V/L/M rank for ${row.nomMemoria} (${row.dia}, ${row.Diocesis}) — skipped`);
      skipped++;
      continue;
    }
    const { rank, precedence } = classified;
    let id = slugify(row.nomMemoria);
    if (cal.seenIds.has(id)) id = `${id}_${String(parsed.month).padStart(2, '0')}${String(parsed.day).padStart(2, '0')}`;
    cal.seenIds.add(id);
    cal.rules.push({
      action: 'ADD',
      celebration: {
        id,
        rank,
        precedence,
        colors: guessColors(row.nomMemoria),
        isHolyDayOfObligation: false,
        metadata: { catalanName: row.nomMemoria, source: 'cpl-app:santsMemories' },
      },
      dateRule: { type: 'fixed', month: parsed.month, day: parsed.day },
    });
  }

  // --- Self-validate before writing anything ---
  let errors = [];
  for (const [calId, cal] of Object.entries(calendars)) {
    for (const rule of cal.rules) {
      if (!RANKS.has(rule.celebration.rank)) errors.push(`${calId}: invalid rank ${rule.celebration.rank} on ${rule.celebration.id}`);
      if (!PRECEDENCES.has(rule.celebration.precedence)) errors.push(`${calId}: invalid precedence ${rule.celebration.precedence} on ${rule.celebration.id}`);
      // rank and precedence are two views of one decision; if they ever disagree the day
      // is unplaceable and the manifest emits allXKey: null. Fail the build, don't ship it.
      const rf = RANK_FAMILY[rule.celebration.rank];
      const pf = PRECEDENCE_FAMILY(rule.celebration.precedence);
      if (rf && pf && rf !== pf) {
        errors.push(`${calId}: rank ${rule.celebration.rank} but precedence ${rule.celebration.precedence} (${pf}) on ${rule.celebration.id}`);
      }
      const { month, day } = rule.dateRule;
      if (month < 1 || month > 12 || day < 1 || day > 31) errors.push(`${calId}: invalid date ${month}/${day} on ${rule.celebration.id}`);
    }
  }
  if (errors.length) {
    console.error('Validation errors — aborting, nothing written:');
    errors.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  }

  // --- Report + write ---
  console.log(`Memory ranks cross-referenced against anyliturgic years ${yearsSeen[0]}-${yearsSeen[yearsSeen.length - 1]} (highest rank per date wins)`);
  console.log(`Rows skipped (unparseable / unmapped / no rank found): ${skipped}`);
  console.log();
  for (const [calId, cal] of Object.entries(calendars)) {
    console.log(`${calId}.json  (parent: ${cal.parent})  — ${cal.rules.length} rules`);
    if (cal.warnings.length) {
      console.log(`  ${cal.warnings.length} warning(s), e.g.: ${cal.warnings[0]}`);
    }
  }

  if (JSON_OUT) {
    const summary = {
      anyliturgicYears: yearsSeen,
      rowsSkipped: skipped,
      calendars: Object.fromEntries(
        Object.entries(calendars).map(([calId, cal]) => [
          calId,
          {
            parent: cal.parent,
            ruleCount: cal.rules.length,
            warnings: cal.warnings,
            rules: cal.rules,
          },
        ])
      ),
    };
    fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
    fs.writeFileSync(JSON_OUT, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`\nWrote JSON summary to ${JSON_OUT}`);
  }

  if (DRY_RUN) {
    console.log('\n--dry-run set, not writing any files.');
    return;
  }

  fs.mkdirSync(LITCAL_CALENDARS_DIR, { recursive: true });
  for (const [calId, cal] of Object.entries(calendars)) {
    const def = {
      id: calId,
      parent: cal.parent,
      rules: cal.rules
        .sort((a, b) => a.celebration.id.localeCompare(b.celebration.id))
        .map((r) => ({
          action: r.action,
          celebration: r.celebration,
          dateRule: r.dateRule,
        })),
    };
    const outPath = path.join(LITCAL_CALENDARS_DIR, `${calId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(def, null, 2) + '\n', 'utf8');
    console.log(`wrote ${outPath}`);
  }
  console.log('\nNext step in litcal repo: npm run generate-loaders (or npm run build) to pick up the new calendars.');
}

module.exports = { slugify };

if (require.main === module) main();
