// Which of saints-app's two offices a given field of cpl-app's day belongs to.
//
// On a memorial that keeps the weekday psalmody, saints-app carries TWO offices behind a
// segmented control (`views/divineOffices/LaudesPage.vue`, cycle `MEMORY_FERIAL1`): the
// memorial's own and the plain ferial one. Its stores load both — as `<field>` and
// `<field>_Ferial` — and the page opens on the memorial.
//
// cpl-app has no such switch. On a memorial it renders the ferial office and replaces only
// what the memorial's own row in `santsMemories` supplies, which for most rows is very
// little: of the 527 memorials, 18 carry their own short reading, 35 their own hymn, 17
// their own responsory, 15 their own intercessions — but all 527 their own collect and 153
// their own Benedictus antiphon. It never reaches for the common: every row has
// `Categoria = '0000'`, and `ObtainCommonOffices` returns an empty office for that value,
// so the `CommonOffices` fallbacks in `CelebrationHoursLiturgyService` are dead code for
// memorials (they do fire for solemnities and feasts, which carry real categories).
//
// That is a deliberate editorial choice, not a gap: the Catalan reference edition
// (liturgiadeleshores.cat) serves the same thing, and OGLH 235b allows it — on a memorial
// the hymn, short reading, responsory and intercessions are taken "from the common OR from
// the current weekday" when they are not proper. Investigated in full and left alone:
// decisions/D-001-el-comu-a-les-memories.md.
//
// saints-app is a different surface, though, and its memorial tab does show the Common — in
// Spanish today, and in Catalan by the decision of 3 September 2026. cpl-app can never
// supply that half, so the join takes it straight from `OficisComuns` instead: see
// lib/common-office.js, and `cellsForMode(..., 1)` below for the cell it goes in.
//
// So on those days most of cpl-app's text belongs in the FERIAL cell. Filing it under the
// memorial cell instead puts a ferial text where the common lives, where it disagrees with
// every other date sharing that cell, and the id is dropped as conflicted forever — cpl-app
// can never supply it. Measured on 14-08-2026 (sant Maximilià Kolbe): 2 of 16 Laudes fields
// match the memorial column, 15 of 16 match the ferial one.
//
// But NOT all of it, and the split can't be guessed from the field name. `oracion_final` is
// always proper, `cantico_evangelico_antifona` usually is, and a handful of memorials carry
// their own reading or hymn — sending those to the ferial cell files a saint's proper text
// under a cell shared by dozens of ordinary weekdays and invents the very conflict this
// rule removes. A first cut that redirected by field name did exactly that to
// `lectura_breve_citas/68`: 62 dates agreeing on the weekday reading plus 6 intruders
// (Mare de Déu dels Dolors, del Pilar, del Roser, l'Exaltació de la Santa Creu, la
// Dedicació del Laterà — every one a day where cpl-app really does have its own text).
//
// So the question is asked per value, not per field, and cpl-app answers it: resolve the
// same date a second time with an empty celebration and the Hour comes back purely ferial
// (`LaudesService.ObtainLaudes(masters, day, new Laudes(), settings)` — the real code path,
// so seasons, psalter weeks and the hardcoded special days all behave as they do on screen).
// A field that comes out the same either way was taken from the weekday, and that is the
// cell it belongs in.

// The fields of one Hour whose text cpl-app took from the weekday, given the Hour as it
// renders and the same Hour resolved with no celebration. Both are `extractHourFields`
// shapes (lib/cpl-day-resolver.js); list fields compare element by element.
function ferialFields(rendered, ferial) {
  const out = new Set();
  if (!rendered || !ferial) return out;
  for (const [field, value] of Object.entries(rendered)) {
    const other = ferial[field];
    if (other === undefined) continue;
    const same = Array.isArray(value)
      ? Array.isArray(other) && value.length === other.length && value.every((v, i) => same1(v, other[i]))
      : same1(value, other);
    if (same) out.add(field);
  }
  return out;
}

const same1 = (a, b) => norm(a) === norm(b);
const norm = (s) => (s == null ? null : String(s).replace(/\s+/g, ' ').trim());

