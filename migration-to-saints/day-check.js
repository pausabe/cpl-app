// Answers, for one real date: "is this day fully Catalan in the app, and if not, what
// exactly is missing and do we already know why?"
//
// The global percentage tells you how the migration is doing; it can't tell you whether
// the day you're looking at in the app is supposed to be complete. This walks the same
// path the app walks — date -> litcal id -> index key -> numeric ids per field -> the
// commons/ca file the app actually reads — and labels every field with one of:
//
//   ok        the app will show Catalan text here
//   conflict  deliberately left out: dates sharing this id disagree (with the cause,
//             from the review queue, and the decision if one was recorded)
//   missing   no Catalan text and no recorded conflict — the join never observed a
//             value for it (cpl-app gave nothing, or no date in the window used it)
//
// So a day is "100% ok" only if every field of every configured Hour resolves to text
// that exists in saints-app's commons/ca.

const fs = require('fs');
const path = require('path');
const { classify } = require('./review-queue');
const { explainDate } = require('./missing-celebrations');
const memorialFerial = require('./lib/memorial-ferial');

const MIGRATION_DIR = __dirname;
const MANIFEST_PATH = path.join(MIGRATION_DIR, 'webui/run/date-to-key-manifest.json');
const CELL_MAP_PATH = path.join(MIGRATION_DIR, 'output/app-cell-map.json');
const PENDING_PATH = path.join(MIGRATION_DIR, 'output/join-pending-review.json');
const LOCAL_COMMONS_DIR = path.join(MIGRATION_DIR, 'output/commons-ca');
const DECISIONS_PATH = path.join(MIGRATION_DIR, 'review-decisions.json');
const CELEBRATIONS_PATH = path.join(MIGRATION_DIR, 'output/missing-celebrations.json');
const LAST_RUN_PATH = path.join(MIGRATION_DIR, 'webui/run/last-run.json');
const DAY_TEXTS_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts';
const APP_COMMONS_DIR = path.join(DAY_TEXTS_DIR, 'commons/ca');

const HOUR_FILES = {
  Laudes: 'all_laudes.json',
  Vespers: 'all_visperas.json',
  Tercia: 'all_tercia.json',
  Sexta: 'all_sexta.json',
  Nona: 'all_nona.json',
};
// The order they are prayed in, which is the order the report reads best in.
const ALL_HOURS = ['Laudes', 'Tercia', 'Sexta', 'Nona', 'Vespers'];

// Every field of an index entry, in reading order, with the commons table it points at.
// `list: true` means the field holds an array of ids (one per responsory part /
// intercession). `source` flags the two that never come from cpl-app.
const FIELDS = [
  { key: 'himno', table: 'himnos', label: 'Himne' },
  { key: 'himno_latino', table: 'himnos_latinos', label: 'Himne llatí', source: 'copiat d’es' },
  { key: 'primer_salmo_cita', table: 'salmos_citas', label: '1r salm — cita' },
  { key: 'primer_salmo_antifona', table: 'salmos_antifonas', label: '1r salm — antífona' },
  { key: 'primer_salmo_texto', table: 'salmos_textos', label: '1r salm — text' },
  { key: 'segundo_salmo_cita', table: 'salmos_citas', label: '2n salm — cita' },
  { key: 'segundo_salmo_antifona', table: 'salmos_antifonas', label: '2n salm — antífona' },
  { key: 'segundo_salmo_texto', table: 'salmos_textos', label: '2n salm — text' },
  { key: 'tercer_salmo_cita', table: 'salmos_citas', label: '3r salm — cita' },
  { key: 'tercer_salmo_antifona', table: 'salmos_antifonas', label: '3r salm — antífona' },
  { key: 'tercer_salmo_texto', table: 'salmos_textos', label: '3r salm — text' },
  { key: 'lectura_biblica_cita', table: 'lectura_breve_citas', label: 'Lectura breu — cita' },
  { key: 'lectura_biblica', table: 'lectura_breve_textos', label: 'Lectura breu — text' },
  { key: 'responsorios', table: 'responsorios', label: 'Responsori breu', list: true },
  { key: 'cantico_evangelico_antifona', table: 'cantico_evangelico_antifonas', label: 'Càntic evangèlic — antífona' },
  { key: 'preces_intro', table: 'preces_intro', label: 'Precs — introducció' },
  { key: 'preces_respuesta', table: 'preces_respuesta', label: 'Precs — resposta' },
  { key: 'preces_contenido', table: 'preces_contenido', label: 'Precs — peticions', list: true },
  { key: 'invitacion_padrenuestro', table: 'invitacion_padrenuestro', label: 'Invitació al Parenostre', source: 'traduït a mà' },
  { key: 'oracion_final', table: 'oraciones_finales', label: 'Oració final' },
];

