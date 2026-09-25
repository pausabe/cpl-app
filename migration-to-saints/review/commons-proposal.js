// "The cells cpl-app supposedly has no text for" — and where that text actually is.
//
// On a memorial cpl-app renders the ferial office and never reaches for the Common: all 527
// rows of `santsMemories` carry `Categoria = '0000'`, and `ObtainCommonOffices` returns an
// empty office for that value. That is a deliberate editorial choice (OGLH 235b), not a bug.
//
// But the Catalan Common texts DO exist in cpl-app.db, in `OficisComuns` — 48 rows, one per
// Common per liturgical season, carrying exactly the fields the saint's tab of saints-app
// asks for: short reading, responsory, intercessions, gospel antiphons. The join never
// harvests them, because it only records what cpl-app renders.
//
// This proposes, cell by cell, which Common row supplies each of a day's `missing` cells.
// It is a PROPOSAL: the Common is inferred from the saint's title and then, wherever a
// citation is available on both sides, checked against it. Cells whose Common could not be
// confirmed by a citation are reported as low confidence rather than silently accepted.

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const REPO = path.resolve(__dirname, '../..');
const dayCheck = require(path.join(REPO, 'migration-to-saints/day-check'));
const { fingerprint } = require(path.join(REPO, 'migration-to-saints/lib/citation-key'));
const commonOffice = require(path.join(REPO, 'migration-to-saints/lib/common-office'));
const DB_PATH = path.join(REPO, 'src/assets/db/cpl-app.db');
const ES_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts/commons/es';

const RUN = process.env.RUN_DIR || path.join(__dirname, 'run');
fs.mkdirSync(RUN, { recursive: true });
const OUT = process.env.OUT || path.join(RUN, 'commons-proposal.json');
const ROWS = process.env.ROWS || path.join(RUN, 'review-rows.json');

// El Comú, com es tria i què conté: lib/common-office.js. Aquí només es proposa; qui
// l'escriu de veritat és el join, i han de dir exactament el mateix.
const esCache = {};
function esText(table, id) {
  if (!(table in esCache)) {
    try { esCache[table] = JSON.parse(fs.readFileSync(path.join(ES_DIR, `${table}.json`), 'utf8')); }
    catch { esCache[table] = null; }
  }
  const t = esCache[table];
  if (!t) return null;
  const v = t[String(id)];
  return v == null ? null : String(v).replace(/[$_]/g, '').replace(/\s+/g, ' ').trim();
}

// Citations are the one thing comparable across languages, so they are what turns the
// title-based guess into a checked answer. Book and chapter only, from the same fingerprint
// the review compares with — a hand-rolled version here read "He 13, 7-9a" and "Hb 13, 7-9a"
// as different books and the citation evidence never fired.
function citeKey(s) {
  const f = s ? fingerprint(s) : null;
  return f ? f.token : null;
}

function build() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const { commons, byCategoria } = commonOffice.loadCommons(db);
  const data = JSON.parse(fs.readFileSync(ROWS, 'utf8'));
  const ctx = dayCheck.buildContext({ language: 'ca' });

  const days = [];
  for (const day of data.days) {
    const check = dayCheck.checkDay(day.date, { ctx });
    const missing = [];
    for (const h of check.hours) for (const f of h.fields) if (f.status === 'missing') missing.push({ hour: h.hour, ...f });
    if (!missing.length) { days.push({ date: day.date, missing: 0, covered: 0, proposals: [] }); continue; }

    // The short reading's citation as the Spanish index has it, for each Hour — the evidence
    // that decides which Common this day belongs to. Read whatever the cell's status is: on a
    // memorial it is usually `conflict`, not `missing`, and it carries the citation all the same.
    const want = {};
    for (const h of check.hours) {
      const f = h.fields.find((x) => x.table === 'lectura_breve_citas');
      const es = f ? esText('lectura_breve_citas', f.id) : null;
      if (es) want[h.hour] = citeKey(es);
    }

    const suffix = commonOffice.seasonSuffix(day.cplSpecificTime);
    const { row, pickedBy, family, titleWouldSay } = commonOffice.pickCommonRow({
      title: day.cplTitle, suffix, commons, byCategoria, want, citeKey,
    });

    const proposals = [];
    if (row) {
      // Els mateixos valors que escriurà el join, indexats per taula perquè és com hi
      // arriben les caselles que falten.
      const byField = commonOffice.poolByField(row);
      const FIELD_TO_TABLE = {
        lectura_biblica_cita: 'lectura_breve_citas', lectura_biblica: 'lectura_breve_textos',
        responsorios: 'responsorios', cantico_evangelico_antifona: 'cantico_evangelico_antifonas',
        preces_intro: 'preces_intro', preces_respuesta: 'preces_respuesta',
        preces_contenido: 'preces_contenido',
      };
      const pool = {};
      for (const [hour, fields] of Object.entries(byField)) {
        pool[hour] = {};
        for (const [field, value] of Object.entries(fields)) {
          pool[hour][FIELD_TO_TABLE[field]] = Array.isArray(value) ? value : [value];
        }
      }

      // Each cell takes the slot it actually occupies (`index`), never a running count of the
      // cells seen so far. A responsory whose 5/6 is already filled leaves a hole in `missing`,
      // and a counter would slide every cell after it down one — putting the "Glòria al Pare"
      // of slot 5 into slot 6, where the repeated response belongs.
      for (const m of missing) {
        const bucket = (pool[m.hour] || {})[m.table];
        if (!bucket) continue;
        const i = Number.isInteger(m.index) ? m.index : 0;
        const value = bucket[i];
        if (value == null || !String(value).trim()) continue;
        const es = esText(m.table, m.id);
        // Where both sides carry a citation, the match is checked, not guessed.
        const checkable = m.table === 'lectura_breve_citas';
        proposals.push({
          hour: m.hour, table: m.table, id: m.id, label: m.label,
          value: String(value),
          es,
          confirmedByCitation: checkable ? citeKey(value) === citeKey(es) : null,
        });
      }
    }

    days.push({
      date: day.date,
      title: day.cplTitle,
      common: row ? {
        categoria: row.Categoria,
        name: String(row.nomMemoria).replace(/\n/g, ' · '),
        pickedBy,
        family,
        titleWouldSay,
      } : null,
      missing: missing.length,
      covered: proposals.length,
      citationChecks: proposals.filter((p) => p.confirmedByCitation !== null),
      proposals,
    });
  }

  fs.writeFileSync(OUT, JSON.stringify({ days }, null, 2), 'utf8');
  let tm = 0, tc = 0;
  for (const d of days) {
    tm += d.missing; tc += d.covered;
    const chk = d.citationChecks || [];
    const okChk = chk.filter((c) => c.confirmedByCitation).length;
    const how = d.common && d.common.pickedBy === 'citation' ? `  · pel Comú de la cita, no pel títol (el títol deia «${d.common.titleWouldSay}»)` : '';
    console.log(`${d.date}  ${String(d.covered).padStart(2)}/${String(d.missing).padStart(2)} cobertes  ${d.common ? d.common.categoria + ' ' + d.common.name : '(cap comú inferit)'}${chk.length ? `  · cita comprovada ${okChk}/${chk.length}` : ''}${how}`);
  }
  console.log(`\ntotal: ${tc}/${tm} caselles sense dades tenen candidat al Comú`);
  console.log(`-> ${OUT}`);
}

build();
