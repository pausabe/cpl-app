// Turns the raw conflict dump (output/join-pending-review.json) into a REVIEWABLE
// backlog: a few hundred "bundles" grouped by the shared cause behind the conflict,
// each carrying a decision the user records once and that survives re-runs.
//
// Why bundles and not ids: 2.667 contested ids are not a to-do list, they're a wall.
// But they are not 2.667 independent problems either — an id is contested because of
// something that also contests its neighbours (the same feast, the same recycled
// psalter slot). Grouped by that cause, the same data becomes ~490 questions, and the
// biggest ones answer dozens of ids at once.
//
// Decisions live in review-decisions.json (committed, hand-editable). They are keyed by
// bundle id and stamped with a fingerprint of the contested content, so re-running the
// join with a different window flags decisions whose underlying data moved instead of
// silently keeping a stale answer.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIGRATION_DIR = __dirname;
const PENDING_PATH = path.join(MIGRATION_DIR, 'output/join-pending-review.json');
const MANIFEST_PATH = path.join(MIGRATION_DIR, 'webui/run/date-to-key-manifest.json');
const DECISIONS_PATH = path.join(MIGRATION_DIR, 'review-decisions.json');

// What the user can say about a bundle. `park` is the important one right now: it means
// "this genuinely needs its own ids, but I'm not minting ids today" — the whole point of
// having the queue rather than deciding under pressure.
const CHOICES = {
  pending: 'Sense revisar',
  park: 'Necessita ids nous — ho decidiré més endavant',
  'follow-es': "Seguir el conveni d'ES (un sol text compartit)",
  'cpl-wrong': 'cpl-app s\'equivoca aquí — ES té raó',
  ignore: 'Irrellevant, deixar en blanc per sempre',
};

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

const ORDINARY = /^ordinary_time_(\d+)_([a-z]+)__/;

// Groups the contested ids by *why* they are contested. Order matters: the most
// specific, most explanatory rule wins.
function classify(litcalKeys) {
  if (litcalKeys.length === 1) {
    return { kind: 'feast', id: `feast|${litcalKeys[0]}`, label: `Festa: ${litcalKeys[0]}` };
  }

  const parsed = litcalKeys.map((k) => k.match(ORDINARY));
  if (parsed.every(Boolean)) {
    const weekdays = new Set(parsed.map((m) => m[2]));
    const psalterWeeks = new Set(parsed.map((m) => Number(m[1]) % 4));
    // Ordinary Time runs a 4-week psalter, so weeks 11, 15, 19, 23... share one slot in
    // saints-app. cpl-app gives each week its own text. That is one editorial question,
    // not one per week.
    if (weekdays.size === 1 && psalterWeeks.size === 1) {
      const weekday = [...weekdays][0];
      const week = [...psalterWeeks][0] || 4;
      return {
        kind: 'psalter',
        id: `psalter|${weekday}|${week}`,
        label: `Saltiri de 4 setmanes — ${weekday}, setmana ${week}`,
      };
    }
    if (weekdays.size === 1) {
      const weekday = [...weekdays][0];
      return {
        kind: 'ordinary-weekday',
        id: `ordwd|${weekday}`,
        label: `Temps Ordinari — ${weekday} (setmanes de saltiri barrejades)`,
      };
    }
  }

  return {
    kind: 'shared',
    id: `shared|${litcalKeys.join(',')}`,
    label: `Casella compartida per ${litcalKeys.length} celebracions`,
  };
}

function fingerprint(items) {
  const h = crypto.createHash('sha1');
  for (const it of items.slice().sort((a, b) => (a.table + a.id).localeCompare(b.table + b.id))) {
    h.update(it.table + '/' + it.id + '/');
    for (const v of it.variants) h.update(v.preview + '|');
  }
  return h.digest('hex').slice(0, 12);
}