// A probe cell is "table/id", or a list of them for list fields; the index gives the ids
// alone. Both end up as {table, id} pairs here.
function toCells(cell) {
  if (cell === undefined || cell === null) return [];
  return (Array.isArray(cell) ? cell : [cell]).map((c) => {
    const [table, id] = String(c).split('/');
    return { table, id };
  });
}

// `-1` is the entry saying "no proper text here" (it renders as "not applicable"), so it
// is not a cell anyone can migrate.
function validCells(list) {
  return list.filter((c) => c.id !== undefined && c.id !== null && c.id !== '-1' && c.id !== 'undefined');
}

const cellsKey = (list) => list.map((c) => `${c.table}/${c.id}`).join(',');

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

// The pending report is ~7 MB and gets re-read on every conflict drill-down (one click =
// one id). Keyed by mtime so a fresh migration run invalidates it by itself.
let pendingCache = { mtime: null, data: null };
function readPending() {
  let mtime = null;
  try {
    mtime = fs.statSync(PENDING_PATH).mtimeMs;
  } catch {
    return {};
  }
  if (pendingCache.mtime !== mtime) pendingCache = { mtime, data: readJsonSafe(PENDING_PATH, {}) };
  return pendingCache.data;
}

function loadTables(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.json')) out[f.replace(/\.json$/, '')] = readJsonSafe(path.join(dir, f), {});
  }
  return out;
}

// id -> { cause, decision, variants } for every contested id, so a failing field can say
// WHY — and show which texts were competing, which is usually the fastest way to tell an
// "obviously the same thing twice" from a real disagreement.
function buildConflictIndex(manifest) {
  const pending = readPending();
  const decisions = (readJsonSafe(DECISIONS_PATH, { decisions: {} }) || {}).decisions || {};
  const keyOf = (d) => (manifest[d] ? manifest[d].allXKey : null);
  const index = {};
  for (const [table, list] of Object.entries(pending)) {
    for (const item of list) {
      const dates = [...new Set(item.variants.flatMap((v) => v.tags.map((t) => t.split(' ')[0])))];
      const litcalKeys = [...new Set(dates.map(keyOf).filter(Boolean))].sort();
      const cls = litcalKeys.length ? classify(litcalKeys) : { id: 'unknown', label: 'Sense classificar' };
      const stored = decisions[cls.id];
      index[`${table}/${item.id}`] = {
        bundleId: cls.id,
        cause: cls.label,
        variantCount: item.variants.length,
        affectedCount: item.affectedCount,
        decision: stored ? stored.choice : 'pending',
        // Most-used text first: the summary row calls variants[0] "the most common one".
        variants: item.variants
          .slice()
          .sort((a, b) => b.tags.length - a.tags.length)
          .slice(0, 6)
          .map((v) => ({
            preview: v.preview,
            truncated: !!v.truncated,
            count: v.tags.length,
          })),
      };
    }
  }
  return index;
}

