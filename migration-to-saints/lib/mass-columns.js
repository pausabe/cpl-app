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

/** The Mass fields of one day, in the shape the index keeps them: one column, or two. */
function massColumns(dateStr, rendered, ferial) {
  const renderedFields = rendered || {};
  const ferialFields = ferial || {};
  const entry = massIndexEntry(litcalIdFor(dateStr));
  const twoColumns = entry && Object.keys(entry).some((k) => k.startsWith('CELEBRATION_'));
  if (!twoColumns || !Object.keys(ferialFields).length) return renderedFields;
  return {
    ...ferialFields,
    ...Object.fromEntries(Object.entries(renderedFields).map(([k, v]) => [`CELEBRATION_${k}`, v])),
  };
}

module.exports = { massColumns, litcalIdFor, massIndexEntry, DAY_TEXTS_DIR };
