// The Common is written into cells cpl-app can never fill, and the direction is the whole
// safety of it. Get it backwards and the join files the Common's text into the WEEKDAY cell —
// a cell shared by dozens of ordinary days that agree on the weekday's own text — and either
// corrupts it or drops it as conflicted forever. Nothing on screen would say so.
//
// Pinned here: which cell each mode names, which Common a day belongs to, and that the six
// responsory slots line up. Decision and evidence: decisions/D-001-el-comu-a-les-memories.md.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const memorialFerial = require('./lib/memorial-ferial');
const commonOffice = require('./lib/common-office');
const { fingerprint } = require('./lib/citation-key');

const citeKey = (s) => { const f = s ? fingerprint(s) : null; return f ? f.token : null; };

// Shaped like the probe's measured cell map for 3 September 2026, Laudes: the memorial's own
// cells plus the weekday's under `_Ferial`.
const MEASURED = {
  lectura_biblica_cita: 'lectura_breve_citas/66',
  lectura_biblica_cita_Ferial: 'lectura_breve_citas/128',
  responsorios: ['responsorios/1460', 'responsorios/1461', 'responsorios/1462',
    'responsorios/1463', 'responsorios/1464', 'responsorios/1465'],
  responsorios_Ferial: ['responsorios/2324', 'responsorios/2325', 'responsorios/2326',
    'responsorios/2327', 'responsorios/2328', 'responsorios/2329'],
  cantico_evangelico_antifona: 'cantico_evangelico_antifonas/251',
  cantico_evangelico_antifona_Ferial: 'cantico_evangelico_antifonas/69',
};
const KEY = 'gregory_i_the_great_pope__MEMORY_FERIAL1';

describe('which cell each mode names', () => {
  // Everything but the gospel antiphon: cpl-app takes those from the weekday.
  const fromFerial = new Set(['lectura_biblica_cita', 'responsorios']);
  const options = { allXKey: KEY, fromFerial };

  it('sends what cpl-app renders to the weekday cell, and the Common to the memorial one', () => {
    const own = memorialFerial.cellsForMode(MEASURED, options, 0);
    const other = memorialFerial.cellsForMode(MEASURED, options, 1);
    expect(own.lectura_biblica_cita).toBe('lectura_breve_citas/128');    // Rm 14, 17-19
    expect(other.lectura_biblica_cita).toBe('lectura_breve_citas/66');   // He 13, 7-9a
    expect(own.responsorios[0]).toBe('responsorios/2324');
    expect(other.responsorios[0]).toBe('responsorios/1460');
  });

  it('leaves a field cpl-app supplies itself on the memorial cell, where its own text goes', () => {
    const own = memorialFerial.cellsForMode(MEASURED, options, 0);
    expect(own.cantico_evangelico_antifona).toBe('cantico_evangelico_antifonas/251');
    // Index 1 here is the WEEKDAY's antiphon cell, which belongs to the weekday. This is why
    // the caller gates on fromFerial instead of writing everything mode 1 offers.
    const other = memorialFerial.cellsForMode(MEASURED, options, 1);
    expect(other.cantico_evangelico_antifona).toBe('cantico_evangelico_antifonas/69');
    expect(fromFerial.has('cantico_evangelico_antifona')).toBe(false);
  });

  it('offers no second cell at all on a day without the two tabs', () => {
    const other = memorialFerial.cellsForMode(MEASURED, { allXKey: 'ordinary_time_22_thursday__ANY', fromFerial }, 1);
    expect(Object.keys(other)).toHaveLength(0);
  });
});

