// The citation-heading merge is the one place in the join that deliberately throws
// information away: two legitimate spellings of a psalm heading become one, because
// saints-app has a single cell for both. That makes its edges worth pinning — it must
// pool the proper/psalter spelling split and NOTHING else, or it starts hiding real
// disagreements behind a heading that looks plausible.

const { splitHeading, mergeCitationHeadings } = require('./lib/citation-headings');

// Mirrors the join's own group shape: raw spellings with counts, plus the observations.
const group = (value, ...tags) => ({ raws: new Map([[value, tags.length]]), tags });
const representative = (g) => [...g.raws.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0];
const merge = (...groups) =>
  mergeCitationHeadings(new Map(groups.map((g, i) => [`k${i}`, g])), representative);
const valuesOf = (m) => [...m.values()].map(representative);

describe('splitHeading', () => {
  it('separates a psalm from its descriptive line', () => {
    expect(splitHeading('Salm 50\nOració de penediment')).toEqual({
      reference: 'Salm 50',
      description: 'Oració de penediment',
    });
  });

  it('keeps a canticle together with its biblical reference', () => {
    expect(splitHeading('Càntic\nJr 14, 17-21\nLamentacions del poble')).toEqual({
      reference: 'Càntic Jr 14, 17-21',
      description: 'Lamentacions del poble',
    });
  });

  it('reports a bare heading as having no description', () => {
    expect(splitHeading('Salm 50')).toEqual({ reference: 'Salm 50', description: '' });
  });
});

describe('mergeCitationHeadings', () => {
  it('pools the bare heading into the full one and keeps every observation', () => {
    const merged = merge(
      group('Salm 50\nOració de penediment', '2022-03-02 (Laudes)', '2022-01-07 (Laudes)'),
      group('Salm 50', '2022-04-15 (Laudes)')
    );
    expect(valuesOf(merged)).toEqual(['Salm 50\nOració de penediment']);
    expect([...merged.values()][0].tags).toHaveLength(3);
  });

  it('does the same for canticles', () => {
    const merged = merge(
      group('Càntic\nHa 3, 2-4.13a.15-19\nDéu ve a judicar els pobles', 'a'),
      group('Càntic\nHa 3, 2-4.13a.15-19', 'b')
    );
    expect(valuesOf(merged)).toEqual(['Càntic\nHa 3, 2-4.13a.15-19\nDéu ve a judicar els pobles']);
  });

  it('never merges different psalms, however similar the shape', () => {
    const merged = merge(
      group('Salm 147\nHimne a Déu, restaurador de la ciutat santa', 'a'),
      group('Salm 129', 'b')
    );
    expect(merged.size).toBe(2);
  });

  it('leaves two different descriptions of one reference apart — that is a typo, not a context', () => {
    // The real case: diesespecials row 27 spells it "Que tol l'univers".
    const merged = merge(
      group('Càntic\nDn 3, 57-88.56\nQue tot l’univers lloï el Senyor', 'a'),
      group('Càntic\nDn 3, 57-88.56\nQue tol l’univers lloï el Senyor', 'b')
    );
    expect(merged.size).toBe(2);
  });

  it('still merges the bare form when a typo pair is present, without touching the pair', () => {
    const merged = merge(
      group('Salm 50\nOració de penediment', 'a'),
      group('Salm 50', 'b'),
      group('Salm 147\nHimne a Déu', 'c'),
      group('Salm 147\nHimne a Deu', 'd')
    );
    expect(valuesOf(merged).sort()).toEqual(
      ['Salm 147\nHimne a Deu', 'Salm 147\nHimne a Déu', 'Salm 50\nOració de penediment'].sort()
    );
  });

  it('passes a single variant through untouched', () => {
    const merged = merge(group('Salm 50\nOració de penediment', 'a'));
    expect(merged.size).toBe(1);
  });
});
