// Day-by-day review driver: for each date, pairs cpl-app's real text with the cell
// saints-app reads, in BOTH languages, and attaches everything known about why a cell is
// withheld. Emits one JSON of rows for the report to be written from.
//
// The Catalan column is the migration target but is still mostly empty on these days; the
// Spanish column is complete and is the same cell, so it stands in as "what liturgical slot
// is this" when Catalan has nothing yet. See the plan for the three channels.

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const dayCheck = require(path.join(REPO, 'migration-to-saints/day-check'));
const dayCompare = require(path.join(REPO, 'migration-to-saints/day-compare'));
const { splitHeading } = require(path.join(REPO, 'migration-to-saints/lib/citation-headings'));
const { textKey } = require(path.join(REPO, 'migration-to-saints/lib/text-key'));

const RUN = process.env.RUN_DIR || path.join(__dirname, 'run');
fs.mkdirSync(RUN, { recursive: true });
const DATES = process.env.DATES
  ? process.env.DATES.split(',').map((s) => s.trim()).filter(Boolean)
  : ['2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24'];
const CPL_DUMP = process.env.CPL_DUMP || path.join(RUN, 'cpl-days.json');
const OUT = process.env.OUT || path.join(RUN, 'review-rows.json');

// The fields under review. Hymn, Latin hymn and the Our Father invitation are out of scope
// by instruction.
const IN_SCOPE = new Set([
  'primer_salmo_cita', 'primer_salmo_antifona', 'primer_salmo_texto',
  'segundo_salmo_cita', 'segundo_salmo_antifona', 'segundo_salmo_texto',
  'tercer_salmo_cita', 'tercer_salmo_antifona', 'tercer_salmo_texto',
  'lectura_biblica_cita', 'lectura_biblica',
  'responsorios',
  'cantico_evangelico_antifona',
  'preces_intro', 'preces_respuesta', 'preces_contenido',
  'oracion_final',
]);

// Fields whose value is a citation, not prose: these get the language-independent
// fingerprint treatment. Everything else is compared as text.
const CITATION_FIELDS = new Set([
  'primer_salmo_cita', 'segundo_salmo_cita', 'tercer_salmo_cita', 'lectura_biblica_cita',
]);

// --- Normalisation -------------------------------------------------------------------
//
// saints-app's stored text carries display markup that cpl-app has no equivalent for:
// `_italics_` around antiphons, `$℣. $` rubric markers in responsories. Stripping it is
// what lets the two sides be compared at all.
function stripMarkup(s) {
  if (s == null) return null;
  return String(s)
    .replace(/\$([^$]*)\$/g, '$1')   // $℣. $ -> ℣.
    .replace(/_/g, '')               // _italics_
    .replace(/\s+/g, ' ')
    .trim();
}

// The two sides spell one reference differently — "Salm 50\nOració de penediment" (Catalan,
// description on its own line) vs "Salmo 50: Misericordia, Dios mío" (Spanish, description
// after a colon). Both reduce to the bare reference.
function bareReference(value) {
  if (value == null) return null;
  const cleaned = stripMarkup(String(value).replace(/\r\n?/g, '\n'));
  // Catalan multi-line form first: splitHeading knows "Càntic" spans two lines.
  const viaHeading = splitHeading(String(value).replace(/\r\n?/g, '\n'));
  const candidate = viaHeading.reference && viaHeading.reference !== cleaned
    ? viaHeading.reference
    : cleaned;
  // Spanish inline form: everything after the first colon is the description.
  return candidate.split(':')[0].replace(/\s+/g, ' ').trim();
}