describe('which Common a day belongs to', () => {
  let commons; let byCategoria;
  beforeAll(() => {
    const db = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
    ({ commons, byCategoria } = commonOffice.loadCommons(db));
  });

  const pick = (title, want) => commonOffice.pickCommonRow({
    title, suffix: 'O', commons, byCategoria, want, citeKey,
  });

  it('lets the Spanish citation overrule the title on a saint who wears two hats', () => {
    // "papa i doctor" fires the doctors' test first; Hb 13, 7-9a says Pastors.
    const p = pick('Sant Gregori el Gran, papa i doctor de l’Església', { Laudes: citeKey('Hb 13, 7-9a') });
    expect(p.row.Categoria).toBe('06cO');
    expect(p.pickedBy).toBe('citation');
    expect(p.titleWouldSay).toBe('Comú de doctors de l’Església');
  });

  it('picks within the family by title, not by whichever row comes first', () => {
    // 06a/06b/06c/06d all share that reading; "papa" is what makes it 06c and not 06a.
    const p = pick('Sant Gregori el Gran, papa i doctor de l’Església', { Laudes: citeKey('Hb 13, 7-9a') });
    expect(p.family.sort()).toEqual(['06aO', '06bO', '06cO', '06dO']);
  });

  it('falls back to the title when neither Hour offers a citation', () => {
    const p = pick('Sant Gregori el Gran, papa i doctor de l’Església', {});
    expect(p.row.Categoria).toBe('07aO');
    expect(p.pickedBy).toBe('title');
  });

  it('names no Common at all rather than guessing one', () => {
    expect(pick('Fèria del temps ordinari', {}).row).toBeNull();
  });
});

describe('which season of the Common', () => {
  // The Commons come in four seasonal variants and cpl-app names its seasons in codes, not
  // words: Eastertide is `P_SETMANES`, not "PASQUA". Matching the words sent every season to
  // Ordinary Time, and the join then wrote the Ordinary Pastors' responsory into
  // `responsorios/2777` — a 10-May cell whose Spanish sibling ends "Aleluya, aleluya".
  it('reads the real codes for every season', () => {
    expect(commonOffice.seasonSuffix('O_ORDINAR')).toBe('O');
    expect(commonOffice.seasonSuffix('P_SETMANES')).toBe('P');
    expect(commonOffice.seasonSuffix('P_OCTAVA')).toBe('P');
    expect(commonOffice.seasonSuffix('Q_SETMANES')).toBe('Q');
    expect(commonOffice.seasonSuffix('Q_CENDRA')).toBe('Q');
    expect(commonOffice.seasonSuffix('A_SETMANES')).toBe('A');
    expect(commonOffice.seasonSuffix('N_OCTAVA')).toBe('A');
  });

  it('files Easter Sunday under Eastertide, though its code carries the Lent prefix', () => {
    expect(commonOffice.seasonSuffix('Q_DIUM_PASQUA')).toBe('P');
    expect(commonOffice.seasonSuffix('Q_TRIDU')).toBe('Q');
  });

  it('falls back to Ordinary Time on an unknown or missing code', () => {
    expect(commonOffice.seasonSuffix('')).toBe('O');
    expect(commonOffice.seasonSuffix(null)).toBe('O');
    expect(commonOffice.seasonSuffix('QUELCOM_ALTRE')).toBe('O');
  });
});