// Only these cycles put the switch on screen (`dualOption` in LaudesPage.vue). The stores
// load a `_Ferial` entry on other days too, but nothing there ever shows it: on a feast
// (`__ANY`) the ferial cells belong to the weekday the feast displaced, and are not this
// day's content at all.
//
// The gate matters because `ferialFields` alone is too generous. A feast takes its psalmody
// from Sunday of week I by rank, not from its own text, so resolving it without the
// celebration gives the same psalms — the fields look "ferial" while the day has no ferial
// tab to put them in. Without this test, Sant Miquel and la Presentació filed their Sunday
// psalms into the weekday cell `salmos_citas/72` and broke 411 dates that agreed on Salm 50.
const SWITCH_CYCLE = /__MEMORY_FERIAL\d*$/;

function hasSwitch(allXKey) {
  return SWITCH_CYCLE.test(allXKey || '');
}

// The other kind of memorial: one whose office is proper, so saints-app shows a SINGLE tab
// (`LaudesPage.vue`: `isTodayMemory && cycle !== "MEMORY_PROPER"` is what reaches for the
// `_Ferial` twin, so with this cycle there is none). Seven celebrations carry it — Agnès,
// Basili i Gregori Nazianzè, els Àngels Custodis, Martí de Tours, la Mare de Déu dels Dolors,
// la Mare de Déu del Roser i el Martiri de sant Joan Baptista.
//
// These days are the blind spot of everything above. cpl-app still takes most of the Hour
// from the weekday — 17 of the 20 fields on 2 January — but `hasSwitch` says no, so
// `cellPair` hands back `[own, null]` and that weekday text is filed under the memorial's
// own cell, which is exactly the mistake the header warns about. It cost
// `lectura_breve_citas/66` and `/3355`, where nine 2-Januarys put the Christmas weekday's
// reading into a cell 158 other dates fill with the Common of Pastors, and both ids stayed
// conflicted forever (MIGRA-004).
//
// There is no ferial cell to redirect into here, so the fix is not a wider regexp: on these
// days the Common takes the field and cpl-app's weekday text is not observed at all. Which
// fields, and on what evidence, is `commonOverrides` in lib/common-office.js. That the
// Catalan of saints-app then prays the Common on those seven days with no way back to the
// weekday is a decision, not a side effect: decisions/D-002-el-comu-als-oficis-propis.md.
function isProperOnly(allXKey) {
  return /__MEMORY_PROPER$/.test(allXKey || '');
}

// For one field of one measured hour, returns `[cell, otherMode]` in whatever shape the
// probe stored (a "table/id" string, or a list of them):
//   - `cell` is the one cpl-app's text belongs in, to join into and to compare against
//   - `otherMode` is the same field in the other tab, or null when the day has no switch
// Omit `fromFerial`/`allXKey` and nothing is redirected, which is the old behaviour and
// always the safe direction.
// Callers keep their own notion of an unusable cell (`-1`, empty list) and normalise after.
function cellPair(measured, field, { fromFerial, allXKey } = {}) {
  const own = measured[field];
  const ferial = measured[`${field}_Ferial`];
  if (ferial === undefined || ferial === null) return [own, null];
  if (!hasSwitch(allXKey)) return [own, null];
  return fromFerial && fromFerial.has(field) ? [ferial, own] : [own, ferial];
}

// The whole hour at once, in one of the two modes. Drops the `_Ferial` keys, which have been
// folded into their base field.
//
// `which` is 0 for the cells cpl-app's own text belongs in, 1 for the other tab's. Mode 1 is
// only meaningful for the fields cpl-app took from the weekday: there the pair is
// `[ferial, memorial]`, so index 1 is the memorial cell — the one nobody fills, because
// cpl-app never reaches for the Common. That is the cell the Common is written into.
// For a field cpl-app supplies itself the pair is `[memorial, ferial]` and index 1 is the
// weekday's cell, which belongs to the weekday and must not be touched — so callers gate on
// `fromFerial` rather than on this function.
function cellsForMode(measured, options, which = 0) {
  const out = {};
  for (const field of Object.keys(measured)) {
    if (field.endsWith('_Ferial')) continue;
    const cell = cellPair(measured, field, options)[which];
    if (cell !== undefined && cell !== null) out[field] = cell;
  }
  return out;
}

const cellsForCplApp = (measured, options) => cellsForMode(measured, options, 0);

module.exports = { ferialFields, hasSwitch, isProperOnly, cellPair, cellsForCplApp, cellsForMode };