// Book keys are deliberately coarse: the question is "do the two sides name the same
// scripture", not "do they abbreviate it the same way".
//
// Matching happens on the token with spaces and dots removed, because the two sides differ
// exactly there and nowhere else: cpl-app writes "2Tm 2, 10-12a" and "1Jo 2, 3-6" where the
// Spanish writes "2 Tm 2, 10-12a" and "1 Jn 2, 3-6". Left space-sensitive, those read as
// different books and the row is reported as a divergence that isn't one.
const BOOK_ALIASES = {
  PS: ['salm', 'salmo', 'psalm', 'salms', 'salmos'],
  CANT: ['càntic', 'cantic', 'cántico', 'cantico'],
  GEN: ['gn', 'gènesi', 'genesis'], EXOD: ['ex', 'èxode', 'éxodo'],
  LEV: ['lv', 'levític', 'levítico'], NUM: ['nm', 'nombres', 'números'],
  DEUT: ['dt', 'deuteronomi', 'deuteronomio'], JOSH: ['js', 'josuè', 'josué'],
  '1SAM': ['1s', '1sa', '1sm', '1samuel'], '2SAM': ['2s', '2sa', '2sm', '2samuel'],
  '1KGS': ['1re', '1r', '1reis', '1reyes'], '2KGS': ['2re', '2r', '2reis', '2reyes'],
  '1CHR': ['1cr', '1crònicas', '1cròniques', '1crónicas'],
  '2CHR': ['2cr', '2crònicas', '2cròniques', '2crónicas'],
  TOB: ['tb', 'tobies', 'tobías'], JDT: ['jdt', 'judit'], EST: ['est', 'ester'],
  JOB: ['jb', 'job'], PROV: ['pr', 'proverbis', 'proverbios'],
  ECCL: ['coh', 'ecle', 'eclesiastès', 'eclesiastés'],
  WIS: ['sa', 'sb', 'saviesa', 'sabiduría', 'saviesa'],
  SIR: ['sir', 'ecli', 'eclesiàstic', 'eclesiástico'],
  IS: ['is', 'isaïes', 'isaías', 'isaias'], JER: ['jr', 'jer', 'jeremias', 'jeremías'],
  LAM: ['lm', 'lam'], BAR: ['ba', 'bar', 'baruc'],
  EZ: ['ez', 'ezequiel'], DAN: ['dn', 'daniel'], HOS: ['os', 'osees', 'oseas'],
  JOEL: ['jl', 'joel'], AMOS: ['am', 'amós', 'amos'], MIC: ['mi', 'miquees', 'miqueas'],
  HAB: ['ha', 'hab'], ZEPH: ['so', 'sof'], HAG: ['ag', 'ageu', 'ageo'],
  ZECH: ['za', 'zac'], MAL: ['ml', 'mal'],
  MATT: ['mt', 'mateu', 'mateo'], MARK: ['mc', 'marc', 'marcos'],
  LUKE: ['lc', 'lluc', 'lucas'], JOHN: ['jn', 'jo', 'joan', 'juan'],
  ACTS: ['ac', 'fets', 'hechos', 'hch'], ROM: ['rm', 'romans', 'romanos'],
  '1COR': ['1c', '1co', '1cor', '1corintis', '1corintios'],
  '2COR': ['2c', '2co', '2cor', '2corintis', '2corintios'],
  GAL: ['ga', 'gàl', 'gál', 'galates', 'gálatas'],
  EPH: ['ef', 'efesis', 'efesios'], PHIL: ['fl', 'flp', 'filipencs', 'filipenses'],
  COL: ['col', 'colossencs', 'colosenses'],
  '1THES': ['1te', '1tes', '1ts'], '2THES': ['2te', '2tes', '2ts'],
  '1TIM': ['1tm', '1ti', '1tim'], '2TIM': ['2tm', '2ti', '2tim'],
  TITUS: ['tt', 'tit'], PHLM: ['flm'], HEB: ['he', 'hb', 'hebreus', 'hebreos'],
  JAS: ['jm', 'st', 'jaume', 'santiago'],
  '1PET': ['1p', '1pe', '1pere', '1pedro'], '2PET': ['2p', '2pe', '2pere', '2pedro'],
  '1JN': ['1jn', '1jo', '1joan', '1juan'], '2JN': ['2jn', '2jo'], '3JN': ['3jn', '3jo'],
  JUDE: ['jud'], REV: ['ap', 'apoc', 'apocalipsi', 'apocalipsis'],
};

const ALIAS_TO_KEY = new Map();
for (const [key, aliases] of Object.entries(BOOK_ALIASES)) {
  for (const a of aliases) ALIAS_TO_KEY.set(a, key);
}

