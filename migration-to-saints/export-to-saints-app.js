#!/usr/bin/env node
// Writes the resolved Catalan content into saints-app's real `commons/ca/`.
//
// This is the last step of the panel's "refresh" pipeline, and it used to live only inside
// `webui/server.js` — a file that starts an HTTP server the moment it is required, so the
// export could not be run on its own. That mattered the first time the join was re-run from
// the terminal: the only way to publish the result was to make the panel redo the entire
// pipeline, litcal build included. Now the panel requires this and so can a person:
//
//     node migration-to-saints/export-to-saints-app.js [--dry-run]
//
// It MERGES rather than overwrites, so a manual fix made in saints-app survives a re-export
// of untouched keys — but our own keys always win, because they are the ones that passed the
// join's "every observation of this id agrees" check. A file that came out empty is skipped,
// never used to blank the destination.

const fs = require('fs');
const path = require('path');
const { DECIDED_EMPTY } = require('./lib/preces-alignment');

const CPL_APP_ROOT = path.resolve(__dirname, '..');
const SAINTS_APP_ROOT = '/Users/pau/projects/saints/saints-app';
const DAY_TEXTS_DIR = path.join(SAINTS_APP_ROOT, 'src/store/db/day_specific_texts');
const SAINTS_APP_COMMONS_CA = path.join(DAY_TEXTS_DIR, 'commons/ca');
const SAINTS_APP_COMMONS_ES = path.join(DAY_TEXTS_DIR, 'commons/es');
const STATIC_TRANSLATIONS_DIR = path.join(CPL_APP_ROOT, 'migration-to-saints/static-translations');
// Cells cpl-app never fills that hold a text the CPL does have, in another cell: the gradual
// psalms of the little hours of three solemnities (D-013). Copied from that cell, not retyped,
// so a correction to the source reaches the copy.
const COPIED_CELLS = path.join(CPL_APP_ROOT, 'migration-to-saints/copied-cells.json');
const COMMONS_DIR = path.join(CPL_APP_ROOT, 'migration-to-saints/output/commons-ca');
const COMMON_SOURCED = path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-common-sourced.json');
// The cells the join holds: dates sharing the id disagree, so it leaves them out (MIGRA-026).
const PENDING = path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-pending-review.json');
// Compline does not live in day_specific_texts: seven files per language, one per weekday.
// No shared id space, so it is a plain file copy rather than a merge — there is nothing in
// the destination that could be someone else's work (see FASES.md, fase 2).
const COMPLINE_DIR = path.join(CPL_APP_ROOT, 'migration-to-saints/output/compline-ca');
const SAINTS_APP_COMPLINE_CA = path.join(SAINTS_APP_ROOT, 'src/store/db/compline/ca');

