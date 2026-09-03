// The Common of the Saints as a source of content, for the cells cpl-app never fills.
//
// On a memorial cpl-app renders the weekday office: all 527 rows of `santsMemories` carry
// `Categoria = '0000'` and `ObtainCommonOffices` returns an empty office for that value, so
// the short reading, responsory and intercessions come from the feria. That is licit — OGLH
// 235b allows "from the Common OR from the current weekday" — and it is what the Catalan
// reference edition does. It is NOT a bug, and it is not being changed: see
// `decisions/D-001-el-comu-a-les-memories.md`.
//
// But saints-app is a different surface. Its memorial tab shows the Common in Spanish, and
// the join, which only records what cpl-app RENDERS, can never fill the Catalan half of it.
// Hence this second source: the Catalan Common texts do exist in `cpl-app.db`, in
// `OficisComuns` (48 rows, one per Common per season), carrying exactly the fields that tab
// asks for. Decided on 3 September 2026: Catalan follows the Common in saints-app, like
// Spanish, even though cpl-app itself does not.

// Which Common a memorial belongs to, from its own title. Ordered: the first match wins, so
// the more specific tests come first (a martyr-virgin before a virgin, a doctor before the
// bishop or priest they also were). This order is a heuristic and it is WRONG on its own for
// anyone who wears two hats — see pickCommonRow, where the citation overrules it.
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
//
// Read the codes, not words that look like them. `SpecificLiturgyTimeType` spells Eastertide
// `P_SETMANES` and `P_OCTAVA`, Lent `Q_SETMANES`, Advent `A_SETMANES` — so testing for
// "PASQUA", "LENT" or "ADVENT" matched almost nothing and every season fell through to
// Ordinary Time. Harmless while this only fed a proposal on an Ordinary Time day; not
// harmless once the join writes from it, where it put the Ordinary Pastors' responsory into
// `responsorios/2777`, a 10-May cell whose Spanish sibling ends "Aleluya, aleluya".
//
// The one code that does not go by its own initial is `Q_DIUM_PASQUA`: Easter Sunday is
// filed under the Lent prefix and belongs to Eastertide.
const SEASON_BY_CODE = {
  P_OCTAVA: 'P', P_SETMANES: 'P', Q_DIUM_PASQUA: 'P',
  Q_CENDRA: 'Q', Q_SETMANES: 'Q', Q_DIUM_RAMS: 'Q', Q_SET_SANTA: 'Q', Q_TRIDU: 'Q',
  A_SETMANES: 'A', A_FERIES: 'A', N_OCTAVA: 'A', N_ABANS: 'A',
  O_ORDINAR: 'O',
};

function seasonSuffix(specificLiturgyTime) {
  return SEASON_BY_CODE[String(specificLiturgyTime || '').trim()] || 'O';
}

function loadCommons(db) {
  const commons = db.prepare('SELECT * FROM OficisComuns').all();
  return { commons, byCategoria: new Map(commons.map((c) => [c.Categoria, c])) };
}

// Which Common the day actually uses — evidence first, heuristic only to break the tie.
//
// `want` carries the short reading's citation as the Spanish index has it, per Hour, already
// reduced to a `fingerprint().token`. It is the one currency that crosses languages, and it
// settles the cases the title gets wrong: sant Gregori el Gran is "papa i doctor de
// l'Església", so the doctors' test fires first and the title lands on 07a — while the
// Spanish cell reads `Hb 13, 7-9a`, the Pastors' reading, not the doctors' `Sa 7, 13-14`.
//
// The citation identifies a FAMILY, not a single row: 06a/06b/06c/06d all share that reading.
// So COMMON_BY_TITLE runs again restricted to the family's codes, which is how "papa" gets
// its turn once "doctor" has been ruled out. With no citation on either Hour, the title
// decides alone and `pickedBy` says so.
function pickCommonRow({ title, suffix, commons, byCategoria, want = {}, citeKey }) {
  const guess = COMMON_BY_TITLE.find(([re]) => re.test(title || ''));
  const guessLabel = guess ? guess[2] : null;
  const byTitle = guess
    ? byCategoria.get(guess[1] + suffix) || byCategoria.get(`${guess[1]}O`)
    : null;

  const matches = (s) => commons.filter((row) => {
    if (!String(row.Categoria).endsWith(s)) return false;
    return (want.Laudes && citeKey(row.citaLBLaudes) === want.Laudes)
        || (want.Vespers && citeKey(row.citaLBVespres) === want.Vespers);
  });
  const family = (!want.Laudes && !want.Vespers)
    ? []
    : (() => { const own = matches(suffix); return own.length || suffix === 'O' ? own : matches('O'); })();

  if (!family.length) {
    return { row: byTitle, pickedBy: byTitle ? 'title' : null, family: [], titleWouldSay: guessLabel };
  }
  const codes = new Set(family.map((r) => r.Categoria));
  for (const [re, code] of COMMON_BY_TITLE) {
    if (!re.test(title || '')) continue;
    for (const s of [suffix, 'O']) {
      if (codes.has(code + s)) {
        const row = byCategoria.get(code + s);
        return {
          row,
          pickedBy: byTitle && byTitle.Categoria === row.Categoria ? 'title+citation' : 'citation',
          family: [...codes],
          titleWouldSay: guessLabel,
        };
      }
    }
  }
  return { row: family[0], pickedBy: 'citation', family: [...codes], titleWouldSay: guessLabel };
}