// Everything a day check needs that doesn't depend on the date. Built once and reused,
// so scanning a whole month doesn't re-parse the pending report (megabytes) 31 times.
// `language` picks which commons/<lang> tree the app-side answer is read from. Only `ca`
// is a migration target: for es/it the tables are already complete, so there is no local
// output to consult and no conflict to explain — the question there is just "what does the
// app print", which is what the comparator uses it for.
function buildContext({ hours = ALL_HOURS, language = 'ca' } = {}) {
  const manifest = readJsonSafe(MANIFEST_PATH, {});
  const isTargetLanguage = language === 'ca';
  const allXByHour = {};
  for (const hour of hours) {
    if (HOUR_FILES[hour]) allXByHour[hour] = readJsonSafe(path.join(DAY_TEXTS_DIR, HOUR_FILES[hour]), {});
  }
  // Why the contested days are contested, when missing-celebrations.js has been run:
  // "this day is different because cpl-app celebrates X and litcal doesn't know it".
  // Optional — the inspector works without it, it just can't name the cause.
  const celebrations = readJsonSafe(CELEBRATIONS_PATH, null);
  const celebrationGroups = new Map();
  if (celebrations && Array.isArray(celebrations.groups)) {
    for (const g of celebrations.groups) celebrationGroups.set(g.key, g);
  }
  return {
    hours,
    language,
    manifest,
    allXByHour,
    // Which cell the app really reads per field, measured by running saints-app itself
    // (app-id-probe.js). The index is only the fallback for days the probe never covered.
    cellMap: (readJsonSafe(CELL_MAP_PATH, null) || {}).days || {},
    appTables: loadTables(path.join(DAY_TEXTS_DIR, 'commons', language)),
    localTables: isTargetLanguage ? loadTables(LOCAL_COMMONS_DIR) : {},
    conflicts: isTargetLanguage ? buildConflictIndex(manifest) : {},
    lastRun: readJsonSafe(LAST_RUN_PATH, null),
    celebrations,
    celebrationGroups,
  };
}

// One cell, answered from the trees the context loaded: does the app have this text, is it
// only calculated so far, is it withheld by a conflict, or was it never seen at all — and
// the text itself, which is what the day is actually read from.
function describeCell(ctx, table, id) {
  if (!table || id === undefined || id === null) return null;
  const sid = String(id);
  const inApp = ctx.appTables[table] && Object.prototype.hasOwnProperty.call(ctx.appTables[table], sid);
  const inLocal = ctx.localTables[table] && Object.prototype.hasOwnProperty.call(ctx.localTables[table], sid);
  const conflict = ctx.conflicts[`${table}/${sid}`];

  const status = inApp ? 'ok' : inLocal ? 'notInAppYet' : conflict ? 'conflict' : 'missing';
  const stored = inApp ? ctx.appTables[table][sid] : inLocal ? ctx.localTables[table][sid] : null;
  return {
    table,
    id: sid,
    status,
    value: stored == null ? null : typeof stored === 'string' ? stored : JSON.stringify(stored),
    conflict: conflict || null,
  };
}

// For one contested cell: which celebrations the dates that disagree belong to. This is
// what turns "7 variants, 72 days" into "the odd ones out are all Témpores d'acció de
// gràcies, which litcal doesn't have".
function blameFor(ctx, table, id) {
  if (!ctx.celebrations || !ctx.celebrations.cellBlame) return null;
  const keys = ctx.celebrations.cellBlame[`${table}/${id}`];
  if (!keys || !keys.length) return null;
  const out = [];
  for (const key of keys) {
    const g = ctx.celebrationGroups.get(key);
    // Ferial buckets carry no explanation worth showing — the point of the blame line is
    // to name a celebration, and "this weekday disagrees with itself" is already what the
    // conflict's own cause says.
    if (!g || g.verdict === 'ferial-drift') continue;
    out.push({
      title: g.title,
      verdict: g.verdict,
      verdictLabel: g.verdictLabel,
      ranks: g.ranks,
      suggestedId: g.suggestedId,
      inLitcal: g.inLitcal,
      // True when this celebration is the ONLY thing contesting the cell: sorting it out
      // makes the cell resolvable on its own.
      sole: keys.length === 1,
    });
  }
  return out.length ? out : null;
}

// The one number that makes a conflict actionable from the summary row: how many of the
// days sharing this cell would be wrong if it were filled with what THIS day wants.
// Cheap (a scan of one id's tags), so it is computed per inspected day rather than cached
// in the conflict index, which is shared with the month scan and must stay small.
function impactFor(table, id, date) {
  const item = (readPending()[table] || []).find((x) => String(x.id) === String(id));
  if (!item) return null;
  const mine = item.variants.find((v) => v.tags.some((t) => t.startsWith(date)));
  const reference = mine || item.variants.reduce((a, b) => (b.tags.length > a.tags.length ? b : a));
  const agreeDays = reference.tags.length;
  return {
    days: item.affectedCount,
    agreeDays,
    breakDays: item.affectedCount - agreeDays,
    dateNotObserved: !mine,
  };
}