function buildQueue() {
  const pending = readJsonSafe(PENDING_PATH, {});
  const manifest = readJsonSafe(MANIFEST_PATH, {});
  const decisions = readJsonSafe(DECISIONS_PATH, { decisions: {} }).decisions || {};

  const keyOfDate = (d) => (manifest[d] ? manifest[d].allXKey : null);
  const items = Object.entries(pending).flatMap(([table, list]) => list.map((i) => ({ table, ...i })));

  const bundles = new Map();
  for (const item of items) {
    const dates = [...new Set(item.variants.flatMap((v) => v.tags.map((t) => t.split(' ')[0])))];
    const litcalKeys = [...new Set(dates.map(keyOfDate).filter(Boolean))].sort();
    // No manifest entry (e.g. the queue was built before the join re-ran) — keep it
    // visible in its own bucket rather than dropping it on the floor.
    const cls = litcalKeys.length ? classify(litcalKeys) : { kind: 'unknown', id: 'unknown', label: 'Sense clau litcal coneguda' };

    if (!bundles.has(cls.id)) {
      bundles.set(cls.id, { ...cls, litcalKeys, items: [], dates: new Set() });
    }
    const b = bundles.get(cls.id);
    b.items.push(item);
    for (const d of dates) b.dates.add(d);
  }

  const out = [...bundles.values()].map((b) => {
    const fp = fingerprint(b.items);
    const stored = decisions[b.id];
    const stale = !!(stored && stored.fingerprint && stored.fingerprint !== fp);
    return {
      id: b.id,
      kind: b.kind,
      label: b.label,
      litcalKeys: b.litcalKeys,
      idCount: b.items.length,
      dayCount: b.dates.size,
      tables: [...new Set(b.items.map((i) => i.table))].sort(),
      fingerprint: fp,
      decision: stored ? stored.choice : 'pending',
      note: stored ? stored.note || '' : '',
      decidedAt: stored ? stored.decidedAt : null,
      stale,
      items: b.items
        .slice()
        .sort((a, b2) => b2.affectedCount - a.affectedCount)
        .map((i) => ({ table: i.table, id: i.id, affectedCount: i.affectedCount, variants: i.variants })),
    };
  });

  out.sort((a, b) => b.idCount - a.idCount);

  const totals = { bundles: out.length, ids: items.length, decided: 0, idsDecided: 0, stale: 0 };
  const byDecision = {};
  const byKind = {};
  for (const b of out) {
    byDecision[b.decision] = (byDecision[b.decision] || 0) + 1;
    byKind[b.kind] = byKind[b.kind] || { bundles: 0, ids: 0 };
    byKind[b.kind].bundles++;
    byKind[b.kind].ids += b.idCount;
    if (b.decision !== 'pending') {
      totals.decided++;
      totals.idsDecided += b.idCount;
    }
    if (b.stale) totals.stale++;
  }

  return { totals, byDecision, byKind, choices: CHOICES, bundles: out };
}

function saveDecision(bundleId, choice, note, fingerprintValue) {
  if (!Object.prototype.hasOwnProperty.call(CHOICES, choice)) {
    throw new Error(`Decisió desconeguda: ${choice}`);
  }
  const file = readJsonSafe(DECISIONS_PATH, { decisions: {} });
  file.decisions = file.decisions || {};
  if (choice === 'pending') {
    delete file.decisions[bundleId];
  } else {
    file.decisions[bundleId] = {
      choice,
      note: note || '',
      fingerprint: fingerprintValue || null,
      decidedAt: new Date().toISOString(),
    };
  }
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(file, null, 2) + '\n', 'utf8');
  return file.decisions[bundleId] || null;
}

module.exports = { buildQueue, saveDecision, classify, CHOICES, DECISIONS_PATH };

if (require.main === module) {
  const q = buildQueue();
  console.log(`${q.totals.ids} ids pendents agrupats en ${q.totals.bundles} paquets de revisió`);
  console.log(`decidits: ${q.totals.decided} paquets (${q.totals.idsDecided} ids) · desactualitzats: ${q.totals.stale}`);
  for (const [k, v] of Object.entries(q.byKind).sort((a, b) => b[1].ids - a[1].ids)) {
    console.log(`  ${k.padEnd(18)} ${String(v.bundles).padStart(4)} paquets -> ${String(v.ids).padStart(5)} ids`);
  }
  console.log('\nEls 12 més grans:');
  for (const b of q.bundles.slice(0, 12)) {
    console.log(`  ${String(b.idCount).padStart(4)} ids · ${b.decision.padEnd(10)} · ${b.label}`);
  }
}