// Legacy prefix table, kept for the two headings that are words rather than abbreviations.
const BOOK_KEYS = [
  [/^(salm|salmo|psalm)s?\b/i, 'PS'],
  [/^(c[àa]ntic|c[áa]ntico)\b/i, 'CANT'],
  [/^(jr|jer|jerem[íi]as|jeremias)\b/i, 'JER'],
  [/^(is|isa[íi]as|isaias)\b/i, 'IS'],
  [/^(ez|ezequiel)\b/i, 'EZ'],
  [/^(dn|daniel)\b/i, 'DAN'],
  [/^(1cr|1\s*cr|1\s*cr[òo]nicas?|1\s*cr[òo]niques)\b/i, '1CHR'],
  [/^(2c|2\s*co|2\s*cor\w*)\b/i, '2COR'],
  [/^(1c|1\s*co|1\s*cor\w*)\b/i, '1COR'],
  [/^(rm|rom\w*)\b/i, 'ROM'],
  [/^(ga|g[àa]l\w*)\b/i, 'GAL'],
  [/^(ef|efesis|efesios)\b/i, 'EPH'],
  [/^(flp?|filip\w*)\b/i, 'PHIL'],
  [/^(col|colos\w*)\b/i, 'COL'],
  [/^(1te?s|1\s*te\w*)\b/i, '1THES'],
  [/^(2te?s|2\s*te\w*)\b/i, '2THES'],
  [/^(1tm|1\s*tim\w*)\b/i, '1TIM'],
  [/^(2tm|2\s*tim\w*)\b/i, '2TIM'],
  [/^(he|hb|hebreus|hebreos)\b/i, 'HEB'],
  [/^(jm|st|santiago|jaume)\b/i, 'JAS'],
  [/^(1pe?|1\s*pe\w*)\b/i, '1PET'],
  [/^(2pe?|2\s*pe\w*)\b/i, '2PET'],
  [/^(1jn|1\s*jo\w*)\b/i, '1JN'],
  [/^(ap|apoc\w*)\b/i, 'REV'],
  [/^(ac|fets|hechos|hch)\b/i, 'ACTS'],
  [/^(dt|deuteronomi\w*)\b/i, 'DEUT'],
  [/^(ex|[èe]xode|[ée]xodo)\b/i, 'EXOD'],
];

function bookKey(ref) {
  // The book name is an optional ordinal digit plus the word after it, which is where the
  // two sides disagree: "2 Tm 2, 10-12a" and "2Tm 2, 10-12a" both reduce to "2tm".
  const m = String(ref).match(/^(\d?\s*[^\d\s,]+)/);
  const token = m ? m[1].replace(/[\s.]/g, '').toLowerCase() : '';
  if (token && ALIAS_TO_KEY.has(token)) return ALIAS_TO_KEY.get(token);
  for (const [re, key] of BOOK_KEYS) if (re.test(ref)) return key;
  return null;
}

// "Salm 50" -> PS 50 · "Càntic Cf. Ap 19, 1-2.5-7" -> REV 19 v.1-2.5-7
//
// Book+chapter and the verse range are kept apart on purpose. The two sides routinely name
// the same psalm at different precision — cpl-app prints "Salm 109", the Spanish cell prints
// "Salmo 109, 1-5. 7" — and that is a granularity difference, not a different psalm. Only a
// different book or chapter is a real divergence; a verse difference is reported separately.
function fingerprint(value) {
  const ref = bareReference(value);
  if (!ref) return null;
  // Strip the canticle marker and a "Cf."/"Cf" prefix — "Càntic Cf. Ap 19, 1-2.5-7" is
  // Apocalypse 19, and the real book is the token after both.
  const stem = ref
    .replace(/^(c[àa]ntic|c[áa]ntico)\s+/i, '')
    .replace(/^cf\.?\s+/i, '')
    .trim();
  const key = bookKey(stem) || bookKey(ref);
  // First number after the book name is the chapter; for a psalm it IS the psalm number.
  const afterBook = stem.replace(/^[^\d]*/, '');
  const chapter = (afterBook.match(/^\d+/) || [null])[0];
  const verses = afterBook
    .replace(/^\d+\s*[,.]?\s*/, '')
    .replace(/\s*([-–])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!key && !chapter) return null;
  return {
    ref,
    key: key || 'ANON',
    chapter: chapter || '',
    verses,
    // What "same reference" is judged on.
    token: `${key || 'ANON'}|${chapter || ''}`,
    tokenFull: `${key || 'ANON'}|${chapter || ''}|${verses}`,
  };
}