function checkDay(dateStr, options = {}) {
  const ctx = options.ctx || buildContext(options);
  const { manifest, appTables, localTables, conflicts, lastRun } = ctx;
  const hours = ctx.hours;
  // The manifest resolves dates for the one calendar the migration was run with. A caller
  // asking about another calendar (the comparator's saints-app selector) resolves the day
  // itself and passes the id in; everything downstream is calendar-agnostic.
  const entryForDate = options.litcalId
    ? { litcalId: options.litcalId, allXKey: null }
    : manifest[dateStr];

  if (!entryForDate) {
    return {
      date: dateStr,
      lastRun,
      error: `El manifest actual no cobreix ${dateStr}. Torna a córrer el migrador amb un rang que l'inclogui.`,
    };
  }

  const result = {
    date: dateStr,
    litcalId: entryForDate.litcalId,
    allXKey: entryForDate.allXKey,
    lastRun,
    // What cpl-app celebrates today vs what litcal thinks the day is — the first thing
    // to read when a day fails and you can't see why.
    celebration: ctx.celebrations ? explainDate(dateStr, ctx.celebrations) : null,
    hours: [],
    totals: { ok: 0, conflict: 0, missing: 0, notInAppYet: 0 },
  };

  for (const hour of hours) {
    const allX = ctx.allXByHour[hour] || {};
    // Same lookup the app does: first key starting with `${litcalId}__`.
    const key = Object.keys(allX).find((k) => k.startsWith(`${entryForDate.litcalId}__`));
    // The measured cells for this day, when the probe covered it. They beat the index,
    // which is only right for days without store overrides (see PLAN 8c/8d).
    //
    // The probe ran the app under ONE calendar, so its cells belong to the celebration it
    // resolved that date to. Asking about a calendar that celebrates something else that
    // day makes the measurement someone else's — then the index is the only honest source.
    const dayMap = ctx.cellMap[dateStr] || {};
    const mapIsForThisDay = !dayMap.litcalId || dayMap.litcalId === entryForDate.litcalId;
    const probed = mapIsForThisDay && dayMap.hours ? dayMap.hours[hour] : null;
    const measured = probed && !probed.__noEntry ? probed : null;

    // Which fields cpl-app took from the weekday on this date, so a day with the
    // memorial/ferial switch is read in the tab cpl-app actually prays (see
    // lib/memorial-ferial.js). Only the comparator knows this — it has resolved cpl-app —
    // so the inspector called on its own redirects nothing, which is the old behaviour and
    // always the safe direction.
    const ferialForHour = new Set(((options.fromFerial || {})[hour]) || []);

    if (!key || (probed && probed.__noEntry)) {
      result.hours.push({
        hour,
        key: null,
        note: `Cap entrada a ${HOUR_FILES[hour]} per a "${entryForDate.litcalId}" — aquest dia no existeix a l'índex compartit amb es/it.`,
        fields: [],
      });
      continue;
    }

    const entry = allX[key];
    const fields = [];
    const hourTotals = { ok: 0, conflict: 0, missing: 0, notInAppYet: 0 };
    // Fields whose cell is `-1` and that have no ferial cell either: nothing is shown and
    // nothing is missing. Kept apart so the comparator doesn't paint them as a hole.
    const noProperText = [];
    for (const def of FIELDS) {
      // From the probe: "table/id" (or a list of them). From the index: a bare id, with
      // the table fixed by the field.
      let cells;
      let fromFerial = false;
      let altMode = null;
      if (measured) {
        // On a day with the memorial/ferial switch, the office cpl-app renders is the
        // ferial one, so that is the cell to read — see lib/memorial-ferial.js for why,
        // and for the two fields that stay on the memorial cell.
        const [ownCell, otherCell] = memorialFerial.cellPair(measured, def.key, {
          fromFerial: ferialForHour,
          allXKey: key,
        });
        let chosen = validCells(toCells(ownCell));
        let other = validCells(toCells(otherCell));
        fromFerial = otherCell != null && ferialForHour.has(def.key);
        // A `-1` in the chosen entry is a pointer, not a blank: the app falls back to the
        // other tab's cell rather than showing nothing. Kept for the two fields that read
        // the memorial first, where the memorial may have no text of its own.
        if (!chosen.length && other.length) {
          [chosen, other] = [other, chosen];
          fromFerial = !fromFerial;
        }
        cells = chosen;
        // Same field in the other tab, when the page offers both: not what this comparison
        // is about, but one tap away on screen.
        if (other.length && cellsKey(other) !== cellsKey(chosen)) altMode = other;
        if (measured[def.key] == null && !cells.length) continue;
        if (!cells.length) noProperText.push(def.key);
      } else {
        const raw = entry[def.key];
        if (raw === undefined || raw === null) continue;
        const ids = def.list ? (Array.isArray(raw) ? raw : []) : [raw];
        cells = validCells(ids.map((id) => ({ table: def.table, id: String(id) })));
        // Without the probe there is no way to know which weekday entry the app would
        // pair this day with, so a `-1` can only be reported as "no proper text".
        if (!cells.length) noProperText.push(def.key);
      }
      if (!cells.length) continue;

      for (const [i, cellRef] of cells.entries()) {
        const { table, id: sid, status, value, conflict } = describeCell(ctx, cellRef.table, cellRef.id);

        result.totals[status]++;
        hourTotals[status]++;
        fields.push({
          label: def.list && cells.length > 1 ? `${def.label} (${i + 1}/${cells.length})` : def.label,
          // The index field this cell belongs to, and its position within it for list
          // fields. Carried so the comparator can line each cell up with the matching
          // piece of cpl-app's own text (day-compare.js).
          key: def.key,
          index: def.list ? i : 0,
          table,
          id: sid,
          status,
          value,
          source: def.source || null,
          measured: !!measured,
          // This cell belongs to the weekday entry, not to the saint's — either because the
          // day has the memorial/ferial switch and cpl-app renders the ferial office, or
          // because the saint's own entry has no text here.
          fromFerial,
          // The other text the page can show for this field (the memorial/ferial switch).
          altMode: altMode ? describeCell(ctx, altMode[i] ? altMode[i].table : null, altMode[i] ? altMode[i].id : null) : null,
          blame: status === 'conflict' ? blameFor(ctx, table, sid) : null,
          conflict:
            conflict && options.impact
              ? { ...conflict, impact: impactFor(table, sid, dateStr) }
              : conflict || null,
        });
      }
    }
    result.hours.push({ hour, key, fields, totals: hourTotals, noProperText });
  }

  // The answer to "why does THIS day fail?", which is rarely the same as "what does this
  // day celebrate": a day is usually withheld because of OTHER days sharing its cells.
  // Rolling the per-field blame up to the day says, in one line, whose fault it is.
  const blameRoll = new Map();
  for (const h of result.hours) {
    for (const f of h.fields) {
      for (const b of f.blame || []) {
        if (!blameRoll.has(b.title)) blameRoll.set(b.title, { ...b, fields: 0, soleFields: 0 });
        const r = blameRoll.get(b.title);
        r.fields++;
        if (b.sole) r.soleFields++;
      }
    }
  }
  result.blameSummary = [...blameRoll.values()].sort((a, b) => b.soleFields - a.soleFields || b.fields - a.fields);

  const t = result.totals;
  const total = t.ok + t.conflict + t.missing + t.notInAppYet;
  result.total = total;
  result.percent = total ? Math.round((100 * t.ok) / total) : 0;
  result.verdict = total === 0 ? 'unknown' : t.ok === total ? 'complete' : 'incomplete';
  return result;
}