describe('what the Common offers', () => {
  let byCategoria;
  beforeAll(() => {
    const db = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
    ({ byCategoria } = commonOffice.loadCommons(db));
  });

  it('fills the six responsory slots in the order the index stores them', () => {
    const pool = commonOffice.poolByField(byCategoria.get('06cO')).Laudes;
    expect(pool.responsorios).toHaveLength(6);
    expect(pool.responsorios[0]).toBe('℣. Sobre teu, Jerusalem, * He apostat sentinelles.');
    expect(pool.responsorios[3]).toBe('℟. He apostat sentinelles.');
    // Slot 5 is the doxology and slot 6 the repeated response — not the other way round.
    expect(pool.responsorios[4]).toBe(`℣. ${commonOffice.GLORIA_PATRI_SHORT}`);
    expect(pool.responsorios[5]).toBe('℟. Sobre teu, Jerusalem, He apostat sentinelles.');
  });

  it('splits the prayers blob into the cells the index has for them', () => {
    const pool = commonOffice.poolByField(byCategoria.get('06cO'));
    expect(pool.Laudes.preces_respuesta).toBe('Pastureu, Senyor, el vostre poble.');
    expect(pool.Laudes.preces_contenido).toHaveLength(4);   // preces_contenido/998..1001
    expect(pool.Vespers.preces_contenido).toHaveLength(5);  // preces_contenido/5702..5706
  });

  it('gives the Easter responsory its Alleluia, and Ordinary Time none', () => {
    const o = commonOffice.poolByField(byCategoria.get('06cO')).Laudes.responsorios[0];
    const p = commonOffice.poolByField(byCategoria.get('06cP')).Laudes.responsorios[0];
    expect(o).not.toMatch(/al·leluia/i);
    expect(p).toMatch(/al·leluia/i);   // el castellà de responsorios/2777 acaba "Aleluya, aleluya"
  });

  it('treats a dash as "not here", never as a text to write', () => {
    expect(commonOffice.usable('-')).toBe(false);
    expect(commonOffice.usable('  ')).toBe(false);
    expect(commonOffice.usable('He 13, 7-9a')).toBe(true);
  });
});

// --- Memòries d'ofici propi (MIGRA-004) ------------------------------------------------
//
// Els set dies amb cicle `MEMORY_PROPER` no tenen pestanya ferial, o sigui que la casella de
// la memòria i la de la fèria són la mateixa. Abans del pedaç, `hasSwitch` deia que no i el
// text ferial de cpl-app hi anava a parar: la lectura de la fèria de Nadal dins de
// `lectura_breve_citas/66`, on 158 dates hi posen el Comú de pastors, i l'id retingut per
// sempre. Decisió i abast: decisions/D-002-el-comu-als-oficis-propis.md.

// El 2 de gener, Laudes: una sola pestanya, i per això cap camp no du bessó `_Ferial`.
const MEASURED_PROPER = {
  lectura_biblica_cita: 'lectura_breve_citas/66',
  lectura_biblica: 'lectura_breve_textos/67',
  responsorios: ['responsorios/2843', 'responsorios/2844', 'responsorios/2845',
    'responsorios/2846', 'responsorios/2847', 'responsorios/2848'],
  cantico_evangelico_antifona: 'cantico_evangelico_antifonas/70',
};
const KEY_PROPER = 'basil_the_great_and_gregory_nazianzen_bishops__MEMORY_PROPER';

describe('memòries sense pestanya ferial', () => {
  it('les reconeix, i no les confon amb les que sí que en tenen', () => {
    expect(memorialFerial.isProperOnly(KEY_PROPER)).toBe(true);
    expect(memorialFerial.isProperOnly(KEY)).toBe(false);
    expect(memorialFerial.isProperOnly('ordinary_time_22_thursday__ANY')).toBe(false);
    expect(memorialFerial.isProperOnly(null)).toBe(false);
  });

  it('no ofereix cap segona casella, perquè no n’hi ha cap', () => {
    const fromFerial = new Set(['lectura_biblica_cita']);
    const other = memorialFerial.cellsForMode(MEASURED_PROPER, { allXKey: KEY_PROPER, fromFerial }, 1);
    expect(Object.keys(other)).toHaveLength(0);
    // I la casella pròpia segueix sent la del sant: no hi ha on redirigir res.
    const own = memorialFerial.cellsForMode(MEASURED_PROPER, { allXKey: KEY_PROPER, fromFerial }, 0);
    expect(own.lectura_biblica_cita).toBe('lectura_breve_citas/66');
  });
});

