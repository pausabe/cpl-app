// D-012: the held cells the join writes by itself — the same text copied with a detail of
// difference (the most common copy goes in), and the psalm the Spanish of the cell names.
//
//   npx jest migration-to-saints/held-resolution.test.js

const { lightVariant, psalmPart, psalmScore, resolveHeld, anotherPsalm } = require('./lib/held-resolution');

describe('the same text, copied with a detail of difference', () => {
  test('a quote mark on the other side of the full stop is the same psalm', () => {
    // Psalm 109, Sunday Vespers: 468 days one way, 132 the other.
    const a = 'Oracle del Senyor al meu Senyor:    †\n«Seu a la meva dreta,   *\ni espera que faci dels enemics\nl’escambell dels teus peus.»';
    const b = 'Oracle del Senyor al meu Senyor:    †\n«Seu a la meva dreta,    * \ni espera que faci dels enemics\nl’escambell dels teus peus».';
    expect(lightVariant(a, b, 'salmos_textos')).toEqual({ edits: 0, changed: [] });
  });

  test('a blank line, a capital or an accent more is the same text', () => {
    expect(lightVariant('Recordeu-vos, Senyor, de la vostra Església.', 'Recordeu-vos, senyor, de la vostra Esglesia', 'preces_respuesta')).toBeTruthy();
    expect(lightVariant('ens ha beneït en Crist.\n\nPer amor ens destinà', 'ens ha beneït en Crist.\nPer amor ens destinà', 'salmos_textos')).toBeTruthy();
  });

  test('one word in fifty may differ in prose, and no more', () => {
    const base = Array.from({ length: 100 }, (_, i) => `mot${i}`);
    const two = [...base];
    two[10] = 'altre';
    two[60] = 'diferent';
    expect(lightVariant(base.join(' '), two.join(' '), 'himnos')).toMatchObject({ edits: 2 });
    const three = [...two];
    three[90] = 'encara';
    expect(lightVariant(base.join(' '), three.join(' '), 'himnos')).toBeNull();
  });

  test('a line missing from a psalm is another text', () => {
    const psalm = 'Beneïu el Senyor, totes les criatures, canteu-li lloances per sempre. '
      + 'Beneïu-lo, àngels del Senyor, beneïu-lo, cels. Beneïu-lo, aigües de dalt del cel, '
      + 'beneïu-lo, exèrcits del Senyor. Beneïu-lo, sol i lluna, beneïu-lo, estrelles del cel.';
    const withoutALine = psalm.replace('Beneïu-lo, sol i lluna, beneïu-lo, estrelles del cel.', '');
    expect(lightVariant(psalm, withoutALine, 'salmos_textos')).toBeNull();
  });

  test('«al·leluia» makes it the Easter antiphon, which belongs to other days', () => {
    expect(lightVariant(
      'Sofrint amb constància, us guanyareu la vida eterna.',
      'Sofrint amb constància, us guanyareu la vida eterna, al·leluia.',
      'salmos_antifonas',
    )).toBeNull();
  });

  test('a line given to the other voice of a responsory is not a copy', () => {
    expect(lightVariant('℟. I féu la meva vida immaculada.', '℣. I féu la meva vida immaculada.', 'responsorios')).toBeNull();
  });

  test('in a reference a digit is another reading', () => {
    expect(lightVariant('Ga 6, 8', 'Ga 6, 7b-8', 'lectura_breve_citas')).toBeNull();
    expect(lightVariant('He 13, 20-21', 'He 13,20-21', 'lectura_breve_citas')).toBeTruthy();
    expect(lightVariant('Is 12,2-3.4bcd.5-6 (R.: 3)', 'Is 12,2.3-4bcd.5-6 (R.: 3)', 'lecturas_referencia')).toBeNull();
  });
});

describe('the psalm the Spanish of the cell names', () => {
  test('the part of a psalm said in pieces', () => {
    expect(psalmPart('Salm 117 - I\nHimne triomfal d’acció de gràcies')).toBe('I');
    expect(psalmPart('Salmo 36, 12-29 (II)')).toBe('II');
    expect(psalmPart('Salm 30, 2-17.20-25 - III')).toBe('III');
    expect(psalmPart('Salm 113 B')).toBeNull();
    expect(psalmPart('Salm 118, 65-72 \nIX (Teth)')).toBeNull();
  });

  test('the same psalm and part, across the two spellings', () => {
    expect(psalmScore('Salm 117 - I', 'Salmo 117, 1-9 (I): Himno de acción de gracias')).toBe(2);
    expect(psalmScore('Salm 118, 65-72 ', 'Salmo 118,65-72: IX (Teth)')).toBe(2);
    expect(psalmScore('Càntic\nCf. Ap 19, 1-2.5-7', 'Apocalipsis 19, 1-2. 5-7: Las bodas del Cordero')).toBe(2);
    expect(psalmScore('Salm 109', 'Salmo 109, 1-5. 7')).toBe(1);
  });

  test('another psalm, another part, or other verses of Psalm 118', () => {
    expect(psalmScore('Salm 69', 'Salmo 118,65-72')).toBe(0);
    expect(psalmScore('Salm 117 - I', 'Salmo 117, 10-18 (II)')).toBe(0);
    expect(psalmScore('Salm 118, 25-32 ', 'Salmo 118,65-72')).toBe(0);
    expect(psalmScore('Salm 113 A', 'Salmo 113 B')).toBe(0);
  });
});