// One month at a glance: the same verdict as checkDay for every day, without the
// per-field detail (the UI fetches that when you click a day).
function checkMonth(year, month, options = {}) {
  const ctx = options.ctx || buildContext(options);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];
  const totals = { complete: 0, incomplete: 0, unknown: 0, outOfRange: 0, fieldsOk: 0, fields: 0 };

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const r = checkDay(dateStr, { ctx });
    if (r.error) {
      totals.outOfRange++;
      days.push({ date: dateStr, day, outOfRange: true });
      continue;
    }
    totals[r.verdict]++;
    totals.fieldsOk += r.totals.ok;
    totals.fields += r.total;
    days.push({
      date: dateStr,
      day,
      litcalId: r.litcalId,
      allXKey: r.allXKey,
      verdict: r.verdict,
      percent: r.percent,
      totals: r.totals,
      total: r.total,
      // A day whose litcal id has no entry in the shared index at all (e.g. the new
      // Catalan feasts) is a different thing from a day that is merely incomplete.
      notInIndex: r.hours.every((h) => !h.key),
    });
  }

  return {
    year,
    month,
    days,
    totals,
    percent: totals.fields ? Math.round((100 * totals.fieldsOk) / totals.fields) : 0,
    lastRun: ctx.lastRun,
  };
}