// --- Row assembly --------------------------------------------------------------------

function rowsByKey(compare) {
  const out = new Map();
  for (const h of compare.hours) {
    for (const r of h.rows) {
      out.set(`${h.hour} ${r.key} ${r.label}`, { hour: h.hour, ...r });
    }
  }
  return out;
}

function main() {
  const dump = JSON.parse(fs.readFileSync(CPL_DUMP, 'utf8'));
  const ctxCa = dayCheck.buildContext({ language: 'ca' });
  const ctxEs = dayCheck.buildContext({ language: 'es' });

  const days = [];
  for (const date of DATES) {
    const cplDay = dump.days[date];
    if (!cplDay || cplDay.error) {
      days.push({ date, error: (cplDay && cplDay.error) || 'cpl-app no ha resolt el dia' });
      continue;
    }
    const fromFerial = cplDay.ferialFields;
    const chkCa = dayCheck.checkDay(date, { ctx: ctxCa, fromFerial, impact: true });
    const chkEs = dayCheck.checkDay(date, { ctx: ctxEs, fromFerial });
    // Coverage as the reader will experience it. `fromFerial` redirects a memorial's fields
    // to the ferial cells — right for deciding WHICH cell cpl-app's text belongs in, but not
    // for "what shows up when you open the app", because saints-app's page opens on the
    // saint's tab. Counted without the redirect, this is the same number the panel reports.
    const chkCaApp = dayCheck.checkDay(date, { ctx: ctxCa });
    const cmpCa = dayCompare.compareDay(date, cplDay, chkCa, { language: 'ca' });
    const cmpEs = dayCompare.compareDay(date, cplDay, chkEs, { language: 'es' });
    const esRows = rowsByKey(cmpEs);

    const rows = [];
    for (const h of cmpCa.hours) {
      for (const r of h.rows) {
        if (!IN_SCOPE.has(r.key)) continue;
        const es = esRows.get(`${h.hour} ${r.key} ${r.label}`) || null;
        const cpl = r.cpl;
        const ca = r.app;
        const esText = es ? es.app : null;

        // Channel: Catalan cell filled -> compare like with like. Otherwise fall back to
        // the Spanish cell, which is the same slot and is complete.
        const channel = ca != null ? 'C1' : esText != null ? 'C2' : 'C0';

        const isCitation = CITATION_FIELDS.has(r.key);
        const fpCpl = isCitation ? fingerprint(cpl) : null;
        const fpEs = isCitation ? fingerprint(esText) : null;
        const fpCa = isCitation ? fingerprint(ca) : null;

        let match = null;
        if (channel === 'C1') {
          match = textKey(String(cpl ?? '')) === textKey(String(ca ?? '')) ? 'same' : 'diff';
        } else if (channel === 'C2' && isCitation) {
          match = !fpCpl || !fpEs
            ? 'unparsed'
            : fpCpl.token !== fpEs.token
              ? 'diffRef'                                  // different book or chapter
              : fpCpl.tokenFull === fpEs.tokenFull
                ? 'sameRef'                                // identical down to the verses
                : 'sameRefVerses';                         // same psalm, different precision
        } else if (channel === 'C2') {
          match = 'prose'; // needs judgement, carried through for reading
        }

        rows.push({
          hour: h.hour,
          key: r.key,
          label: r.label,
          table: r.table,
          id: r.id,
          status: r.status,          // ok | conflict | missing | notInAppYet
          verdictCa: r.verdict,      // same | diff | onlyCpl | onlyApp | ferial | none
          channel,
          match,
          fromFerial: r.fromFerial,
          altModeMatch: r.altModeMatch,
          noProperText: r.noProperText,
          cpl,
          ca,
          es: esText,
          cplClean: stripMarkup(cpl),
          caClean: stripMarkup(ca),
          esClean: stripMarkup(esText),
          fp: { cpl: fpCpl, es: fpEs, ca: fpCa },
          conflict: r.conflict
            ? {
                cause: r.conflict.cause,
                bundleId: r.conflict.bundleId,
                variantCount: r.conflict.variantCount,
                affectedCount: r.conflict.affectedCount,
                decision: r.conflict.decision,
                impact: r.conflict.impact || null,
                variants: r.conflict.variants,
              }
            : null,
          blame: r.blame || null,
        });
      }
    }

    days.push({
      date,
      litcalId: chkCa.litcalId,
      allXKey: chkCa.allXKey,
      cplTitle: (cplDay.celebration && cplDay.celebration.title) || null,
      cplType: (cplDay.celebration && cplDay.celebration.celebrationType) || null,
      cplWeek: (cplDay.celebration && cplDay.celebration.week) || null,
      cplWeekCycle: (cplDay.celebration && cplDay.celebration.weekCycle) || null,
      cplSpecificTime: (cplDay.celebration && cplDay.celebration.specificLiturgyTime) || null,
      appName: cmpCa.celebration.app,
      appGloss: cmpCa.celebration.appGloss,
      celebration: chkCa.celebration,
      // Two different questions, deliberately kept apart (see the report's "dos eixos"):
      //   coverage  — what the reader sees on the tab the app opens on. Matches the panel.
      //   compared  — the cells this review actually read, after the ferial redirect.
      coverage: (() => {
        const t = chkCaApp.totals;
        // `have` counts the text we already hold, whether or not it has shipped.
        // `reachable` adds the contested cells: those DO have Catalan text, it is only
        // withheld until the disagreement is settled — so they are the real target.
        // `unreachable` is the honest ceiling: nobody ever supplied a value, and on a
        // memorial that is structural, because cpl-app prays the ferial office and so has
        // no text for the saint's tab at all.
        const have = t.ok + t.notInAppYet;
        const reachable = have + t.conflict;
        return {
          ok: t.ok,
          notInAppYet: t.notInAppYet,
          conflict: t.conflict,
          missing: t.missing,
          have,
          reachable,
          unreachable: t.missing,
          total: chkCaApp.total,
          percent: chkCaApp.percent,
          percentOfReachable: reachable ? Math.round((100 * have) / reachable) : 0,
        };
      })(),
      migration: {
        ok: chkCa.totals.ok,
        conflict: chkCa.totals.conflict,
        missing: chkCa.totals.missing,
        notInAppYet: chkCa.totals.notInAppYet,
        total: chkCa.total,
        percent: chkCa.percent,
      },
      // True on the days where the two counts disagree, i.e. memorials with the switch.
      tabsDiffer: chkCaApp.totals.ok !== chkCa.totals.ok,
      ferialFieldCount: {
        Laudes: (fromFerial.Laudes || []).length,
        Vespers: (fromFerial.Vespers || []).length,
      },
      blameSummary: chkCa.blameSummary,
      rows,
    });
  }

  fs.writeFileSync(OUT, JSON.stringify({ dates: DATES, diocese: dump.diocese, days }, null, 2), 'utf8');

  // Terminal summary so the shape is visible without opening the JSON.
  for (const d of days) {
    if (d.error) { console.log(`${d.date}  ERROR ${d.error}`); continue; }
    const c = {};
    for (const r of d.rows) {
      const k = `${r.channel}/${r.match}`;
      c[k] = (c[k] || 0) + 1;
    }
    console.log(`${d.date}  ${d.litcalId}  files=${d.rows.length}  ca=${d.migration.ok}/${d.migration.total}`);
    console.log(`   ${Object.entries(c).sort().map(([k, v]) => `${k}:${v}`).join('  ')}`);
  }
  console.log(`\n-> ${OUT}`);
}

main();
