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
const DB_PATH = path.join(REPO, 'src/Assets/db/cpl-app.db');
const ES_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts/commons/es';

const RUN = process.env.RUN_DIR || path.join(__dirname, 'run');
fs.mkdirSync(RUN, { recursive: true });
const OUT = process.env.OUT || path.join(RUN, 'commons-proposal.json');
const ROWS = process.env.ROWS || path.join(RUN, 'review-rows.json');

// Which Common a memorial belongs to, from its own title. Ordered: the first match wins,
// so the more specific tests come first (a martyr-virgin before a virgin, a doctor before
// the bishop/priest they also were).
const COMMON_BY_TITLE = [
  [/mare de d[ée]u|verge maria|santa maria/i, '02a', 'Comú de la Mare de Déu'],
  [/ap[òo]stol|evangelista/i, '03a', 'Comú d’apòstols'],
  [/doctora? de l/i, '07a', 'Comú de doctors de l’Església'],
  [/m[àa]rtirs/i, '04a', 'Comú de màrtirs (diversos)'],
  [/verge i m[àa]rtir|m[àa]rtir.*verge/i, '05b', 'Comú de màrtirs (màrtir verge)'],
  [/m[àa]rtir/i, '05a', 'Comú de màrtirs (un màrtir)'],
  [/papa/i, '06c', 'Comú de pastors (papa)'],
  [/bisbes/i, '06d', 'Comú de pastors (diversos)'],
  [/bisbe/i, '06b', 'Comú de pastors (bisbe)'],
  [/prevere|diaca/i, '06a', 'Comú de pastors (prevere)'],
  [/verge/i, '08a', 'Comú de verges (una)'],
  [/abat|monjo|religi[óo]s|ermit[àa]/i, '09c', 'Comú d’homes sants (religiosos)'],
];

// The season suffix of a Common row, from cpl-app's own liturgical-time code.
function seasonSuffix(specificLiturgyTime) {
  const t = String(specificLiturgyTime || '');
  if (/QUARESMA|LENT/i.test(t)) return 'Q';
  if (/PASQUA|EASTER/i.test(t)) return 'P';
  if (/ADVENT|NADAL|CHRISTMAS/i.test(t)) return 'A';
  return 'O';
}

function pickCommon(title) {
  for (const [re, code, label] of COMMON_BY_TITLE) if (re.test(title || '')) return { code, label };
  return null;
}

const GLORIA = 'Glòria al Pare, i al Fill, i a l’Esperit Sant.';

// Same expansion the resolver uses, so a proposed responsory lines up with the six cells
// saints-app stores it in.
function expandResponsory(a, b, c) {
  const full = `${a || ''} ${b || ''}`.trim();
  return [`℣. ${a || ''} * ${b || ''}`, `℟. ${full}`, `℣. ${c || ''}`, `℟. ${b || ''}`, `℣. ${GLORIA}`, `℟. ${full}`];
}

// Same parse the resolver uses for the prayers blob.
function intercessions(blob) {
  if (!blob) return [];
  const paragraphs = String(blob).split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.slice(1, -1).map((p) => {
    const i = p.indexOf('—');
    return i === -1 ? p.trim() : `${p.slice(0, i).trim()}\n${p.slice(i + 1).replace(/^\t/, '').trim()}`;
  });
}

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
// title-based guess into a checked answer. "Sa 7, 13-14" ≡ "Sb 7, 13-14".
function citeKey(s) {
  if (!s) return null;
  return String(s)
    .replace(/^cf\.?\s*/i, '')
    .replace(/\b(Sa|Sb)\b/, 'W')
    .replace(/[\s.]/g, '')
    .toLowerCase();
}

function build() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const commons = db.prepare('SELECT * FROM OficisComuns').all();
  const byCategoria = new Map(commons.map((c) => [c.Categoria, c]));
  const data = JSON.parse(fs.readFileSync(ROWS, 'utf8'));
  const ctx = dayCheck.buildContext({ language: 'ca' });

  const days = [];
  for (const day of data.days) {
    const check = dayCheck.checkDay(day.date, { ctx });
    const missing = [];
    for (const h of check.hours) for (const f of h.fields) if (f.status === 'missing') missing.push({ hour: h.hour, ...f });
    if (!missing.length) { days.push({ date: day.date, missing: 0, covered: 0, proposals: [] }); continue; }

    const guess = pickCommon(day.cplTitle);
    const suffix = seasonSuffix(day.cplSpecificTime);
    const row = guess ? byCategoria.get(guess.code + suffix) || byCategoria.get(`${guess.code}O`) : null;

    const proposals = [];
    if (row) {
      const pool = {
        Laudes: {
          lectura_breve_citas: [row.citaLBLaudes],
          lectura_breve_textos: [row.lecturaBreuLaudes],
          responsorios: expandResponsory(row.respBreuLaudes1, row.respBreuLaudes2, row.respBreuLaudes3),
          preces_contenido: intercessions(row.pregariesLaudes),
          cantico_evangelico_antifonas: [row.antZacaries],
        },
        Vespers: {
          lectura_breve_citas: [row.citaLBVespres],
          lectura_breve_textos: [row.lecturaBreuVespres],
          responsorios: expandResponsory(row.respBreuVespres1, row.respBreuVespres2, row.respBreuVespres3),
          preces_contenido: intercessions(row.pregariesVespres),
          cantico_evangelico_antifonas: [row.antMaria],
        },
      };
      // List fields are consumed in the order the cells appear, which is the order the
      // index stores them in.
      const cursor = {};
      for (const m of missing) {
        const bucket = (pool[m.hour] || {})[m.table];
        if (!bucket) continue;
        const k = `${m.hour}|${m.table}`;
        const i = cursor[k] || 0;
        cursor[k] = i + 1;
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
      common: row ? { categoria: row.Categoria, name: String(row.nomMemoria).replace(/\n/g, ' · '), guessedFrom: guess.label } : null,
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
    console.log(`${d.date}  ${String(d.covered).padStart(2)}/${String(d.missing).padStart(2)} cobertes  ${d.common ? d.common.categoria + ' ' + d.common.name : '(cap comú inferit)'}${chk.length ? `  · cita comprovada ${okChk}/${chk.length}` : ''}`);
  }
  console.log(`\ntotal: ${tc}/${tm} caselles sense dades tenen candidat al Comú`);
  console.log(`-> ${OUT}`);
}

build();