describe('qui es queda la casella quan només n’hi ha una', () => {
  let commons; let byCategoria;
  beforeAll(() => {
    const db = new DatabaseSync(path.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
    ({ commons, byCategoria } = commonOffice.loadCommons(db));
  });

  // Tal com arriba del castellà de `lectura_breve_citas/66`: la cita del Comú de pastors.
  const pickWith = (title, cita) => commonOffice.pickCommonRow({
    title, suffix: 'O', commons, byCategoria,
    want: cita ? { Laudes: citeKey(cita) } : {},
    citeKey,
  });

  const FROM_FERIAL = new Set([
    'lectura_biblica_cita', 'lectura_biblica', 'responsorios', 'preces_intro',
    'preces_respuesta', 'preces_contenido',
  ]);

  it('dona al Comú els camps que cpl-app pren de la fèria, i cap més', () => {
    const picked = pickWith('Sants Basili el Gran i Gregori Nazianzè, bisbes i doctors de l’Església', 'Hb 13, 7-9a');
    const pool = commonOffice.poolByField(picked.row).Laudes;
    const taken = commonOffice.commonOverrides({ pool, fromFerial: FROM_FERIAL, pickedBy: picked.pickedBy });
    expect(taken.has('lectura_biblica_cita')).toBe(true);
    expect(taken.has('responsorios')).toBe(true);
    // L'antífona del Benedictus és pròpia de la memòria: cpl-app la supleix i el Comú no hi
    // toca, encara que la tingui al seu pou.
    expect(pool.cantico_evangelico_antifona).toBeTruthy();
    expect(taken.has('cantico_evangelico_antifona')).toBe(false);
  });

  it('no pren res si la cita castellana no nomena cap Comú: val més no tocar-ho', () => {
    // `Is 49, 8-9` és la lectura de la fèria de Nadal. Si la casella la dugués, voldria dir
    // que eprex apunta el dia a la casella del dia i no a la del Comú: aquí no s'hi escriu.
    const picked = pickWith('Sants Basili el Gran i Gregori Nazianzè, bisbes i doctors de l’Església', 'Is 49, 8-9');
    expect(picked.pickedBy).toBe('title');
    const pool = commonOffice.poolByField(picked.row).Laudes;
    const taken = commonOffice.commonOverrides({ pool, fromFerial: FROM_FERIAL, pickedBy: picked.pickedBy });
    expect(taken.size).toBe(0);
  });

  it('no pren res d’un camp que cpl-app no ha tret de la fèria', () => {
    const picked = pickWith('Sants Basili el Gran i Gregori Nazianzè, bisbes i doctors de l’Església', 'Hb 13, 7-9a');
    const pool = commonOffice.poolByField(picked.row).Laudes;
    const taken = commonOffice.commonOverrides({ pool, fromFerial: new Set(), pickedBy: picked.pickedBy });
    expect(taken.size).toBe(0);
  });

  it('tria el Comú de pastors (diversos), i la cita hi va d’acord amb el títol', () => {
    // Aquí el títol no s'equivoca com amb sant Gregori el Gran: el patró dels doctors és
    // `doctora? de l`, que no encaixa amb el plural «doctors de l'Església», i el títol cau
    // a `bisbes` → 06d. La cita hi va d'acord, i per això `pickedBy` diu que hi van tots dos.
    const picked = pickWith('Sants Basili el Gran i Gregori Nazianzè, bisbes i doctors de l’Església', 'Hb 13, 7-9a');
    expect(picked.pickedBy).toBe('title+citation');
    expect(picked.row.Categoria).toBe('06dO');
    expect(picked.row.citaLBLaudes).toBe('He 13, 7-9a');
    // I `title+citation` també val com a prova: `commonOverrides` accepta les dues formes on
    // la cita hi participa, i només rebutja la que va pel títol tota sola.
    const pool = commonOffice.poolByField(picked.row).Laudes;
    expect(commonOffice.commonOverrides({ pool, fromFerial: FROM_FERIAL, pickedBy: picked.pickedBy }).size)
      .toBeGreaterThan(0);
  });
});