// --- Conflict drill-down: "who else shares this cell, and who breaks if I fill it?" ----
//
// A conflict count ("7 variants, 72 days") says a cell is contested but not whether the
// day in front of you is the problem. Usually it isn't: the day you're looking at agrees
// with the majority, and the cell is withheld because of a handful of other dates. So the
// only question worth answering here is the concrete one — *if we wrote the text this day
// wants, which other days would then show something wrong, and what would they be missing?*
//
// Grouping by litcal id (not by date) is what makes the answer readable, because it
// separates the two causes that look identical in a flat variant list:
//   - different celebrations sharing one cell   -> every one of them wants its own text
//   - one celebration disagreeing with itself   -> the same feast gives different text
//                                                  depending on the year (cycle, psalter
//                                                  week, or a genuine cpl-app oddity)

const WEEKDAY_CA = {
  monday: 'dilluns', tuesday: 'dimarts', wednesday: 'dimecres', thursday: 'dijous',
  friday: 'divendres', saturday: 'dissabte', sunday: 'diumenge',
};
const MONTH_CA = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost',
  'setembre', 'octubre', 'novembre', 'desembre'];
const SEASON_CA = { ordinary_time: 'Temps Ordinari', lent: 'Quaresma', advent: 'Advent', easter_time: 'Pasqua', christmas_time: 'Nadal' };

// litcal ids read fine to a machine and badly to a human scanning a table. Only the
// regular seasonal/ferial shapes are glossed; proper feasts keep their own name, which
// comes from the celebration table when it has been migrated.
function glossLitcalId(id, celebrationName) {
  if (celebrationName) return celebrationName;
  let m = id.match(/^([a-z]+_time|lent|advent)_(\d+)_([a-z]+)$/);
  if (m && WEEKDAY_CA[m[3]]) return `${SEASON_CA[m[1]] || m[1]} · setmana ${m[2]} · ${WEEKDAY_CA[m[3]]}`;
  m = id.match(/^advent_(?:december_)?(\d+)$/);
  if (m) return `Advent · ${m[1]} de desembre`;
  m = id.match(/^christmas_time_([a-z]+)_(\d+)$/);
  if (m) return `Nadal · ${m[2]} de ${MONTH_CA[['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(m[1])] || m[1]}`;
  return id;
}

function celebrationNames(language = 'ca') {
  const index = readJsonSafe(path.join(DAY_TEXTS_DIR, 'all_celebrations.json'), {});
  const namesApp = readJsonSafe(path.join(DAY_TEXTS_DIR, 'commons', language, 'celebration_names.json'), {});
  // The not-yet-exported names only exist for the language being migrated.
  const namesLocal = language === 'ca' ? readJsonSafe(path.join(LOCAL_COMMONS_DIR, 'celebration_names.json'), {}) : {};
  const out = {};
  for (const [litcalId, entry] of Object.entries(index)) {
    const nid = entry && (entry.name !== undefined ? entry.name : entry.val);
    if (nid === undefined || nid === null) continue;
    const name = namesApp[String(nid)] || namesLocal[String(nid)];
    if (name) out[litcalId] = name;
  }
  return out;
}

// What es currently shows in this very cell. It is the ground truth for "what will the
// app print here", and reading it next to cpl-app's variants is what turns the panel from
// "these texts disagree" into "es picked THIS one, and here is who that leaves wrong".
const esTables = {};
function esTextFor(table, id) {
  if (!(table in esTables)) {
    esTables[table] = readJsonSafe(path.join(DAY_TEXTS_DIR, 'commons/es', `${table}.json`), null);
  }
  const t = esTables[table];
  if (!t) return null;
  const v = t[String(id)];
  if (v === undefined || v === null) return null;
  return typeof v === 'string' ? v : JSON.stringify(v);
}