const GLORIA_PATRI_SHORT = 'Glòria al Pare, i al Fill, i a l’Esperit Sant.';

// The six cells saints-app stores a short responsory in, from the three parts the database
// keeps it as. Same expansion the join applies to cpl-app's own responsory object, so a
// proposed responsory lines up slot for slot with a rendered one.
function expandResponsoryParts(a, b, c) {
  const full = `${a || ''} ${b || ''}`.trim();
  return [
    `℣. ${a || ''} * ${b || ''}`,
    `℟. ${full}`,
    `℣. ${c || ''}`,
    `℟. ${b || ''}`,
    `℣. ${GLORIA_PATRI_SHORT}`,
    `℟. ${full}`,
  ];
}

// The prayers blob, as both cpl-app's rendered Hour and `OficisComuns` store it: first
// paragraph minus its last line = intro; that last line = the refrain; middle paragraphs each
// split on the em-dash into (petition, closing); final paragraph = the Pare Nostre invitation,
// which saints-app fills from a static table instead. Confirmed against
// bridget_of_sweden_religious, 2026-07-23 — see PLAN.md section 5.
function parsePrayers(blob) {
  if (!blob) return null;
  const paragraphs = String(blob).split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) return null;
  const firstLines = paragraphs[0].split('\n').map((l) => l.trim()).filter(Boolean);
  const intro = firstLines.slice(0, -1).join('\n');
  const respuesta = firstLines[firstLines.length - 1];
  const contenido = paragraphs.slice(1, -1).map((p) => {
    const idx = p.indexOf('—');
    if (idx === -1) return { peticion: p.trim(), cierre: '' };
    return { peticion: p.slice(0, idx).trim(), cierre: p.slice(idx + 1).replace(/^\t/, '').trim() };
  });
  return { intro, respuesta, contenido };
}

// What one Common row offers, keyed by the index field names saints-app uses — the same names
// the join's observeHour reads off an entry, so a caller can observe these straight into the
// memorial cells.
//
// Deliberately absent: `himno` (the Common carries both a Latin and a Catalan hymn and the
// index has two separate cells for them — a judgement of its own, not settled here) and
// `invitacion_padrenuestro` (the join does not observe that table for anybody yet).
function poolByField(row) {
  if (!row) return { Laudes: {}, Vespers: {} };
  const build = (cita, lectura, r1, r2, r3, pregaries, antifona) => {
    const prayers = parsePrayers(pregaries);
    const out = {
      lectura_biblica_cita: cita,
      lectura_biblica: lectura,
      responsorios: expandResponsoryParts(r1, r2, r3),
      cantico_evangelico_antifona: antifona,
    };
    if (prayers) {
      out.preces_intro = prayers.intro;
      out.preces_respuesta = prayers.respuesta;
      out.preces_contenido = prayers.contenido.map((p) => `${p.peticion}\n${p.cierre}`);
    }
    return out;
  };
  return {
    Laudes: build(row.citaLBLaudes, row.lecturaBreuLaudes,
      row.respBreuLaudes1, row.respBreuLaudes2, row.respBreuLaudes3,
      row.pregariesLaudes, row.antZacaries),
    Vespers: build(row.citaLBVespres, row.lecturaBreuVespres,
      row.respBreuVespres1, row.respBreuVespres2, row.respBreuVespres3,
      row.pregariesVespres, row.antMaria),
  };
}

// Which fields the Common takes over on a memorial whose office is proper — the days where
// saints-app shows a single tab (`memorialFerial.isProperOnly`). There the memorial's cell
// and the weekday's are the SAME cell, so the two sources compete instead of sharing, and
// only one of them can be observed.
//
// Two conditions, and both are needed:
//
//   - `fromFerial` — cpl-app took the field from the weekday, so it carries no proper text
//     of the saint that would be lost. A field the memorial supplies itself (the collect
//     always, the gospel antiphon often) is never touched.
//   - `pickedBy` names the citation. On a day with two tabs a wrong Common only fills a cell
//     nobody else can fill; here it would displace text that is already on screen, so the
//     title's guess is not enough. The Spanish cell's own short-reading citation has to name
//     the Common's family — which is also the proof that eprex points this day at a Common
//     cell at all, and not at the weekday's. On 2 January it reads `Hb 13, 7-9a`; if it read
//     the weekday's `Is 49, 8-9` no family would match, `pickedBy` would fall back to
//     'title', and this returns nothing rather than guessing.
//
// Empty set means "change nothing": the day keeps behaving exactly as before.
function commonOverrides({ pool, fromFerial, pickedBy }) {
  const out = new Set();
  if (!pool || !fromFerial || !fromFerial.size) return out;
  if (pickedBy !== 'citation' && pickedBy !== 'title+citation') return out;
  for (const [field, value] of Object.entries(pool)) {
    if (!fromFerial.has(field)) continue;
    const has = Array.isArray(value) ? value.some(usable) : usable(value);
    if (has) out.add(field);
  }
  return out;
}

// A `-` in `OficisComuns` means the same thing it means in `santsMemories`: "not here, look
// elsewhere". Never a text to write.
function usable(value) {
  const s = value == null ? '' : String(value).trim();
  return s !== '' && s !== '-';
}

module.exports = {
  COMMON_BY_TITLE, seasonSuffix, loadCommons, pickCommonRow,
  expandResponsoryParts, parsePrayers, poolByField, commonOverrides, usable, GLORIA_PATRI_SHORT,
};