describe('a held cell', () => {
  test('the heading the Spanish names goes in; All Souls\' Psalm 69 is left to review', () => {
    const r = resolveHeld({
      table: 'salmos_citas',
      esCitation: 'Salmo 118,65-72: IX (Teth)',
      groups: [{ value: 'Salm 69', count: 20 }, { value: 'Salm 118, 65-72 ', count: 390 }],
    });
    expect(r).toEqual({ rule: 'psalm', take: 1, others: [0] });
  });

  test('the Spanish psalm wins even where cpl-app prays it fewer days', () => {
    const r = resolveHeld({
      table: 'salmos_citas',
      esCitation: 'Salmo 121',
      groups: [{ value: 'Salm 124', count: 64 }, { value: 'Salm 121', count: 30 }],
    });
    expect(r.take).toBe(1);
  });

  test('no Catalan heading names the Spanish psalm: held', () => {
    const r = resolveHeld({
      table: 'salmos_citas',
      esCitation: 'Salmo 119: Deseo de la paz',
      groups: [{ value: 'Salm 122', count: 28 }, { value: 'Salm 22', count: 2 }],
    });
    expect(r).toBeNull();
  });

  test('two parts that both half-match a bare heading: held', () => {
    const r = resolveHeld({
      table: 'salmos_citas',
      esCitation: 'Salmo 117',
      groups: [{ value: 'Salm 117 - I', count: 20 }, { value: 'Salm 117 - III', count: 5 }],
    });
    expect(r).toBeNull();
  });

  test('a psalm text goes by the heading it was said under', () => {
    const r = resolveHeld({
      table: 'salmos_textos',
      groups: [
        { value: 'Enaltiu el Senyor: Que n’és, de bo', count: 842, psalmScores: new Map([[2, 842]]) },
        { value: 'Em veig sepultat a la pols', count: 6, psalmScores: new Map([[0, 6]]) },
      ],
    });
    expect(r).toEqual({ rule: 'psalm', take: 0, others: [1] });
  });

  test('a psalm text said under two verdicts is not evidence: held', () => {
    const r = resolveHeld({
      table: 'salmos_textos',
      groups: [
        { value: 'Enaltiu el Senyor', count: 842, psalmScores: new Map([[2, 800], [0, 42]]) },
        { value: 'Em veig sepultat a la pols', count: 6, psalmScores: new Map([[0, 6]]) },
      ],
    });
    expect(r).toBeNull();
  });

  test('copies of one text: the most common one', () => {
    const r = resolveHeld({
      table: 'himnos',
      groups: [
        { value: 'És do del cel el curs del temps\namb què fruïm d’aquests instants', count: 22 },
        { value: 'És do del cel el curs del temps amb què fruïm d’aquests instants,', count: 77 },
      ],
    });
    expect(r).toEqual({ rule: 'light', take: 1, others: [0] });
  });

  test('two copies said the same number of days: no most common one, held', () => {
    const r = resolveHeld({
      table: 'lectura_breve_textos',
      groups: [
        { value: 'Per això el Senyor espera. Feliços tots els qui esperen en ell.', count: 20 },
        { value: 'Per això el Senyor espera. Feliços tots els qui espereu en ell.', count: 20 },
      ],
    });
    expect(r).toBeNull();
  });

  test('two hymns for two seasons: held', () => {
    const r = resolveHeld({
      table: 'himnos',
      groups: [
        { value: 'Veniu, oh Déu, Esperit Sant, igual al Pare com al Fill', count: 514 },
        { value: 'A l’hora en què fou enlairat el Crist a l’arbre de la creu', count: 453 },
      ],
    });
    expect(r).toBeNull();
  });
});

describe('a psalm cpl-app always says, in another psalm\'s cell (MIGRA-021)', () => {
  test('Psalm 124 in the cell the Spanish calls Psalm 121 is not written', () => {
    expect(anotherPsalm({ table: 'salmos_citas', value: 'Salm 124', esCitation: 'Salmo 121: La ciudad santa de Jerusalén' })).toBe(true);
    expect(anotherPsalm({ table: 'salmos_textos', value: 'El qui confia en el Senyor', psalmScores: new Map([[0, 20]]) })).toBe(true);
  });

  test('the psalm the Spanish names, or no evidence either way, is written', () => {
    expect(anotherPsalm({ table: 'salmos_citas', value: 'Salm 121', esCitation: 'Salmo 121' })).toBe(false);
    expect(anotherPsalm({ table: 'salmos_citas', value: 'Salm 121', esCitation: null })).toBe(false);
    expect(anotherPsalm({ table: 'salmos_textos', value: 'x', psalmScores: new Map([[2, 5], [0, 1]]) })).toBe(false);
    expect(anotherPsalm({ table: 'salmos_textos', value: 'x' })).toBe(false);
    expect(anotherPsalm({ table: 'himnos', value: 'x' })).toBe(false);
  });
});
