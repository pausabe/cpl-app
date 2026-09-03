// Side-by-side reader for one day: cpl-app's text on one side, saints-app's on the other,
// field by field. It exists to replace the phone: instead of opening both apps and scrolling
// them in parallel, you pick a date and read the two columns.
//
// The two sides come from different places and neither is a copy of the other:
//   - cpl-app: resolved live from cpl-app.db by cpl-app's own Services (cpl-day.test.js),
//     for a chosen diocese.
//   - saints-app: the id each field resolves to (measured cell map, index as fallback) read
//     out of commons/<language> — the very table the app loads — for a chosen litcal
//     calendar.
//
// Those two choices are independent on purpose. Matching them (Barcelona vs
// diocese-barcelona, in ca) answers "will this day come out right?"; crossing them answers
// other real questions: how the same day reads in Spanish, or what a diocese celebrates
// that another doesn't.
//
// So a row can differ for real reasons (the cell is still empty, or it was filled from a
// different day that shares it), and that difference is the point of the tool. When the
// table has no id, saints-app doesn't fall back to another language: TextService returns
// the literal string "id N not found in <table>", which is what the app prints. That
// string is reported as-is, because it is what you would see on the phone.

const fs = require('fs');
const path = require('path');
const dayCheck = require('./day-check');

const { DAY_TEXTS_DIR, LOCAL_COMMONS_DIR } = dayCheck.PATHS;
const readJsonSafe = dayCheck.readJsonSafe;

// Order and labels come from the inspector's own field list, so both tools describe the
// day with the same vocabulary and in the same reading order.
const FIELD_ORDER = dayCheck.FIELDS.map((f) => f.key);
const FIELD_DEF = new Map(dayCheck.FIELDS.map((f) => [f.key, f]));

// What TextService prints when an id isn't in the loaded table (src/services/TextService.ts).
function notFoundRender(table, id) {
  return `id ${id} not found in ${table}`;
}

function norm(s) {
  return s == null ? null : String(s).replace(/\s+/g, ' ').trim();
}

// `same` / `diff` are only meaningful when both sides have text; the other two verdicts say
// which side is empty, which is the more common outcome mid-migration.
function verdictFor(cpl, app) {
  if (cpl == null && app == null) return 'none';
  if (app == null) return 'onlyCpl';
  if (cpl == null) return 'onlyApp';
  return norm(cpl) === norm(app) ? 'same' : 'diff';
}

function makeRow({ key, label, cpl, appField, index = 0, count = 1, noProperText = false }) {
  const app = appField ? appField.value : null;
  // `ferial` is not a gap: saints-app is not supposed to have its own text here, so it
  // must not be counted (or coloured) like an empty cell that still needs migrating.
  const verdict = noProperText && app == null ? 'ferial' : verdictFor(cpl, app);

  // The page can show a second text for this field (the memorial/ferial switch). The
  // column already reads the tab cpl-app corresponds to — the ferial one on a memorial,
  // see lib/memorial-ferial.js — so this is the OTHER tab, and it is only worth mentioning
  // when the tab being compared doesn't match cpl-app but that one does.
  const alt = appField && appField.altMode;
  const altModeMatch = !!(alt && alt.value != null && cpl != null && verdict !== 'same' && norm(alt.value) === norm(cpl));
  return {
    key,
    label: count > 1 ? `${label} (${index + 1}/${count})` : label,
    table: appField ? appField.table : null,
    id: appField ? appField.id : null,
    // The inspector's own verdict for the cell (ok / conflict / missing / notInAppYet),
    // which explains WHY the app column is empty when it is.
    status: appField ? appField.status : null,
    conflict: appField ? appField.conflict : null,
    blame: appField ? appField.blame : null,
    source: appField ? appField.source : null,
    cpl,
    app,
    // What the phone actually renders when the cell is empty — not a blank, a diagnostic
    // string. Shown so the comparison matches the screen.
    appRender: appField && app == null ? notFoundRender(appField.table, appField.id) : null,
    // The entry says `-1` here and there is no weekday cell either: saints-app shows
    // nothing and nothing is missing. Without this the row reads as a hole.
    noProperText,
    // This text comes from the weekday entry the app loads alongside the saint's
    // (`<field>_Ferial`), which is what the page reads when the saint has no text here.
    fromFerial: !!(appField && appField.fromFerial),
    altModeMatch,
    altMode: altModeMatch ? alt.value : null,
    verdict,
    // The verdict compares collapsed whitespace, so two texts can be "the same" and still
    // not be byte-identical. That happens when the cell was filled from another day whose
    // text is spaced differently, which is worth seeing without calling it a difference.
    whitespaceOnly: verdict === 'same' && String(cpl) !== String(app),
  };
}

