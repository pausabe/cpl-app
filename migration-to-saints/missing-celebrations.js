// Turns "this day's text disagrees with everyone else's" into "this day celebrates
// something litcal doesn't know about, and it's called X".
//
// The conflict report can say a cell is contested and by which dates, but not why those
// dates are different — which is the only thing that makes the conflict fixable. Crossing
// it with cpl-app's own verdict for each date (celebration-probe.test.js) answers that,
// because the cause is almost always one of three shapes:
//
//   missing        cpl-app celebrates a named feast; litcal resolved a plain ferial day.
//                  litcal has never heard of this celebration -> it needs adding to the
//                  Catalan calendars (and, unlike everything else in this migration, its
//                  own key + numeric ids in the shared es/it index, which don't exist).
//   mismatch       both sides name a celebration, but not the same one — a transfer or a
//                  precedence rule one side applies and the other doesn't (Sant Jordi
//                  moved off 23 April, the Immaculate moved off a Sunday of Advent...).
//                  Nothing to add to the calendar: a rule to reconcile.
//   memorial       both sides celebrate the memorial; saints-app offers the memorial AND
//                  the ferial office, cpl-app only ever renders the ferial one. Not a
//                  calendar disagreement at all — see lib/memorial-ferial.js.
//   ferial-drift   cpl-app agrees it is a ferial day, yet still gives different text.
//                  Not a calendar problem at all (psalter week, cycle, or a cpl oddity).
//
// A celebration only gets reported if it actually contests something: being absent from
// litcal is harmless as long as every day that uses it agrees with its cell.
//
// Run with: node migration-to-saints/missing-celebrations.js [--json]

const fs = require('fs');
const path = require('path');

const MIGRATION_DIR = __dirname;
const MANIFEST_PATH = path.join(MIGRATION_DIR, 'webui/run/date-to-key-manifest.json');
const PROBE_PATH = path.join(MIGRATION_DIR, 'output/cpl-celebrations.json');
const PENDING_PATH = path.join(MIGRATION_DIR, 'output/join-pending-review.json');
const OUTPUT_PATH = path.join(MIGRATION_DIR, 'output/missing-celebrations.json');
// cpl-cloud's process X, the one that writes anyliturgic out of litcal: the same default as the
// Makefile's PROCESS_X, next to cpl-app.
const PROCESS_X = process.env.PROCESS_X || path.resolve(MIGRATION_DIR, '../../cpl-cloud/calendar');
const CELEBRATIONS_PATH = path.join(PROCESS_X, 'data/celebrations.json');

// The same ferial-key test the join uses to decide whether a litcal id names a proper
// celebration or just a weekday (join-content.test.js, HOURS_CONFIG.Celebration).
const FERIAL_KEY = /^(ordinary_time|advent|lent|easter|christmas_time|holy_week|octave)_/;
function isFerialLitcalId(id) {
  if (!id) return true;
  return (
    FERIAL_KEY.test(id) ||
    /_after_epiphany$|_after_ash_wednesday$/.test(id) ||
    id === 'second_sunday_after_christmas'
  );
}

// Narrower, and the one the verdict hangs on: "litcal thinks nothing in particular
// happens here". Sundays, Holy Week and the octaves are ferial by the test above (their
// name lives in the season, not in a saint) but they are emphatically celebrations — a
// day cpl-app celebrates differently from `easter_sunday` is a disagreement about
// precedence, never a celebration litcal has never heard of.
function isPlainWeekday(id) {
  if (!isFerialLitcalId(id)) return false;
  if (/_sunday$/.test(id)) return false;
  return !/^(holy_week|octave)_/.test(id);
}

// One sentence per verdict, kept here rather than in each consumer so the terminal
// report and the panel say exactly the same thing about the same day.
const VERDICT_LABEL = {
  missing: 'litcal no coneix aquesta celebració — cal afegir-la al calendari català',
  'not-applied': 'la celebració ja és al calendari, però litcal no l’aplica en aquestes dates',
  mismatch: 'litcal i cpl-app no celebren el mateix aquest dia (trasllat o precedència)',
  memorial: 'les dues apps hi celebren la memòria: saints-app ofereix memòria i fèria, cpl-app només resa la fèria',
  'ferial-drift': 'cap celebració pel mig: el text de la fèria varia per si sol',
};

