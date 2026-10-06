// Two ways a held cell is written without anyone choosing a text for it (D-012).
//
// The join holds a cell when cpl-app says different things in it on different days, and one
// day is enough to hold it for all of them: the Terce psalm 118 (Teth) is shared by 390 days,
// and because cpl-app prays the Office of the Dead there on All Souls, it was empty on all
// 390. Two kinds of held cell have an answer that is not a matter of taste:
//
//   light  every text in the cell is the same text, copied with a comma, a quote mark, an
//          accent or a line break of difference ("peus.»" / "peus».", Psalm 109 on 468 and
//          132 days). Pau, 25-9-2026: the most common copy goes in, and nobody calls the other
//          one an error of cpl-app.
//
//   psalm  the cell is a psalm or its heading, and the Spanish of the same cell says which one
//          ("Salmo 118,65-72"). The Catalan that is that psalm goes in, whatever the other days
//          pray. saints-app shows this cell on every one of those days in Spanish already
//          (D-010: eprex's index decides what a cell is), so filling it changes no day's psalm;
//          it only stops the Catalan being empty. The days cpl-app prays another psalm there
//          are not decided here: the join lists them, and they are reviewed one by one.
//
// Anything else stays held: two different texts with no citation to tell them apart are a
// decision, not a rule.

const { fingerprint, readingMatch, bareReference } = require('./citation-key');

// Tables whose values are references, not prose: a digit of difference ("Ga 6, 8" / "Ga 6,
// 7b-8") is another reading, so only spelling and punctuation may differ there.
const CITATION_TABLES = new Set(['salmos_citas', 'lectura_breve_citas', 'lecturas_referencia', 'oficio_citas']);

// Words that are never a detail of the copy. «Al·leluia» makes two antiphons two seasons: an
// Easter antiphon is the same antiphon with it added, and it belongs to other days. The
// responsory marks (see looseWords) make one line two voices.
const NEVER_A_DETAIL = new Set(['alleluia', 'rrr', 'vvv']);

// "Beneïu el Senyor, totes les criatures,    *" -> ["beneiu", "el", "senyor", "totes", …]
// Case, accents, punctuation, the psalm-pointing marks and line breaks all go: none of them
// changes which text it is. The apostrophe splits ("d’aquests" -> "d", "aquests") so the
// straight and curly spellings meet. The responsory marks stay: «℟. I féu la meva vida
// immaculada» and «℣. I féu…» are one line said by two different voices. The invisible soft
// hyphen goes before anything else: cpl-app's copies carry it inside words («di­gué»,
// «pre­servat»), and splitting there made two copies of one short reading read as different words.
function looseWords(value) {
  return String(value == null ? '' : value)
    .replace(/[\u00ad\u200b-\u200d\ufeff]/g, '')
    .replace(/℟/g, ' rrr ')
    .replace(/℣/g, ' vvv ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/·/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

// Word-level edit distance, with the words that were added, removed or changed. Gives up (null)
// past `limit`, which is all the callers need to know and keeps a psalm against a psalm cheap.
function wordEdits(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return null;
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (d[i][j] < rowMin) rowMin = d[i][j];
    }
    if (rowMin > limit) return null;
  }
  if (d[m][n] > limit) return null;
  const changed = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) { i--; j--; continue; }
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) { changed.push(a[i - 1], b[j - 1]); i--; j--; continue; }
    if (i > 0 && d[i][j] === d[i - 1][j] + 1) { changed.push(a[i - 1]); i--; continue; }
    changed.push(b[j - 1]);
    j--;
  }
  return { edits: d[m][n], changed: changed.reverse() };
}

// Is `b` the same text as `a`, told apart only by a copy's details?
//   - identical once case, accents, punctuation and blanks are gone: yes, in a prose table;
//   - in a prose table, up to one word in fifty (at least one) added, removed or changed,
//     unless one of them is «al·leluia» or a responsory mark;
//   - in a table of references, only blanks and capitals: there the punctuation says which
//     verses ("Is 12,2-3.4" and "Is 12,2.3-4" are not the same list). A Mass reference also
//     carries prose after its `_` (a reading's subtitle, a psalm's response since D-017): the
//     citation is held to that, the prose after it to the prose rule.
// Returns { edits, changed } when it is, null when it is not.
function lightVariant(a, b, table) {
  // A reference keeps its punctuation: "2-3.4" and "2.3-4" are other verses.
  if (CITATION_TABLES.has(table)) {
    const bare = (s) => String(s == null ? '' : s).replace(/\s+/g, '').toLowerCase();
    const [citeA, ...proseA] = String(a == null ? '' : a).split('_');
    const [citeB, ...proseB] = String(b == null ? '' : b).split('_');
    if (bare(citeA) !== bare(citeB)) return null;
    if (!proseA.join('').trim() && !proseB.join('').trim()) return { edits: 0, changed: [] };
    return lightProse(proseA.join(' '), proseB.join(' '));
  }
  return lightProse(a, b);
}

