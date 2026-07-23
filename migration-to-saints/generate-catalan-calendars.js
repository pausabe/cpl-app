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
//   node migration-to-saints/generate-catalan-calendars.js [--out <litcal-repo-path>] [--year 2025] [--dry-run]
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

const DB_PATH = path.resolve(__dirname, '../src/Assets/db/cpl-app.db');

const argv = process.argv.slice(2);
function argValue(flag, fallback) {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
}
const DRY_RUN = argv.includes('--dry-run');
const REPRESENTATIVE_YEAR = argValue('--year', '2025');
const LITCAL_CALENDARS_DIR = path.resolve(
  argValue('--out', '/Users/pau/projects/saints/litcal/src/data/calendars')
);

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
function rankForCat(cat) {
  // 'S' Solemnity / 'F' Festivity -> litcal FEAST unless precedence table says SOLEMNITY
  if (cat === 'S') return 'SOLEMNITY';
  if (cat === 'F') return 'FEAST';
  if (cat === 'M') return 'MEMORIAL';
  if (cat === 'L' || cat === 'V') return 'OPTIONAL_MEMORIAL';
  return null;
}
function precedenceForSolemnitat(cat, precedencia, isSharedCatalonia) {
  const mapped = SOLEMNITAT_PRECEDENCE_MAP[String(precedencia || '').trim()];
  if (mapped) return mapped;
  // '-' or unrecognized precedencia: fall back on the coarse S/F rank.
  if (cat === 'S') return 'GENERAL_SOLEMNITY_3';
  return isSharedCatalonia ? 'GENERAL_FEAST_7' : 'PROPER_FEAST_8F';
}
function precedenceForMemory(cat, isSharedCatalonia) {
  if (cat === 'L' || cat === 'V') return 'OPTIONAL_MEMORIAL_12';
  // 'M'
  return isSharedCatalonia ? 'GENERAL_MEMORIAL_10' : 'PROPER_MEMORIAL_11B';
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
  const anyliturgicRows = db
    .prepare(`SELECT mes, dia FROM anyliturgic WHERE any = ? LIMIT 1`)
    .all(REPRESENTATIVE_YEAR);
  if (anyliturgicRows.length === 0) {
    console.error(`No anyliturgic rows found for year ${REPRESENTATIVE_YEAR}; pick a year within 2017-2026.`);
    process.exit(1);
  }
  const diocesePlaceCodes = [
    ...DIOCESES.map((d) => `${d.prefix}D`),
    ...DIOCESES.map((d) => `${d.prefix}V`), // fetched for completeness/diagnostics only
    'Andorra',
  ];
  const rankLookup = {}; // rankLookup[code]["m-d"] = 'S'|'F'|'M'|'L'|'V'|'-'
  const cols = diocesePlaceCodes.map((c) => `"${c}"`).join(', ');
  const yearRows = db.prepare(`SELECT mes, dia, ${cols} FROM anyliturgic WHERE any = ?`).all(REPRESENTATIVE_YEAR);
  for (const code of diocesePlaceCodes) rankLookup[code] = {};
  for (const row of yearRows) {
    const key = `${row.mes}-${row.dia}`;
    for (const code of diocesePlaceCodes) {
      rankLookup[code][key] = row[code];
    }
  }
  function memoryRank(dioceseDCode, month, day) {
    const key = `${month}-${day}`;
    const v = rankLookup[dioceseDCode] && rankLookup[dioceseDCode][key];
    return v && v !== '-' ? v : null;
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
    const rank = rankForCat(row.Cat);
    if (!rank) { skipped++; continue; }
    const isShared = row.Diocesis === '-';
    const precedence = precedenceForSolemnitat(row.Cat, row.Precedencia, isShared);
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
    if (!cat) {
      cal.warnings.push(`No anyliturgic rank found for ${row.nomMemoria} (${row.dia}, ${row.Diocesis}) — skipped`);
      skipped++;
      continue;
    }
    const rank = rankForCat(cat);
    if (!rank) { skipped++; continue; }
    const precedence = precedenceForMemory(cat, isShared);
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
  console.log(`Representative year used for Memory rank lookup: ${REPRESENTATIVE_YEAR}`);
  console.log(`Rows skipped (unparseable / unmapped / no rank found): ${skipped}`);
  console.log();
  for (const [calId, cal] of Object.entries(calendars)) {
    console.log(`${calId}.json  (parent: ${cal.parent})  — ${cal.rules.length} rules`);
    if (cal.warnings.length) {
      console.log(`  ${cal.warnings.length} warning(s), e.g.: ${cal.warnings[0]}`);
    }
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

main();