// Days where saints-app carries both offices behind the memorial/ferial switch — the probe
// records the second one as `<field>_Ferial`. Read straight off the measured cell map so
// this says what the app really does, not what the index suggests.
function memorialFerialDates() {
  const map = readJsonSafe(path.join(MIGRATION_DIR, 'output/app-cell-map.json'), null);
  const dates = new Set();
  for (const [date, day] of Object.entries((map && map.days) || {})) {
    for (const fields of Object.values(day.hours || {})) {
      if (Object.keys(fields).some((k) => k.endsWith('_Ferial'))) {
        dates.add(date);
        break;
      }
    }
  }
  return dates;
}

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

// Which of cpl-app's celebrations litcal knows, and by which id, so a group can say whether
// the fix is "add it" or "it's there, the disagreement is elsewhere". Process X keeps that
// pairing in data/celebrations.json: every celebration of the app's santoral, its litcal id
// and the rows that hold its texts. Matched on the name the app gives it, which is what the
// probe records. The proper of time (Christmas, Easter…) is not in it: litcal always knows
// those, and no verdict asks.
function litcalCelebrationIndex() {
  const data = readJsonSafe(CELEBRATIONS_PATH, null);
  const byName = new Map();
  for (const c of (data && data.celebrations) || []) {
    byName.set(c.name.trim(), { id: c.id, origin: c.origin, places: c.places });
  }
  return { byName, available: byName.size > 0 };
}

// Per contested cell, which dates carry a text other than the majority one. Those are the
// dates that would be shown something wrong if the cell were filled with the common text —
// i.e. the ones with something to explain.
function minorityDatesByCell(pending) {
  const cells = [];
  for (const [table, list] of Object.entries(pending)) {
    for (const item of list) {
      const majority = item.variants.reduce((a, b) => (b.tags.length > a.tags.length ? b : a));
      const dates = new Set();
      for (const v of item.variants) {
        if (v === majority) continue;
        for (const tag of v.tags) dates.add(tag.slice(0, 10));
      }
      if (dates.size) cells.push({ key: `${table}/${item.id}`, table, id: String(item.id), dates });
    }
  }
  return cells;
}