// `date` is the day being inspected; it decides which variant counts as "the one we'd
// write" and therefore who ends up broken. Without it the answer is still useful (the
// majority text stands in), just not anchored to a day.
function conflictDetail({ table, id, date }) {
  const pending = readPending();
  const item = (pending[table] || []).find((x) => String(x.id) === String(id));
  if (!item) return { found: false, table, id, date };

  const manifest = readJsonSafe(MANIFEST_PATH, {});
  const names = celebrationNames();
  const myLitcalId = date && manifest[date] ? manifest[date].litcalId : null;

  const variants = item.variants
    .map((v, i) => ({ i, text: v.preview, truncated: !!v.truncated, tags: v.tags }))
    .sort((a, b) => b.tags.length - a.tags.length);

  // The variant this very date wants; if the date isn't in the migrated window, fall back
  // to the most used one so the "what breaks" column still means something.
  const mine =
    (date && variants.find((v) => v.tags.some((t) => t.startsWith(date)))) || null;
  const reference = mine || variants[0];

  const groups = new Map();
  for (const v of variants) {
    for (const tag of v.tags) {
      const d = tag.slice(0, 10);
      const hour = (tag.match(/\(([^)]+)\)/) || [])[1] || null;
      const litcalId = (manifest[d] || {}).litcalId || 'sense clau litcal';
      if (!groups.has(litcalId)) groups.set(litcalId, { litcalId, byText: new Map(), days: 0 });
      const g = groups.get(litcalId);
      g.days++;
      if (!g.byText.has(v.i)) g.byText.set(v.i, { text: v.text, truncated: v.truncated, dates: [] });
      g.byText.get(v.i).dates.push({ date: d, hour });
    }
  }

  let agreeDays = 0;
  let breakDays = 0;
  const out = [];
  for (const g of groups.values()) {
    const texts = [...g.byText.entries()]
      .map(([vi, t]) => ({
        text: t.text,
        truncated: t.truncated,
        days: t.dates.length,
        // Newest first: the list is usually truncated to its first few entries, and the
        // recent years are the ones worth checking — an old date proves the same point but
        // is likelier to be a calendar the app no longer serves.
        dates: t.dates.sort((a, b) => b.date.localeCompare(a.date)),
        sameAsReference: reference ? vi === reference.i : false,
        containsDate: !!date && t.dates.some((x) => x.date === date),
      }))
      .sort((a, b) => b.days - a.days);
    for (const t of texts) (t.sameAsReference ? (agreeDays += t.days) : (breakDays += t.days));
    out.push({
      litcalId: g.litcalId,
      name: glossLitcalId(g.litcalId, names[g.litcalId]),
      days: g.days,
      isMine: !!myLitcalId && g.litcalId === myLitcalId,
      // `varies` is the interesting one: the same celebration disagreeing with itself
      // across years, which no amount of "pick the right text" can fix.
      verdict: texts.length > 1 ? 'varies' : texts[0].sameAsReference ? 'same' : 'differs',
      texts,
    });
  }

  const rank = { varies: 0, differs: 1, same: 2 };
  out.sort((a, b) => (b.isMine - a.isMine) || (rank[a.verdict] - rank[b.verdict]) || (b.days - a.days));

  return {
    found: true,
    table,
    id: String(id),
    date: date || null,
    myLitcalId,
    myName: myLitcalId ? glossLitcalId(myLitcalId, names[myLitcalId]) : null,
    // Set when the inspected date isn't among the observations (outside the migrated
    // window, or cpl-app gave nothing) — then "mine" is the majority text, not this day's.
    dateNotObserved: !!date && !mine,
    reference: reference ? { text: reference.text, truncated: reference.truncated, days: reference.tags.length } : null,
    esText: esTextFor(table, id),
    totals: {
      days: item.affectedCount,
      celebrations: out.length,
      texts: item.variants.length,
      agreeDays,
      breakDays,
      breakCelebrations: out.filter((g) => g.verdict !== 'same').length,
    },
    groups: out,
  };
}