function lightProse(a, b) {
  const wa = looseWords(a);
  const wb = looseWords(b);
  if (wa.join(' ') === wb.join(' ')) return { edits: 0, changed: [] };
  const limit = Math.max(1, Math.floor(Math.min(wa.length, wb.length) / 50));
  const diff = wordEdits(wa, wb, limit);
  if (!diff) return null;
  if (diff.changed.some((w) => NEVER_A_DETAIL.has(w))) return null;
  return diff;
}

// "Salm 117 - I" / "Salmo 117, 1-9 (I)" -> "I". The part of a psalm said in several pieces;
// Psalm 118's eight-verse stanzas are named by their verses instead, and read by those.
function psalmPart(value) {
  const ref = bareReference(value);
  if (!ref) return null;
  const m = ref.match(/(?:\s[-–]\s*|\(\s*)([IVX]+)\s*\)?\s*$/);
  return m ? m[1] : null;
}

// "Salm 9 B - I" -> "B". Psalms 9 and 113 are two psalms each in the Vulgate numbering.
function psalmHalf(value) {
  const fp = fingerprint(value);
  if (!fp || fp.key !== 'PS') return null;
  const m = fp.verses.match(/^([AB])\b/);
  return m ? m[1] : null;
}

// How surely a Catalan psalm heading names the psalm of a Spanish one, on readingMatch's scale:
//   2  the same psalm and the same part, or the same verses
//   1  the same psalm, and nothing to tell the parts apart (one side names no verses)
//   0  another psalm, another part, or verses that do not meet
function psalmScore(ca, es) {
  const fa = fingerprint(ca);
  const fb = fingerprint(es);
  if (!fa || !fb || fa.token !== fb.token) return 0;
  const ha = psalmHalf(ca);
  const hb = psalmHalf(es);
  if (ha && hb && ha !== hb) return 0;
  const pa = psalmPart(ca);
  const pb = psalmPart(es);
  if (pa && pb) return pa === pb ? 2 : 0;
  return readingMatch(fa, fb);
}

// One held cell. `groups` are its competing texts, most-observed first or not:
//   { value, count, psalmScores?: Map(score -> observations) }
// `psalmScores` is how the day's own heading compared with the Spanish heading of the same slot,
// for each observation of a psalm TEXT (the join fills it in). For a heading cell the value is
// compared with `esCitation` directly.
//
// Returns { rule, take, others } — `take` the index of the group to write, `others` the rest —
// or null when the cell must stay held.
function resolveHeld({ table, groups, esCitation }) {
  if (!groups || groups.length < 2) return null;
  const order = groups.map((g, i) => i).sort((x, y) => groups[y].count - groups[x].count);

  if (table === 'salmos_citas' || table === 'salmos_textos') {
    const score = (g) => {
      if (table === 'salmos_citas') return esCitation ? psalmScore(g.value, esCitation) : 0;
      // A psalm text is only as good as the heading it was said under, on every day it was.
      const seen = g.psalmScores ? [...g.psalmScores.keys()] : [];
      return seen.length === 1 ? seen[0] : 0;
    };
    const scores = groups.map(score);
    const best = Math.max(...scores);
    if (best > 0) {
      const eligible = order.filter((i) => scores[i] === best);
      const take = eligible[0];
      // Two headings that both only half-match ("Salm 117 - I" and "Salm 117 - III" against a
      // bare "Salmo 117") are two parts, not one; two texts under one heading are two texts.
      // Either way the cell stays held.
      const sameRef = (i) => looseWords(bareReference(groups[i].value)).join(' ')
        === looseWords(bareReference(groups[take].value)).join(' ');
      const oneText = eligible.every((i) => i === take || (table === 'salmos_citas'
        ? best === 2 || sameRef(i)
        : lightVariant(groups[take].value, groups[i].value, table)));
      if (oneText) return { rule: 'psalm', take, others: order.filter((i) => i !== take) };
    }
  }

  const take = order[0];
  const others = order.slice(1);
  // "The most common copy" only means something when there is one: a tie stays held.
  if (groups[others[0]].count === groups[take].count) return null;
  if (others.every((i) => lightVariant(groups[take].value, groups[i].value, table))) {
    return { rule: 'light', take, others };
  }
  return null;
}

