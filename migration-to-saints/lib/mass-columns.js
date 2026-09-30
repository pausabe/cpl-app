// Which of saints-app's two Mass columns each of cpl-app's two Masses belongs in.
//
// `all_lectures.json` carries a memorial's own readings under `CELEBRATION_*` and the weekday's
// under the plain roles, and `lecturesStore` merges the two so the page shows both. cpl-app shows
// ONE Mass. Which column its text belongs in is decided by the INDEX, not by whether the day is
// proper:
//
//   - an entry WITH `CELEBRATION_*` roles carries two Masses — the weekday's in the plain roles
//     and the celebration's in the `CELEBRATION_` ones (every `__MEMORY`, and the feast of Peter
//     and Paul, whose plain roles hold the vigil Mass);
//   - an entry WITHOUT them carries ONE, in the plain roles, and on a feast or a solemnity that
//     one is the celebration's own.
//
// Guessing from "does cpl-app pray something proper today" instead put the weekday's Mass beside
// the Nativity of the BVM's own readings and reported all seven fields as divergent. The join does
// not guess either — it matches on the citation (PLAN §18.7).
const fs = require('fs');
const path = require('path');

const MIGRATION_DIR = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(MIGRATION_DIR, 'webui/run/date-to-key-manifest.json');
const DAY_TEXTS_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts';

let manifest = null;
let allLectures = null;

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
};

/** date -> litcal id, the same manifest the join walks. */
function litcalIdFor(dateStr) {
  if (!manifest) manifest = readJson(MANIFEST_PATH);
  return (manifest[dateStr] || {}).litcalId || null;
}

function massIndexEntry(litcalId) {
  if (!litcalId) return null;
  if (!allLectures) allLectures = readJson(`${DAY_TEXTS_DIR}/all_lectures.json`);
  const key = Object.keys(allLectures).find(
    (k) => k.startsWith(`${litcalId}__`) && allLectures[k].lecturas && Object.keys(allLectures[k].lecturas).length,
  );
  return key ? allLectures[key].lecturas : null;
}

// Is what cpl-app prays today the weekday's Mass? On a memorial without readings of its own —
// all of them but the 20 that `LDSantoral` carries — it is, and the two candidates are the same
// readings. The citations are enough to tell: they are what the index itself files by.
function praysTheWeekday(renderedFields, ferialFields) {
  const refs = Object.keys(renderedFields).filter((k) => k.endsWith('_ref'));
  return refs.length > 0 && refs.every((k) => renderedFields[k] === ferialFields[k]);
}

/** The Mass fields of one day, in the shape the index keeps them: one column, or two. */
function massColumns(dateStr, rendered, ferial) {
  const renderedFields = rendered || {};
  const ferialFields = ferial || {};
  const entry = massIndexEntry(litcalIdFor(dateStr));
  const twoColumns = entry && Object.keys(entry).some((k) => k.startsWith('CELEBRATION_'));
  if (!twoColumns || !Object.keys(ferialFields).length) return renderedFields;
  // cpl-app prays the weekday's Mass, so it has nothing for the saint's column. Copying the
  // weekday there too made the review compare Jb 9 with 2 Tm 3 on Saint Jerome's day and
  // report three divergences that were nobody's (MIGRA-019). With no `CELEBRATION_*` key,
  // build-rows.js reads that column as "cpl-app has nothing here by design" (D-001).
  if (praysTheWeekday(renderedFields, ferialFields)) return ferialFields;
  return {
    ...ferialFields,
    ...Object.fromEntries(Object.entries(renderedFields).map(([k, v]) => [`CELEBRATION_${k}`, v])),
  };
}

module.exports = { massColumns, praysTheWeekday, litcalIdFor, massIndexEntry, DAY_TEXTS_DIR };