// A held cell has no Catalan: the join leaves it out because the days sharing it disagree, and
// the export used to merge without ever taking a key away, so a text an earlier run had written
// stayed in saints-app after the join stopped vouching for it. On 6 October 2026 that was 192
// cells: the Saturday IV first Vespers of 10 October showed Our Lady of the Pillar's (MIGRA-026).
// A copied cell or a static translation is put back afterwards, and wins.
function clearHeld(dest, heldIds, resolved) {
  const cleared = [];
  for (const id of heldIds) {
    if (id in resolved || !(id in dest)) continue;
    delete dest[id];
    cleared.push(id);
  }
  return cleared;
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

// Ids the Common supplied rather than cpl-app (written by the join). These are ADDITIVE
// ONLY: they may fill an empty cell, never change one that already carries Catalan text.
//
// The join's usual rule — ours wins, because it survived "every observation of this id
// agrees" — does not hold for them. cpl-app never renders these cells, so the Common is the
// only voice in the room and wins unopposed, including over a value an earlier run got
// right. Measured on the first full run: of 49 keys it would have changed, some were real
// corrections (`responsorios/2789`, where the Spanish reads "Que todos los pueblos proclamen
// la sabiduría de los santos" and the stored Catalan said "Sobre teu, Jerusalem") and some
// were plain wrong (`preces_contenido/9519`, the Thursday Eucharist petitions, which the
// Spanish keeps and the Common would have replaced). Telling those apart needs a judgement
// this script has no business making, so it makes neither: it keeps what is there and
// reports the disagreement.
function exportResolvedContentToSaintsApp({ dryRun = false } = {}) {
  if (!dryRun) fs.mkdirSync(SAINTS_APP_COMMONS_CA, { recursive: true });
  const report = { filesWritten: [], keysAdded: 0, keysChanged: 0, keysCleared: 0, commonHeld: [], perFile: {}, dryRun };
  const commonSourced = readJsonSafe(COMMON_SOURCED) || {};
  const pending = readJsonSafe(PENDING) || {};

  const write = (destPath, dest, name) => {
    if (!dryRun) fs.writeFileSync(destPath, JSON.stringify(dest, null, 2), 'utf8');
    report.filesWritten.push(name);
  };

  if (fs.existsSync(COMMONS_DIR)) {
    for (const f of fs.readdirSync(COMMONS_DIR).sort()) {
      const src = readJsonSafe(path.join(COMMONS_DIR, f)) || {};
      if (Object.keys(src).length === 0) continue;
      const destPath = path.join(SAINTS_APP_COMMONS_CA, f);
      const dest = readJsonSafe(destPath) || {};
      const table = f.replace('.json', '');
      const fromCommon = new Set(commonSourced[table] || []);
      const before = { added: 0, changed: 0, held: 0, total: Object.keys(dest).length };
      for (const [k, v] of Object.entries(src)) {
        if (!(k in dest)) { report.keysAdded++; before.added++; }
        else if (dest[k] !== v) {
          if (fromCommon.has(k)) {
            report.commonHeld.push({ table, id: k, kept: dest[k], common: v });
            before.held++;
            continue;
          }
          report.keysChanged++; before.changed++;
        }
        dest[k] = v;
      }
      // And the cells Pau decided to leave without Catalan, which the join never writes either.
      const decidedEmpty = [...DECIDED_EMPTY].filter((c) => c.startsWith(`${table}/`)).map((c) => c.split('/')[1]);
      const cleared = clearHeld(dest, [...(pending[table] || []).map((x) => String(x.id)), ...decidedEmpty], src);
      before.cleared = cleared.length;
      report.keysCleared += cleared.length;
      report.perFile[f] = { ...before, after: Object.keys(dest).length };
      write(destPath, dest, f);
    }
  }

  if (fs.existsSync(STATIC_TRANSLATIONS_DIR)) {
    for (const f of fs.readdirSync(STATIC_TRANSLATIONS_DIR).sort()) {
      const targetName = f.replace('.ca.json', '.json');
      const src = readJsonSafe(path.join(STATIC_TRANSLATIONS_DIR, f)) || {};
      const destPath = path.join(SAINTS_APP_COMMONS_CA, targetName);
      const dest = readJsonSafe(destPath) || {};
      for (const [k, v] of Object.entries(src)) {
        if (!(k in dest)) report.keysAdded++;
        dest[k] = v;
      }
      write(destPath, dest, targetName);
    }
  }

  if (fs.existsSync(COMPLINE_DIR)) {
    if (!dryRun) fs.mkdirSync(SAINTS_APP_COMPLINE_CA, { recursive: true });
    for (const f of fs.readdirSync(COMPLINE_DIR).sort()) {
      const src = readJsonSafe(path.join(COMPLINE_DIR, f));
      if (!src) continue;
      if (!dryRun) {
        fs.writeFileSync(path.join(SAINTS_APP_COMPLINE_CA, f), JSON.stringify(src, null, 2), 'utf8');
      }
      report.filesWritten.push(`compline/${f}`);
      report.perFile[`compline/${f}`] = { added: Object.keys(src).length, changed: 0, held: 0, total: 0, after: Object.keys(src).length };
    }
  }

  // After the join and the static translations, so the copy takes the source's final text.
  const copied = (readJsonSafe(COPIED_CELLS) || {}).cells || {};
  report.copyMissing = [];
  const tables = {};
  const table = (name) => {
    if (!tables[name]) tables[name] = readJsonSafe(path.join(SAINTS_APP_COMMONS_CA, `${name}.json`)) || {};
    return tables[name];
  };
  const touched = new Set();
  for (const [cell, { from }] of Object.entries(copied)) {
    const [t, id] = cell.split('/');
    const [ft, fid] = from.split('/');
    const value = table(ft)[fid];
    // A source without Catalan leaves the copy alone rather than blanking it.
    if (value == null) { report.copyMissing.push({ cell, from }); continue; }
    const dest = table(t);
    if (!(id in dest)) report.keysAdded++;
    else if (dest[id] !== value) report.keysChanged++;
    dest[id] = value;
    touched.add(t);
  }
  for (const t of touched) write(path.join(SAINTS_APP_COMMONS_CA, `${t}.json`), tables[t], `${t}.json (còpies)`);

  const latinSrc = path.join(SAINTS_APP_COMMONS_ES, 'himnos_latinos.json');
  const latinDest = path.join(SAINTS_APP_COMMONS_CA, 'himnos_latinos.json');
  if (fs.existsSync(latinSrc) && !fs.existsSync(latinDest)) {
    if (!dryRun) fs.copyFileSync(latinSrc, latinDest);
    report.filesWritten.push('himnos_latinos.json (còpia d’es, invariant)');
  }

  return report;
}

module.exports = { exportResolvedContentToSaintsApp, clearHeld, SAINTS_APP_COMMONS_CA };

if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const r = exportResolvedContentToSaintsApp({ dryRun });
  console.log(dryRun ? 'ASSAIG — no s’ha escrit res\n' : `-> ${SAINTS_APP_COMMONS_CA}\n`);
  for (const [f, s] of Object.entries(r.perFile)) {
    const delta = [
      s.added ? `+${s.added} noves` : '',
      s.changed ? `${s.changed} canviades` : '',
      s.held ? `${s.held} del Comú retingudes (la casella ja tenia text)` : '',
      s.cleared ? `${s.cleared} buidades (retingudes)` : '',
    ].filter(Boolean).join(' · ') || 'sense canvis';
    console.log(`  ${f.replace('.json', '').padEnd(30)} ${String(s.total).padStart(5)} → ${String(s.after).padStart(5)}   ${delta}`);
  }
  console.log(`\n${r.filesWritten.length} fitxers · ${r.keysAdded} claus noves · ${r.keysChanged} actualitzades · ${r.keysCleared} buidades`);
  if (r.copyMissing.length) {
    console.log(`\n${r.copyMissing.length} còpies sense text a l'origen, no escrites: ` +
      r.copyMissing.map((c) => `${c.cell} ← ${c.from}`).join(', '));
  }
  if (r.commonHeld.length) {
    const out = path.join(CPL_APP_ROOT, 'migration-to-saints/output/export-common-held.json');
    if (!dryRun) fs.writeFileSync(out, JSON.stringify(r.commonHeld, null, 2), 'utf8');
    console.log(
      `\n${r.commonHeld.length} caselles on el Comú discrepa del que ja hi ha. No s'han tocat: ` +
        `s'ha conservat el text existent.\n  -> ${out}`
    );
  }
}
