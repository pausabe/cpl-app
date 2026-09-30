// Lists of intercessions that saints-app's index and the CPL do not count the same way, and which
// of the CPL's intercessions goes in each cell of them. Decided one by one, by Pau — never by a
// rule: the join and the review pair the two lists by position, which only holds when both have
// the same intercessions in the same order, and when they do not there is no telling from the
// lengths alone where the difference is.
//
// `cpl[i]` is the position, in the CPL's list, of the intercession that goes in `cells[i]`; null
// leaves that cell without Catalan.

const DECIDED = [
  {
    // Wednesday II Vespers (the psalter, Ordinary Time). The Latin has five intercessions and the
    // fourth has an alternative marked "vel": fair weather for the harvest, OR deliver us from
    // every danger and bless our homes. The CPL gives five, with the first option; the Spanish
    // prints both options one after the other, six cells. Pairing by position put the CPL's fifth
    // (the dead) in the alternative's cell and left the dead's cell empty. Pau, 30-9-2026: the
    // alternative's cell stays without Catalan, and Catalan shows the CPL's five (F27, MIGRA-020).
    cells: ['9569', '9570', '9571', '9572', '9573', '9574'],
    cpl: [0, 1, 2, 3, null, 4],
  },
];

const byCells = new Map(DECIDED.map((d) => [d.cells.join(','), d]));

/**
 * The CPL's intercessions laid out over the index's cells: element i goes in cellIds[i], and is
 * undefined where nothing does. By position unless the list is one of the decided ones and the
 * CPL has exactly the intercessions the decision counted on.
 */
function alignPreces(cellIds, items) {
  const list = items || [];
  const decided = byCells.get((cellIds || []).map(String).join(','));
  const expected = decided ? decided.cpl.filter((p) => p !== null).length : null;
  if (!decided || list.length !== expected) return (cellIds || []).map((_, i) => list[i]);
  return decided.cpl.map((p) => (p === null ? undefined : list[p]));
}

// The cells a decision leaves without Catalan on purpose, as "preces_contenido/<id>": not a gap to
// report, so the review does not bring back to Pau what he already decided.
const DECIDED_EMPTY = new Set(
  DECIDED.flatMap((d) => d.cells.filter((_, i) => d.cpl[i] === null).map((id) => `preces_contenido/${id}`)),
);

module.exports = { alignPreces, DECIDED, DECIDED_EMPTY };
