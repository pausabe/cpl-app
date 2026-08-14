// "Are these two texts the same text?" — the key the join groups observations by.
//
// cpl-app's DB stores the same psalm, hymn or reading many times over, and the copies are
// not byte-identical: a trailing space before the newline, three spaces before the `*`
// instead of four, an extra blank line at the end. Keyed on the raw string, those copies
// look like cpl-app disagreeing with itself, with two consequences that are both wrong:
// the id is withheld from the migration as "contested", and the day panel reports days
// that "es trencarien" while the text they want is character-for-character the same once
// you ignore the blanks. Psalm 50 in salmos_textos/73 was three "variants" of one text.
//
// What the whitespace does carry — where the lines break, where the †/* pointing markers
// fall — survives normalisation: only runs of blanks collapse, never the newlines that
// separate the verses. Only the KEY is normalised. What gets written into commons/ca is
// always a raw observed value, byte for byte as cpl-app produced it.
function textKey(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { textKey };
