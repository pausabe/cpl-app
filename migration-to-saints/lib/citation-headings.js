// One psalm, two legitimate headings — and saints-app has room for only one.
//
// cpl-app prints a psalm's heading two ways, and both are right. When the psalmody comes
// from the running psalter the heading carries its descriptive line ("Salm 50 / Oració de
// penediment"); when the day has proper psalmody the propers print the bare reference
// ("Salm 50"). The printed Liturgia de las Horas makes the same distinction: Ash Wednesday
// prints "Salmo 50 / CONFESIÓN DEL PECADOR ARREPENTIDO", Good Friday prints "Salmo 50".
// It is systematic in the DB, not sloppiness: salteriComuLaudes carries the descriptive
// line in all 28 rows, the proper tables carry the bare form in 1685 headings.
//
// saints-app cannot express it. Its index gives one cell per field, and salmos_citas/72 is
// shared by Ash Wednesday, Good Friday and every ordinary Friday alike — so cpl-app's two
// spellings read as a disagreement and the cell is withheld from every day that uses it.
// The decision (Pau, 14 Aug 2026) is to let saints-app's model win: keep one heading, the
// fullest one, and accept that Good Friday shows a descriptive line the book does not
// print there. It costs a line of detail on a handful of days and unblocks hundreds.
//
// The merge is deliberately narrow. Two variants only collapse when they name the SAME
// psalm or canticle and disagree over nothing but whether the descriptive line is there.
// Two different descriptions for one reference are NOT a context difference — the only
// case in the whole corpus is a typo in cpl-app's data ("Que tol l'univers" for "Que tot
// l'univers", diesespecials row 27) — so those stay apart and stay visible.

// "Salm 50\nOració de penediment"        -> reference "Salm 50",            description "Oració…"
// "Càntic\nJr 14, 17-21\nLamentacions…"  -> reference "Càntic Jr 14, 17-21", description "Lamentacions…"
function splitHeading(value) {
  const lines = String(value == null ? '' : value)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const referenceLines = lines[0] === 'Càntic' ? 2 : 1;
  return {
    reference: lines.slice(0, referenceLines).join(' '),
    description: lines.slice(referenceLines).join(' ').replace(/\s+/g, ' ').trim(),
  };
}

// `byValue` is the join's Map(textKey -> group) for one id; `representative` turns a group
// back into the raw text it stands for. Returns a Map of the same shape, with headings of
// the same citation pooled into their fullest spelling.
function mergeCitationHeadings(byValue, representative) {
  const byReference = new Map();
  for (const [key, group] of byValue) {
    const { reference, description } = splitHeading(representative(group));
    if (!byReference.has(reference)) byReference.set(reference, []);
    byReference.get(reference).push({ key, group, description });
  }

  const merged = new Map();
  for (const entries of byReference.values()) {
    const descriptions = new Set(entries.map((e) => e.description).filter(Boolean));
    // Nothing shares this reference, or the descriptions themselves disagree: leave the
    // variants exactly as they were, so the id stays contested and someone looks at it.
    if (entries.length === 1 || descriptions.size > 1) {
      for (const e of entries) merged.set(e.key, e.group);
      continue;
    }
    const fullest = entries.find((e) => e.description) || entries[0];
    merged.set(fullest.key, {
      raws: fullest.group.raws,
      tags: entries.flatMap((e) => e.group.tags),
    });
  }
  return merged;
}

module.exports = { splitHeading, mergeCitationHeadings };