// One Hour: walk the field vocabulary in reading order and pair each app cell with the
// matching piece of cpl-app's text. List fields (responsory parts, intercessions) pair by
// position, and a side with more entries than the other still gets its rows.
function compareHour(hour, appHour, cplFields) {
  const appByKey = new Map();
  for (const f of (appHour && appHour.fields) || []) {
    if (!f.key) continue;
    if (!appByKey.has(f.key)) appByKey.set(f.key, []);
    appByKey.get(f.key).push(f);
  }

  const ferial = new Set((appHour && appHour.noProperText) || []);
  const rows = [];
  for (const key of FIELD_ORDER) {
    const def = FIELD_DEF.get(key);
    const appCells = appByKey.get(key) || [];
    const rawCpl = cplFields ? cplFields[key] : undefined;
    const cplValues = rawCpl === undefined || rawCpl === null ? [] : Array.isArray(rawCpl) ? rawCpl : [rawCpl];
    const count = Math.max(appCells.length, cplValues.length);
    for (let i = 0; i < count; i++) {
      rows.push(
        makeRow({
          key,
          label: def.label,
          cpl: cplValues[i] === undefined ? null : cplValues[i],
          appField: appCells[i] || null,
          index: i,
          count,
          noProperText: ferial.has(key),
        })
      );
    }
  }

  const totals = { same: 0, diff: 0, onlyCpl: 0, onlyApp: 0, ferial: 0, none: 0, altModeMatch: 0 };
  for (const r of rows) {
    totals[r.verdict]++;
    if (r.altModeMatch) totals.altModeMatch++;
  }
  return {
    hour,
    key: appHour ? appHour.key : null,
    note: appHour ? appHour.note : null,
    rows,
    totals,
  };
}

// The invitatory isn't one of the Hours the inspector walks field by field (its index entry
// is a single `{ val: <id> }`), but it is the first thing the app shows in the morning, so
// the comparison would feel incomplete without it.
function compareInvitatory(litcalId, cplAntiphon, language) {
  const index = readJsonSafe(path.join(DAY_TEXTS_DIR, 'all_invitatorios.json'), {});
  const key = Object.keys(index).find((k) => k === litcalId || k.startsWith(`${litcalId}__`));
  const entry = key ? index[key] : null;
  const id = entry && entry.val !== undefined ? String(entry.val) : null;
  if (id === null) {
    if (cplAntiphon == null) return null;
    return {
      hour: 'Invitatori',
      key: null,
      note: `Cap entrada a all_invitatorios.json per a "${litcalId}".`,
      rows: [makeRow({ key: 'invitatorio', label: 'Antífona invitatòria', cpl: cplAntiphon, appField: null })],
      totals: { same: 0, diff: 0, onlyCpl: 1, onlyApp: 0, ferial: 0, none: 0, altModeMatch: 0 },
    };
  }
  const appTable = readJsonSafe(path.join(DAY_TEXTS_DIR, 'commons', language, 'invitatorios.json'), {});
  const localTable = language === 'ca' ? readJsonSafe(path.join(LOCAL_COMMONS_DIR, 'invitatorios.json'), {}) : {};
  const inApp = Object.prototype.hasOwnProperty.call(appTable, id);
  const inLocal = Object.prototype.hasOwnProperty.call(localTable, id);
  const appField = {
    table: 'invitatorios',
    id,
    status: inApp ? 'ok' : inLocal ? 'notInAppYet' : 'missing',
    value: inApp ? appTable[id] : inLocal ? localTable[id] : null,
    conflict: null,
    blame: null,
    source: null,
  };
  const row = makeRow({ key: 'invitatorio', label: 'Antífona invitatòria', cpl: cplAntiphon, appField });
  const totals = { same: 0, diff: 0, onlyCpl: 0, onlyApp: 0, ferial: 0, none: 0, altModeMatch: 0 };
  totals[row.verdict]++;
  return { hour: 'Invitatori', key, rows: [row], totals };
}