function build() {
  const manifest = readJsonSafe(MANIFEST_PATH, {});
  const probe = readJsonSafe(PROBE_PATH, null);
  const pending = readJsonSafe(PENDING_PATH, {});

  if (!probe || !probe.days) {
    return {
      error:
        `Falta ${path.relative(MIGRATION_DIR, PROBE_PATH)}. Genera'l amb ` +
        `"npx jest migration-to-saints/celebration-probe.test.js --silent".`,
    };
  }

  const litcal = litcalCelebrationIndex();
  const withSwitch = memorialFerialDates();
  const cells = minorityDatesByCell(pending);

  // date -> how many contested cells it is the odd one out in.
  const minorityCellsByDate = {};
  for (const cell of cells) {
    for (const d of cell.dates) minorityCellsByDate[d] = (minorityCellsByDate[d] || 0) + 1;
  }

  // Group the dates by what cpl-app calls them. A ferial day keeps its own bucket per
  // litcal id, because "the same weekday disagreeing with itself" is a different finding
  // from "an unknown feast", and lumping every ferial day into one bucket hides both.
  const groups = new Map();
  const byDate = {};
  for (const [date, entry] of Object.entries(manifest)) {
    const day = probe.days[date];
    if (!day) continue;
    const litcalId = entry.litcalId;
    const litcalIsFerial = isPlainWeekday(litcalId);
    const hasCplCelebration = day.type !== '-' && !!day.title;
    const minorityCells = minorityCellsByDate[date] || 0;

    const key = hasCplCelebration ? `cel|${day.title}` : `ferial|${litcalId}`;
    const record = { date, litcalId, litcalIsFerial, minorityCells, type: day.type };
    byDate[date] = { ...record, title: day.title, group: key };

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: day.title || null,
        types: new Set(),
        dates: [],
        litcalIds: new Set(),
        hasCplCelebration,
      });
    }
    const g = groups.get(key);
    g.types.add(day.type);
    g.litcalIds.add(litcalId);
    g.dates.push(record);
  }

  // Blame each contested cell on the groups its minority dates belong to. `sole` is the
  // number that matters when prioritising: cells that nothing ELSE contests, so fixing
  // this one celebration makes them resolvable.
  const blame = new Map(); // group key -> { cells:Set, sole:Set }
  const cellBlame = {}; // "table/id" -> [group keys], for the day inspector
  for (const cell of cells) {
    const keys = new Set();
    let unknown = false;
    for (const d of cell.dates) {
      const b = byDate[d];
      if (!b) { unknown = true; continue; }
      keys.add(b.group);
    }
    cellBlame[cell.key] = [...keys];
    for (const k of keys) {
      if (!blame.has(k)) blame.set(k, { cells: new Set(), sole: new Set() });
      blame.get(k).cells.add(cell.key);
      if (!unknown && keys.size === 1) blame.get(k).sole.add(cell.key);
    }
  }

  const RANK_LABEL = { S: 'Solemnitat', F: 'Festivitat', M: 'Memòria obligatòria', L: 'Memòria lliure', V: 'Memòria de la Verge' };

  const out = [];
  for (const g of groups.values()) {
    const contested = g.dates.filter((d) => d.minorityCells > 0);
    if (!contested.length) continue;
    const b = blame.get(g.key) || { cells: new Set(), sole: new Set() };

    const known = (g.title && litcal.byName.get(g.title.trim())) || null;

    let verdict;
    if (!g.hasCplCelebration) verdict = 'ferial-drift';
    // Every contested date offers both offices: the two apps are on the same celebration
    // and simply open on different tabs. Calling that a transfer or a precedence rule sent
    // you looking for a calendar bug that was never there (14-08-2026, sant Maximilià
    // Kolbe: both sides say Kolbe, and the panel announced they disagreed).
    else if (contested.every((d) => withSwitch.has(d.date))) verdict = 'memorial';
    else if (!contested.every((d) => d.litcalIsFerial)) verdict = 'mismatch';
    // The rule exists but litcal still hands back a bare weekday for these dates: it is
    // an optional memorial (litcal leaves the day ferial unless asked for it), or
    // cpl-app moved the celebration to a date litcal keeps ferial (Sant Jordi off 23
    // April), or the manifest simply predates the calendar being written. Nothing to add
    // in any of the three — the fix is in how the day gets resolved.
    else if (known) verdict = 'not-applied';
    else verdict = 'missing';

    out.push({
      key: g.key,
      title: g.title,
      verdict,
      verdictLabel: VERDICT_LABEL[verdict],
      // A celebration reported as several ranks across the window keeps them all: it is
      // usually the same feast downgraded in a year where something outranked it.
      ranks: [...g.types].filter((t) => t !== '-').map((t) => RANK_LABEL[t] || t),
      inLitcal: known,
      cellsBlamed: b.cells.size,
      cellsSole: b.sole.size,
      contestedDays: contested.length,
      totalDays: g.dates.length,
      litcalIds: [...g.litcalIds].sort(),
      dates: contested
        .slice()
        .sort((a, c) => c.minorityCells - a.minorityCells || a.date.localeCompare(c.date))
        .map((d) => ({ date: d.date, litcalId: d.litcalId, minorityCells: d.minorityCells })),
    });
  }

  out.sort((a, b2) => b2.cellsSole - a.cellsSole || b2.cellsBlamed - a.cellsBlamed);

  const totals = { contestedCells: cells.length, missing: 0, notApplied: 0, mismatch: 0, memorial: 0, ferialDrift: 0, cellsSoleMissing: 0 };
  for (const g of out) {
    if (g.verdict === 'missing') { totals.missing++; totals.cellsSoleMissing += g.cellsSole; }
    else if (g.verdict === 'not-applied') totals.notApplied++;
    else if (g.verdict === 'mismatch') totals.mismatch++;
    else if (g.verdict === 'memorial') totals.memorial++;
    else totals.ferialDrift++;
  }

  return {
    generatedAt: new Date().toISOString(),
    diocese: probe.diocese,
    probeGeneratedAt: probe.generatedAt,
    litcalCalendarsRead: litcal.available,
    totals,
    groups: out,
    byDate,
    cellBlame,
  };
}