// The day's calendar situation in two or three lines, for the terminal report.
function celebrationSummary(c) {
  const lines = [];
  const ranks = (c.group && c.group.ranks) || [];
  lines.push(
    c.title
      ? `cpl-app hi celebra: ${c.title}${ranks.length ? ` (${ranks.join('/')})` : ''}`
      : 'cpl-app hi celebra: res — fèria'
  );
  lines.push(`litcal hi diu: ${c.litcalId}${c.litcalIsFerial ? ' (fèria simple)' : ''}`);
  if (c.verdictLabel) lines.push(`Diagnòstic: ${c.verdictLabel}`);
  if (c.group && c.group.verdict === 'missing') {
    lines.push(
      `  id proposat: ${c.group.suggestedId} · afecta ${c.group.contestedDays} dies i ` +
        `${c.group.cellsBlamed} caselles (${c.group.cellsSole} només seves)`
    );
  }
  if (!c.minorityCells) {
    lines.push('  aquest dia no és el discrepant de cap casella: el que hi falti ve d’altres dies.');
  }
  return lines;
}

module.exports = {
  checkDay,
  checkMonth,
  buildContext,
  conflictDetail,
  celebrationSummary,
  FIELDS,
  celebrationNames,
  glossLitcalId,
  readJsonSafe,
  // Shared with day-compare.js so both sides read the same trees.
  PATHS: { DAY_TEXTS_DIR, APP_COMMONS_DIR, LOCAL_COMMONS_DIR, MANIFEST_PATH },
};

if (require.main === module) {
  const date = process.argv[2];
  if (!date) {
    console.error('Usage: node migration-to-saints/day-check.js YYYY-MM-DD');
    process.exit(1);
  }
  const r = checkDay(date, { impact: true });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  console.log(`${r.date} -> ${r.litcalId} (${r.allXKey})`);
  console.log(`Veredicte: ${r.verdict} · ${r.percent}% (${r.totals.ok}/${r.total} camps amb text català)`);
  console.log(`  conflictes: ${r.totals.conflict} · sense dades: ${r.totals.missing} · exportats però no a l'app: ${r.totals.notInAppYet}`);
  if (r.celebration) console.log('\n' + celebrationSummary(r.celebration).join('\n'));
  // Same rule as the panel: name the celebrations that are the sole contester of a cell
  // (those are to-dos), and reduce diffuse blame to its count — one line per celebration
  // is a wall that describes two broken cells with sixteen rows.
  const dayBlame = r.blameSummary || [];
  const soleCauses = dayBlame.filter((b) => b.soleFields > 0);
  if (soleCauses.length) {
    console.log('\nArreglar això desbloqueja camps pel seu compte:');
    for (const b of soleCauses.slice(0, 5)) {
      console.log(
        `  ${String(b.soleFields).padStart(3)} camps només per això${b.fields > b.soleFields ? ` (${b.fields} en total)` : ''} · ${b.title}` +
          `\n      ${b.verdictLabel}`
      );
    }
    if (soleCauses.length > 5) console.log(`  …i ${soleCauses.length - 5} causes úniques més`);
  }
  if (dayBlame.length) {
    console.log(
      `\nLes caselles en conflicte les comparteixen ${dayBlame.length} celebracions · ` +
        (soleCauses.length ? `${soleCauses.length} en són causa única.` : "cap n'és causa única.")
    );
  }
  for (const h of r.hours) {
    console.log(`\n[${h.hour}] ${h.key || h.note}`);
    for (const f of h.fields.filter((x) => x.status !== 'ok')) {
      const imp = f.conflict && f.conflict.impact;
      const why = f.conflict
        ? ` — ${f.conflict.cause} (${f.conflict.variantCount} variants, decisió: ${f.conflict.decision})` +
          (imp ? `\n${' '.repeat(15)}amb el text d'aquest dia: ${imp.agreeDays}/${imp.days} dies bé, ${imp.breakDays} malament` : '')
        : '';
      const blames = f.blame || [];
      const blame =
        blames.length === 1
          ? `\n${' '.repeat(15)}${blames[0].sole ? 'causa única' : 'una de les causes'}: ${blames[0].title} — ${blames[0].verdictLabel}`
          : blames.length
            ? `\n${' '.repeat(15)}${blames.length} celebracions es reparteixen la casella · cap causa única`
            : '';
      console.log(`  ${f.status.padEnd(12)} ${f.label} [${f.table}/${f.id}]${why}${blame}`);
    }
  }
}
