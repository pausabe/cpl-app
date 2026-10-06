// What stands between each reviewed day and 100%, as plain text for the terminal.
//
// The HTML report is a page for scanning many days. This is the other use: take one day and
// work it down to zero. So it lists everything that is not yet right —every divergent field,
// every held cell, every cell with no source— with the finding that explains it or a loud
// "SENSE INVESTIGAR", and says nothing about the fields that already agree beyond counting
// them.
//
// Same data and same rules as build-report.js (the divergence predicate lives in findings.js
// for both), so the numbers here are the numbers there.
//
//   node day-gap.js                 every day in run/review-rows.json
//   node day-gap.js 2026-09-08      only these days

const fs = require('fs');
const path = require('path');
const { forDay, claimFor, VERDICTS, FINDINGS, isDivergent, isOnlyApp } = require('./findings');
const { DECIDED_EMPTY } = require('../lib/preces-alignment');

const RUN = process.env.RUN_DIR || path.join(__dirname, 'run');
const data = JSON.parse(fs.readFileSync(path.join(RUN, 'review-rows.json'), 'utf8'));
const proposal = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(RUN, 'commons-proposal.json'), 'utf8')); }
  catch { return { days: [] }; }
})();
const harvest = new Map(proposal.days.map((d) => [d.date, d]));

const WEEKDAY = ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'];
const HOURS = ['Office', 'Laudes', 'Tercia', 'Sexta', 'Nona', 'Vespers', 'Mass'];
const HOUR_LABELS = {
  Office: 'Ofici', Laudes: 'Laudes', Tercia: 'Tèrcia', Sexta: 'Sexta',
  Nona: 'Nona', Vespers: 'Vespres', Mass: 'Missa',
};

// Findings carry HTML for the page; the terminal wants the words.
const plain = (s) => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
const clip = (s, n = 110) => { const t = plain(s); return t.length > n ? `${t.slice(0, n - 1)}…` : t || '—'; };
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
const cell = (r) => `${r.table}/${r.id}`;
const findingById = new Map(FINDINGS.map((f) => [f.id, f]));

// What filling a held cell would cost. day-check's impactFor() counts from THIS day's text, and
// from the majority only when the day was not observed; the label has to say which (MIGRA-025).
const heldImpact = (im) => {
  if (!im || !im.days) return '';
  return im.dateNotObserved
    ? ` · triar la majoritària trenca ${im.breakDays} de ${im.days} dies`
    : ` · amb el text d’aquest dia, ${im.agreeDays} de ${im.days} dies bé i ${im.breakDays} malament`;
};