// A cell cpl-app agrees with itself about, but that holds another psalm than the one the Spanish
// of the cell names (MIGRA-021). Unanimity says cpl-app is consistent, not that this is the cell
// for its psalm: on a weekday solemnity cpl-app says Psalm 124 in Terce's third place, where
// eprex's cell is Psalm 121. Same evidence as `resolveHeld`: the heading against the Spanish one,
// or, for a text, how its heading compared on every day it was said.
function anotherPsalm({ table, value, psalmScores, esCitation }) {
  if (table === 'salmos_citas') return esCitation != null && psalmScore(value, esCitation) === 0;
  if (table === 'salmos_textos') return !!psalmScores && psalmScores.size === 1 && psalmScores.has(0);
  return false;
}

// The Sunday cycle (A, B or C) a day's text belongs to. The year of the cycle starts on the First
// Sunday of Advent; Vespers count from the next day, so the Saturday before Advent, the first
// Vespers of the new year, already takes the new cycle.
function adventSunday(year) {
  const christmas = new Date(Date.UTC(year, 11, 25));
  const fourth = new Date(christmas - (christmas.getUTCDay() || 7) * 864e5);
  return new Date(fourth - 21 * 864e5);
}

function sundayCycle(tag) {
  const m = /^(\d{4}-\d{2}-\d{2})(?: \((\w+)\))?/.exec(tag);
  if (!m) return null;
  let day = new Date(`${m[1]}T12:00:00Z`);
  if (m[2] === 'Vespers') day = new Date(+day + 864e5);
  const year = day.getUTCFullYear();
  const litYear = day >= adventSunday(year) ? year + 1 : year;
  return ['C', 'A', 'B'][litYear % 3];
}

// A Sunday Gospel canticle antiphon is one cell with the three cycles in it, as the Spanish keeps
// it ("$ Año A: $_…_\n$Año B: $_…_\n$Año C: $_…_"), and cpl-app says each cycle's on its own days.
// When every text cpl-app gives falls in one cycle, and every cycle the Spanish names has one,
// the Catalan cell is the same three lines with cpl-app's texts, labelled as cpl-app labels the
// year ("Any A"). No text is chosen: each cycle keeps its own (D-021).
function composeCycles(es, groups) {
  const named = [...String(es || '').matchAll(/A[ñn]o ([ABC])\b/g)].map((m) => m[1]);
  if (!named.length) return null;
  const byCycle = {};
  for (const g of groups) {
    const cycles = new Set(g.tags.map(sundayCycle));
    if (cycles.size !== 1) return null;
    const [c] = cycles;
    if (!c || byCycle[c]) return null;
    byCycle[c] = g;
  }
  if (named.some((c) => !byCycle[c]) || Object.keys(byCycle).some((c) => !named.includes(c))) return null;
  return {
    value: named.map((c) => `$ Any ${c}: $_${byCycle[c].value.trim()}_`).join('\n'),
    byCycle,
  };
}

// The line of a three-cycle cell a given day prays: what the review and the panel compare with
// cpl-app's single antiphon for that day. Any other value comes back as it is.
const CYCLE_LINE = /^\$\s*Any ([ABC]):\s*\$/;
function cycleLine(value, tag) {
  if (value == null) return value;
  const lines = String(value).split('\n');
  if (!lines.some((l) => CYCLE_LINE.test(l))) return value;
  const cycle = sundayCycle(tag);
  const line = lines.find((l) => (CYCLE_LINE.exec(l) || [])[1] === cycle);
  return line ? line.replace(CYCLE_LINE, '').trim().replace(/^_([\s\S]*)_$/, '$1') : value;
}

module.exports = {
  looseWords, lightVariant, psalmPart, psalmScore, resolveHeld, anotherPsalm, sundayCycle, composeCycles, cycleLine,
  CITATION_TABLES,
};