// The day inspector's question is narrower: "for THIS date, is there a celebration behind
// the failures?" — so it gets a single date's verdict plus the group it belongs to,
// without loading the whole report's date lists.
function explainDate(dateStr, report) {
  const r = report || readJsonSafe(OUTPUT_PATH, null);
  if (!r || !r.byDate) return null;
  const entry = r.byDate[dateStr];
  if (!entry) return null;
  const group = (r.groups || []).find((g) => g.key === entry.group) || null;
  return {
    title: entry.title || null,
    type: entry.type,
    litcalId: entry.litcalId,
    litcalIsFerial: entry.litcalIsFerial,
    minorityCells: entry.minorityCells,
    verdict: group ? group.verdict : entry.minorityCells ? 'unknown' : 'ok',
    verdictLabel: group ? group.verdictLabel : null,
    group: group && {
      key: group.key,
      title: group.title,
      verdictLabel: group.verdictLabel,
      ranks: group.ranks,
      inLitcal: group.inLitcal,
      cellsBlamed: group.cellsBlamed,
      cellsSole: group.cellsSole,
      contestedDays: group.contestedDays,
      dates: group.dates.map((d) => d.date),
    },
  };
}

module.exports = { build, explainDate, isFerialLitcalId, isPlainWeekday, VERDICT_LABEL, OUTPUT_PATH };

if (require.main === module) {
  const report = build();
  if (report.error) {
    console.error(report.error);
    process.exit(1);
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 1), 'utf8');

  const t = report.totals;
  console.log(`${t.contestedCells} caselles en conflicte tenen almenys un dia discrepant.`);
  console.log(
    `Causes: ${t.missing} celebracions que falten a litcal · ${t.notApplied} que hi són però litcal no aplica · ` +
      `${t.mismatch} desacords de precedència/trasllat · ${t.memorial} memòries on cpl-app resa la fèria · ` +
      `${t.ferialDrift} grups de fèria (res a veure amb el calendari)`
  );
  console.log(
    `Afegint només les celebracions que falten es desbloquejarien ${t.cellsSoleMissing} caselles ` +
      `(${Math.round((1000 * t.cellsSoleMissing) / t.contestedCells) / 10}%).\n`
  );

  const missing = report.groups.filter((g) => g.verdict === 'missing');
  console.log(`Celebracions que falten al calendari (${missing.length}), per impacte:`);
  for (const g of missing.slice(0, 20)) {
    console.log(
      `  ${String(g.cellsSole).padStart(4)} caselles nomes seves · ${String(g.cellsBlamed).padStart(4)} en total · ` +
        `${g.contestedDays} dies · ${g.ranks.join('/')} · ${g.title}`
    );
  }

  const notApplied = report.groups.filter((g) => g.verdict === 'not-applied');
  console.log(`\nAl calendari però litcal no les aplica en aquestes dates (${notApplied.length}):`);
  for (const g of notApplied.slice(0, 8)) {
    console.log(
      `  ${String(g.cellsSole).padStart(4)} caselles nomes seves · ${g.contestedDays} dies · ${g.ranks.join('/')} · ${g.title}` +
        `\n       litcal: ${g.inLitcal.id} (${g.inLitcal.origin}; a l'app: ${g.inLitcal.places.join(' ')})`
    );
  }

  const mismatch = report.groups.filter((g) => g.verdict === 'mismatch');
  console.log(`\nDesacords de precedència/trasllat (${mismatch.length}), per impacte:`);
  for (const g of mismatch.slice(0, 10)) {
    console.log(
      `  ${String(g.cellsSole).padStart(4)} caselles nomes seves · ${g.contestedDays} dies · ${g.title}` +
        `\n       litcal hi diu: ${g.litcalIds.slice(0, 4).join(', ')}`
    );
  }
  console.log(`\nInforme complet: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}