function day(d) {
  const out = [];
  const say = (s = '') => out.push(s);
  const wd = WEEKDAY[new Date(`${d.date}T12:00:00Z`).getUTCDay()];
  say(`══ ${d.date} · ${wd} · ${d.cplTitle || 'fèria'}${d.cplType ? ` (${d.cplType})` : ''} ══`);
  if (d.error || !d.rows) {
    say(`  no s'ha pogut resoldre: ${d.error || 'cpl-app no ha retornat cap ofici'}`);
    return out.join('\n');
  }
  say(`  clau ${d.allXKey} · litcal ${d.litcalId} · temps ${d.cplSpecificTime} setm. ${d.cplWeek}`);
  if (d.tabsDiffer) say('  memòria: la pestanya del sant segueix el Comú i cpl-app resa la fèria (D-001); es compara contra la casella ferial');

  // --- Contingut -------------------------------------------------------------------------
  const divergent = d.rows.filter((r) => isDivergent(d.date, r));
  const unexplained = divergent.filter((r) => !claimFor(d.date, r));
  say();
  say(`CONTINGUT — resen el mateix?  ${d.rows.length - divergent.length}/${d.rows.length} coincideixen (${pct(d.rows.length - divergent.length, d.rows.length)}%)`
    + ` · ${divergent.length} divergeixen · ${unexplained.length} sense investigar`);
  say(`  per hora: ${HOURS.map((h) => {
    const rows = d.rows.filter((r) => r.hour === h);
    if (!rows.length) return null;
    return `${HOUR_LABELS[h]} ${rows.filter((r) => isDivergent(d.date, r)).length}/${rows.length}`;
  }).filter(Boolean).join(' · ')}`);
  for (const r of divergent) {
    const fid = claimFor(d.date, r);
    const f = fid && findingById.get(fid);
    const tag = f ? `${fid} · v${f.verdict} ${VERDICTS[f.verdict].label}${f.resolved ? ' · corregit' : ''}` : 'SENSE INVESTIGAR';
    say(`  [${tag}] ${HOUR_LABELS[r.hour]} · ${r.label} · ${cell(r)} · ${r.match}${isOnlyApp(r) ? ' (només a l’app)' : ''} · ${r.channel}`);
    say(`      cpl-app : ${clip(r.cplClean)}`);
    say(`      saints  : ${clip(r.caClean || r.esClean)}${r.caClean ? '' : '  (es)'}`);
  }

  // --- Progrés ---------------------------------------------------------------------------
  const c = d.coverage;
  const hv = harvest.get(d.date) || { covered: 0, common: null };
  const reach = c.have + c.conflict + hv.covered;
  const nosource = Math.max(0, c.unreachable - hv.covered);
  say();
  say(`PROGRÉS — quant s'ha migrat?  ${c.have}/${reach} assolibles (${pct(c.have, reach)}%)`
    + ` · ${c.conflict} retingudes · ${hv.covered} per collir del Comú · ${nosource} sense font · ${c.total} caselles`);

  // Held cells, grouped by what holds them: one decision usually releases a whole group.
  const held = new Map();
  for (const r of d.rows.filter((x) => x.status === 'conflict')) {
    const k = (r.conflict && r.conflict.bundleId) || cell(r);
    if (!held.has(k)) held.set(k, []);
    held.get(k).push(r);
  }
  for (const rows of [...held.values()].sort((a, b) => b.length - a.length)) {
    const k = rows[0].conflict || {};
    const im = k.impact || {};
    const variants = (k.variants || []).map((v) => `${v.count}×«${clip(v.preview, 40)}»`).join(' / ');
    say(`  retingudes ×${rows.length} — ${k.cause || 'conflicte'} · decisió ${k.decision || '?'}`
      + ` · ${k.variantCount || '?'} variants (${variants})`
      + heldImpact(im));
    say(`      ${rows.map((r) => `${HOUR_LABELS[r.hour]} ${r.label} ${cell(r)}`).join(' · ')}`);
  }
  // A cell left without Catalan by one of Pau's decisions is not a gap: one line, not a row each.
  const decidedEmpty = d.rows.filter((r) => DECIDED_EMPTY.has(`${r.table}/${r.id}`));
  if (decidedEmpty.length) say(`  buides per decisió — ${decidedEmpty.length} (${decidedEmpty.map(cell).join(' · ')})`);
  const missing = d.rows.filter((r) => (r.status === 'missing' || r.status === 'notInAppYet')
    && !DECIDED_EMPTY.has(`${r.table}/${r.id}`));
  for (const r of missing) {
    say(`  ${r.status === 'missing' ? 'sense font' : 'encara no a l’app'} — ${HOUR_LABELS[r.hour]} ${r.label} ${cell(r)} · cpl «${clip(r.cplClean, 50)}» · es «${clip(r.esClean, 50)}»`);
  }
  if (hv.common) say(`  Comú que en podria donar: ${hv.common.name} (${hv.common.categoria}, triat per ${hv.common.pickedBy}) · cobreix ${hv.covered} de ${hv.missing}`);
  const blame = (d.blameSummary || []).filter((b) => b.fields);
  if (blame.length) {
    // The long tail is the same few verdicts over and over; the head is what to act on.
    const TOP = 8;
    say(`  celebracions darrere les retingudes (${blame.length}):`);
    for (const b of blame.sort((a, z) => z.fields - a.fields).slice(0, TOP)) {
      say(`      ${b.title} — ${b.fields} caselles${b.soleFields ? ` (${b.soleFields} només per ella)` : ''} · ${b.verdict}: ${b.verdictLabel}`);
    }
    if (blame.length > TOP) {
      const rest = {};
      for (const b of blame.slice(TOP)) rest[b.verdict] = (rest[b.verdict] || 0) + 1;
      say(`      i ${blame.length - TOP} més: ${Object.entries(rest).map(([v, n]) => `${n} ${v}`).join(' · ')}`);
    }
  }

  // --- Troballes -------------------------------------------------------------------------
  const fs_ = forDay(d.date);
  say();
  say(`TROBALLES DEL DIA (${fs_.length})`);
  for (const f of fs_) {
    say(`  ${f.id} · v${f.verdict} ${VERDICTS[f.verdict].label}${f.resolved ? ' · CORREGIT' : ''} · ${plain(f.headline)}`);
    if (f.fix) say(`      correcció: ${f.fix.where} — ${plain(f.fix.summary)}${f.fix.promptable ? ' [té prompt a fix-prompts.js]' : ''}`);
    else say('      sense correcció (no és error, o falta decidir)');
  }

  say();
  say(`DISTÀNCIA AL 100%: ${divergent.length} divergències (${unexplained.length} sense investigar)`
    + ` + ${c.conflict} retingudes + ${hv.covered} per collir + ${nosource} sense font`);
  return out.join('\n');
}

const only = process.argv.slice(2);
const days = data.days
  .filter((d) => !only.length || only.includes(d.date))
  .sort((a, b) => a.date.localeCompare(b.date));
if (!days.length) {
  console.error(`Cap dia ${only.join(', ')} a ${path.join(RUN, 'review-rows.json')} (hi ha: ${data.days.map((d) => d.date).join(', ')})`);
  process.exit(1);
}
console.log(days.map(day).join('\n\n'));