// The day's title on each side: cpl-app's own celebration title vs the name saints-app has
// for the litcal id it resolved the date to. Two different names here is usually the reason
// the rest of the day differs.
function compareCelebration(litcalId, cplCelebration, language) {
  const names = dayCheck.celebrationNames(language);
  const appName = litcalId ? names[litcalId] || null : null;
  const cplTitle = (cplCelebration && cplCelebration.title) || null;
  return {
    cpl: cplTitle,
    app: appName,
    appGloss: litcalId ? dayCheck.glossLitcalId(litcalId, appName) : null,
    // cpl-app only speaks Catalan, so comparing its title against a Spanish or Italian one
    // says nothing: "Sant Maximilià Maria Kolbe" vs "San Maximiliano Kolbe" is the same
    // saint, and calling that a disagreement would cry wolf on every single row.
    verdict: language === 'ca' ? verdictFor(cplTitle, appName) : 'notComparable',
    detail: cplCelebration || null,
  };
}

// `cplDay` is one entry of cpl-day.test.js's output (or `{ error }` when cpl-app couldn't
// resolve the date). `dayCheckResult` is the inspector's verdict for the same date, reused
// rather than recomputed so both views can never disagree about a cell.
function compareDay(dateStr, cplDay, dayCheckResult, { language = 'ca' } = {}) {
  if (dayCheckResult && dayCheckResult.error) {
    return { date: dateStr, error: dayCheckResult.error, cpl: cplDay || null };
  }
  const result = {
    date: dateStr,
    litcalId: dayCheckResult.litcalId,
    allXKey: dayCheckResult.allXKey,
    lastRun: dayCheckResult.lastRun,
    language,
    diocese: cplDay && cplDay.diocese ? cplDay.diocese : null,
    // Present when cpl-app itself couldn't resolve the day (outside cpl-app.db's range, or
    // a genuine failure). The saints-app column is still filled in — half the answer beats
    // an error page.
    cplError: cplDay && cplDay.error ? cplDay.error : null,
    celebration: compareCelebration(dayCheckResult.litcalId, cplDay && cplDay.celebration, language),
    hours: [],
    totals: { same: 0, diff: 0, onlyCpl: 0, onlyApp: 0, ferial: 0, none: 0, altModeMatch: 0 },
  };

  const invit = compareInvitatory(dayCheckResult.litcalId, cplDay ? cplDay.invitatory : null, language);
  if (invit) result.hours.push(invit);

  for (const appHour of dayCheckResult.hours) {
    const cplFields = cplDay && cplDay.hours ? cplDay.hours[appHour.hour] : null;
    result.hours.push(compareHour(appHour.hour, appHour, cplFields));
  }

  for (const h of result.hours) {
    for (const k of Object.keys(result.totals)) result.totals[k] += h.totals[k];
  }
  const t = result.totals;
  const comparable = t.same + t.diff;
  result.rows = t.same + t.diff + t.onlyCpl + t.onlyApp + t.none;
  result.percentSame = comparable ? Math.round((100 * t.same) / comparable) : 0;
  return result;
}

module.exports = { compareDay, compareHour, notFoundRender };

if (require.main === module) {
  const date = process.argv[2];
  const cplPath = process.argv[3];
  if (!date || !cplPath) {
    console.error('Usage: node migration-to-saints/day-compare.js YYYY-MM-DD <cpl-day.json>');
    process.exit(1);
  }
  const dump = JSON.parse(fs.readFileSync(cplPath, 'utf8'));
  const cplDay = dump.days[date];
  const r = compareDay(date, cplDay, dayCheck.checkDay(date, { fromFerial: cplDay && cplDay.ferialFields }));
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  console.log(`${r.date} · cpl-app: ${r.celebration.cpl || '—'} · saints-app: ${r.celebration.appGloss || '—'}`);
  console.log(
    `Iguals: ${r.totals.same} · diferents: ${r.totals.diff} · només cpl-app: ${r.totals.onlyCpl} · ` +
      `només saints-app: ${r.totals.onlyApp} · sense text propi (fèria): ${r.totals.ferial}`
  );
  for (const h of r.hours) {
    console.log(`\n[${h.hour}] ${h.key || h.note || ''}`);
    for (const row of h.rows) {
      const mark = { same: '=', diff: '≠', onlyCpl: '→', onlyApp: '←', ferial: '~', none: '·' }[row.verdict];
      console.log(`  ${mark} ${row.label}${row.table ? ` [${row.table}/${row.id}]` : ''}${row.verdict === 'ferial' ? ' — l’índex hi diu -1: text de la fèria' : ''}`);
      if (row.verdict !== 'same' && row.verdict !== 'ferial') {
        console.log(`      cpl-app:    ${row.cpl ? String(row.cpl).replace(/\s+/g, ' ').slice(0, 100) : '—'}`);
        console.log(`      saints-app: ${row.app ? String(row.app).replace(/\s+/g, ' ').slice(0, 100) : row.appRender || '—'}`);
      }
    }
  }
}
