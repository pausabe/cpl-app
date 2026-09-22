import {
  buildDayCard,
  celebrationTypeLabel,
  colorCode,
  seasonName,
  weekOfSeason,
  weekText,
  DayInput,
} from '../../src/view-models/dayCard';

const day = (overrides: Partial<DayInput> = {}): DayInput => ({
  date: new Date(2026, 8, 22),
  celebrationType: '-',
  liturgyColor: 'V',
  genericLiturgyTime: 'Ordinari',
  specificLiturgyTime: 'O_ORDINAR',
  week: '25',
  weekCycle: '1',
  yearType: 'A',
  ...overrides,
});
const barcelona = { dioceseName: 'Barcelona', prayingPlace: 'Diòcesi', optionalFestivityEnabled: false };
const noCelebration = { title: '', description: '-' };

describe('targeta del dia', () => {
  test('una fèria: el dia de la setmana fa de títol i el temps va a la línia de sota', () => {
    const card = buildDayCard(day(), noCelebration, barcelona);
    expect(card).toEqual({
      place: 'Barcelona (Diòcesi)',
      dateText: 'Dimarts, 22 de setembre',
      colorCode: 'V',
      colorName: 'Verd',
      typeLabel: null,
      title: 'Dimarts de la setmana XXV',
      muted: false,
      meta: "Durant l'any · Any A · Setmana I del salteri",
      description: null,
      optionalMemory: null,
    });
  });

  test('una festa: tipus, títol del sant i la setmana a la línia de sota', () => {
    const card = buildDayCard(
      day({ date: new Date(2026, 8, 21), celebrationType: 'F', liturgyColor: 'R' }),
      { title: 'Sant Mateu, apòstol i evangelista', description: 'Era cobrador d’impostos…' },
      barcelona,
    );
    expect(card.typeLabel).toBe('Festa');
    expect(card.title).toBe('Sant Mateu, apòstol i evangelista');
    // The weekday is already in the date: the line fits in one
    expect(card.meta).toBe('Setmana XXV · Any A · Setmana I del salteri');
    expect(card.colorName).toBe('Vermell');
    expect(card.description).toBe('Era cobrador d’impostos…');
  });

  test('una solemnitat del temps diu el temps, no la setmana', () => {
    const card = buildDayCard(
      day({
        date: new Date(2026, 3, 5),
        celebrationType: 'S',
        liturgyColor: 'B',
        genericLiturgyTime: 'Pasqua',
        specificLiturgyTime: 'Q_DIUM_PASQUA',
        week: '1',
      }),
      { title: 'Diumenge de Pasqua', description: '' },
      barcelona,
    );
    expect(card.typeLabel).toBe('Solemnitat');
    expect(card.meta).toBe('Pasqua · Any A · Setmana I del salteri');
    expect(card.colorName).toBe('Blanc');
  });

  test('un dia propi del temps amb títol (Rams) no porta tipus i diu el temps', () => {
    const card = buildDayCard(
      day({
        date: new Date(2026, 2, 29),
        liturgyColor: 'R',
        genericLiturgyTime: 'Quaresma',
        specificLiturgyTime: 'Q_DIUM_RAMS',
        week: '6',
        weekCycle: '2',
      }),
      { title: 'Diumenge de Rams', description: '-' },
      barcelona,
    );
    expect(card.typeLabel).toBeNull();
    expect(card.title).toBe('Diumenge de Rams');
    expect(card.meta).toBe('Quaresma · Any A · Setmana II del salteri');
  });

  test('memòria lliure sense celebrar: en gris, amb l’interruptor apagat', () => {
    const card = buildDayCard(
      day({ date: new Date(2026, 8, 26), celebrationType: 'L' }),
      { title: 'Sants Cosme i Damià, màrtirs', description: 'Per memòries…' },
      barcelona,
    );
    expect(card.typeLabel).toBe('Memòria lliure');
    expect(card.muted).toBe(true);
    expect(card.optionalMemory).toEqual({ enabled: false, caption: 'Si no l’actives, avui es resa la fèria.' });
    expect(card.meta).toBe('Setmana XXV · Any A · Setmana I del salteri');
  });

  test('memòria lliure celebrada', () => {
    const card = buildDayCard(
      day({ celebrationType: 'V' }),
      { title: 'Memòria de Santa Maria en dissabte', description: '-' },
      { ...barcelona, optionalFestivityEnabled: true },
    );
    expect(card.muted).toBe(false);
    expect(card.optionalMemory).toEqual({ enabled: true, caption: 'Avui es resa la memòria.' });
  });

  test('a Quaresma, les memòries són commemoracions', () => {
    expect(celebrationTypeLabel('M', 'Quaresma')).toBe('Commemoració');
    expect(celebrationTypeLabel('L', 'Quaresma')).toBe('Commemoració');
    expect(celebrationTypeLabel('M', 'Ordinari')).toBe('Memòria obligatòria');
    expect(celebrationTypeLabel('-', 'Ordinari')).toBeNull();
  });

  test('sense setmana (Tridu), el títol és el del dia i la línia diu el temps', () => {
    const card = buildDayCard(
      day({
        date: new Date(2026, 3, 4),
        liturgyColor: 'M',
        genericLiturgyTime: 'Tridu Pasqual',
        specificLiturgyTime: 'Q_TRIDU',
        week: '0',
        weekCycle: '2',
      }),
      { title: 'Dissabte Sant', description: '-' },
      barcelona,
    );
    expect(card.meta).toBe('Tridu Pasqual · Any A · Setmana II del salteri');
  });

  test('la setmana d’una celebració: sola durant l’any, amb el temps a la resta', () => {
    expect(weekOfSeason(day({ week: '25' }))).toBe('Setmana XXV');
    expect(weekOfSeason(day({ week: '3', genericLiturgyTime: 'Quaresma' }))).toBe('Setmana III de Quaresma');
    expect(weekOfSeason(day({ week: '1', genericLiturgyTime: 'Advent' }))).toBe('Setmana I d’Advent');
    expect(weekOfSeason(day({ week: '2', genericLiturgyTime: 'Pasqua' }))).toBe('Setmana II de Pasqua');
    expect(weekOfSeason(day({ date: new Date(2026, 1, 19), specificLiturgyTime: 'Q_CENDRA', week: '0' }))).toBe(
      'Dijous després de Cendra',
    );
    const lent = buildDayCard(
      day({
        date: new Date(2026, 2, 7),
        celebrationType: 'M',
        genericLiturgyTime: 'Quaresma',
        week: '2',
        weekCycle: '2',
      }),
      { title: 'Santes Perpètua i Felicitat, màrtirs', description: '-' },
      barcelona,
    );
    expect(lent.meta).toBe('Setmana II de Quaresma · Any A · Setmana II del salteri');
  });

  test('els dies després de Cendra', () => {
    expect(weekText(day({ date: new Date(2026, 1, 18), specificLiturgyTime: 'Q_CENDRA', week: '0' }))).toBe(
      'Dimecres de Cendra',
    );
    expect(weekText(day({ date: new Date(2026, 1, 20), specificLiturgyTime: 'Q_CENDRA', week: '0' }))).toBe(
      'Divendres després de Cendra',
    );
    expect(weekText(day({ week: '.', specificLiturgyTime: 'O_ORDINAR' }))).toBeNull();
  });

  test('sense setmana ni títol, el títol és el temps', () => {
    const card = buildDayCard(day({ week: '0', weekCycle: '0' }), noCelebration, barcelona);
    expect(card.title).toBe("Durant l'any");
    expect(card.meta).toBe('');
  });

  test('el temps ordinari es diu «Durant l’any»', () => {
    expect(seasonName('Ordinari')).toBe("Durant l'any");
    expect(seasonName('Advent')).toBe('Advent');
    expect(seasonName('')).toBe('');
  });

  test('un color que la base de dades no fa servir es veu verd', () => {
    expect(colorCode('R')).toBe('R');
    expect(colorCode('X')).toBe('V');
    expect(colorCode(undefined)).toBe('V');
  });
});
