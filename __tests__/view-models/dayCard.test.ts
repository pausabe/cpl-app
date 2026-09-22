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
  Date: new Date(2026, 8, 22),
  CelebrationType: '-',
  LiturgyColor: 'V',
  GenericLiturgyTime: 'Ordinari',
  SpecificLiturgyTime: 'O_ORDINAR',
  Week: '25',
  WeekCycle: '1',
  YearType: 'A',
  ...overrides,
});
const barcelona = { DioceseName: 'Barcelona', PrayingPlace: 'Diòcesi', OptionalFestivityEnabled: false };
const noCelebration = { Title: '', Description: '-' };

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
      day({ Date: new Date(2026, 8, 21), CelebrationType: 'F', LiturgyColor: 'R' }),
      { Title: 'Sant Mateu, apòstol i evangelista', Description: 'Era cobrador d’impostos…' },
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
        Date: new Date(2026, 3, 5),
        CelebrationType: 'S',
        LiturgyColor: 'B',
        GenericLiturgyTime: 'Pasqua',
        SpecificLiturgyTime: 'Q_DIUM_PASQUA',
        Week: '1',
      }),
      { Title: 'Diumenge de Pasqua', Description: '' },
      barcelona,
    );
    expect(card.typeLabel).toBe('Solemnitat');
    expect(card.meta).toBe('Pasqua · Any A · Setmana I del salteri');
    expect(card.colorName).toBe('Blanc');
  });

  test('un dia propi del temps amb títol (Rams) no porta tipus i diu el temps', () => {
    const card = buildDayCard(
      day({
        Date: new Date(2026, 2, 29),
        LiturgyColor: 'R',
        GenericLiturgyTime: 'Quaresma',
        SpecificLiturgyTime: 'Q_DIUM_RAMS',
        Week: '6',
        WeekCycle: '2',
      }),
      { Title: 'Diumenge de Rams', Description: '-' },
      barcelona,
    );
    expect(card.typeLabel).toBeNull();
    expect(card.title).toBe('Diumenge de Rams');
    expect(card.meta).toBe('Quaresma · Any A · Setmana II del salteri');
  });

  test('memòria lliure sense celebrar: en gris, amb l’interruptor apagat', () => {
    const card = buildDayCard(
      day({ Date: new Date(2026, 8, 26), CelebrationType: 'L' }),
      { Title: 'Sants Cosme i Damià, màrtirs', Description: 'Per memòries…' },
      barcelona,
    );
    expect(card.typeLabel).toBe('Memòria lliure');
    expect(card.muted).toBe(true);
    expect(card.optionalMemory).toEqual({ enabled: false, caption: 'Si no l’actives, avui es resa la fèria.' });
    expect(card.meta).toBe('Setmana XXV · Any A · Setmana I del salteri');
  });

  test('memòria lliure celebrada', () => {
    const card = buildDayCard(
      day({ CelebrationType: 'V' }),
      { Title: 'Memòria de Santa Maria en dissabte', Description: '-' },
      { ...barcelona, OptionalFestivityEnabled: true },
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
        Date: new Date(2026, 3, 4),
        LiturgyColor: 'M',
        GenericLiturgyTime: 'Tridu Pasqual',
        SpecificLiturgyTime: 'Q_TRIDU',
        Week: '0',
        WeekCycle: '2',
      }),
      { Title: 'Dissabte Sant', Description: '-' },
      barcelona,
    );
    expect(card.meta).toBe('Tridu Pasqual · Any A · Setmana II del salteri');
  });

  test('la setmana d’una celebració: sola durant l’any, amb el temps a la resta', () => {
    expect(weekOfSeason(day({ Week: '25' }))).toBe('Setmana XXV');
    expect(weekOfSeason(day({ Week: '3', GenericLiturgyTime: 'Quaresma' }))).toBe('Setmana III de Quaresma');
    expect(weekOfSeason(day({ Week: '1', GenericLiturgyTime: 'Advent' }))).toBe('Setmana I d’Advent');
    expect(weekOfSeason(day({ Week: '2', GenericLiturgyTime: 'Pasqua' }))).toBe('Setmana II de Pasqua');
    expect(weekOfSeason(day({ Date: new Date(2026, 1, 19), SpecificLiturgyTime: 'Q_CENDRA', Week: '0' }))).toBe(
      'Dijous després de Cendra',
    );
    const lent = buildDayCard(
      day({
        Date: new Date(2026, 2, 7),
        CelebrationType: 'M',
        GenericLiturgyTime: 'Quaresma',
        Week: '2',
        WeekCycle: '2',
      }),
      { Title: 'Santes Perpètua i Felicitat, màrtirs', Description: '-' },
      barcelona,
    );
    expect(lent.meta).toBe('Setmana II de Quaresma · Any A · Setmana II del salteri');
  });

  test('els dies després de Cendra', () => {
    expect(weekText(day({ Date: new Date(2026, 1, 18), SpecificLiturgyTime: 'Q_CENDRA', Week: '0' }))).toBe(
      'Dimecres de Cendra',
    );
    expect(weekText(day({ Date: new Date(2026, 1, 20), SpecificLiturgyTime: 'Q_CENDRA', Week: '0' }))).toBe(
      'Divendres després de Cendra',
    );
    expect(weekText(day({ Week: '.', SpecificLiturgyTime: 'O_ORDINAR' }))).toBeNull();
  });

  test('sense setmana ni títol, el títol és el temps', () => {
    const card = buildDayCard(day({ Week: '0', WeekCycle: '0' }), noCelebration, barcelona);
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
