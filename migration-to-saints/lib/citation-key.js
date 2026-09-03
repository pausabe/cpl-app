// Comparing a scripture citation across languages — the one currency the Catalan and the
// Spanish sides share, and the only evidence available when the Catalan cell is still empty.
//
// Extracted from review/build-rows.js so the review and the Common proposal answer "is this
// the same reading?" the same way. Two copies of a 60-line book table is exactly how "He 13,
// 7-9a" and "Hb 13, 7-9a" end up counting as different books in one tool and the same book in
// the other.

const { splitHeading } = require('./citation-headings');

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
  // The chapter is the first number AFTER the book name, and the book name may itself open
  // with a digit. Stripping leading non-digits instead — as this did — hands back the
  // ordinal: "1Pe 5, 1-4" reads as chapter 1, and so does "1Pe 1, 22-23", which makes two
  // different readings compare equal. Cut the book token off with the same pattern bookKey
  // recognises it by, then read the chapter from what is left.
  const book = stem.match(/^(\d?\s*[^\d\s,]+)/);
  const afterBook = (book ? stem.slice(book[0].length) : stem.replace(/^[^\d]*/, ''))
    .replace(/^[\s,.:;]+/, '');
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

module.exports = { stripMarkup, bareReference, bookKey, fingerprint };
