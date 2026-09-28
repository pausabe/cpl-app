import {
  buildDayCard,
  celebrationTypeLabel,
  colorCode,
  octaveName,
  seasonName,
  seasonTitle,
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

describe('day card', () => {
  test('a weekday: the week in its season is the title, without the weekday the date already says', () => {
    const card = buildDayCard(day(), noCelebration, barcelona);
    expect(card).toEqual({
      place: 'Barcelona (Diòcesi)',
      dateText: 'Dimarts, 22 de setembre',
      colorCode: 'V',
      colorName: 'Verd',
      title: "Setmana XXV de durant l'any",
      meta: 'Any A · Setmana I del salteri',
      celebration: null,
    });
  });

  test('a feast: the day in its season on top, and the feast under the line', () => {
    const card = buildDayCard(
      day({ date: new Date(2026, 8, 21), celebrationType: 'F', liturgyColor: 'R' }),
      { title: 'Sant Mateu, apòstol i evangelista', description: 'Era cobrador d’impostos…' },
      barcelona,
    );
    expect(card.title).toBe("Setmana XXV de durant l'any");
    expect(card.meta).toBe('Any A · Setmana I del salteri');
    expect(card.colorName).toBe('Vermell');
    expect(card.celebration).toEqual({
      typeLabel: 'Festa',
      title: 'Sant Mateu, apòstol i evangelista',
      muted: false,
      description: 'Era cobrador d’impostos…',
      optionalMemory: null,
    });
  });

  test('a solemnity goes under the line too, under its season: it takes the whole day, not a weekday', () => {
    const card = buildDayCard(
      day({
        date: new Date(2026, 11, 8),
        celebrationType: 'S',
        liturgyColor: 'B',
        genericLiturgyTime: 'Advent',
        specificLiturgyTime: 'A_SETMANES',
        week: '2',
        weekCycle: '2',
        yearType: 'B',
      }),
      { title: 'Immaculada Concepció de la Benaurada Verge Maria', description: '-' },
      barcelona,
    );
    expect(card.title).toBe('Temps d’Advent');
    expect(card.meta).toBe('Any B · Setmana II del salteri');
    expect(card.celebration?.typeLabel).toBe('Solemnitat');
    expect(card.celebration?.title).toBe('Immaculada Concepció de la Benaurada Verge Maria');
    expect(card.celebration?.description).toBeNull();
  });

  test('Easter Sunday opens the octave, which is said instead of the week', () => {
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
    expect(card.title).toBe('Octava de Pasqua');
    expect(card.meta).toBe('Any A · Setmana I del salteri');
    expect(card.celebration?.typeLabel).toBe('Solemnitat');
    expect(card.celebration?.title).toBe('Diumenge de Pasqua');
    expect(card.colorName).toBe('Blanc');
  });

  test('in the Christmas octave the week of the database is that of the psalter: the octave is said', () => {
    const card = buildDayCard(
      day({
        date: new Date(2026, 11, 26),
        celebrationType: 'F',
        liturgyColor: 'R',
        genericLiturgyTime: 'Nadal',
        specificLiturgyTime: 'N_OCTAVA',
        week: '4',
        weekCycle: '4',
        yearType: 'B',
      }),
      { title: 'Sant Esteve, protomàrtir', description: '-' },
      barcelona,
    );
    expect(card.title).toBe('Octava de Nadal');
    expect(card.meta).toBe('Any B · Setmana IV del salteri');
    expect(card.celebration?.title).toBe('Sant Esteve, protomàrtir');
    expect(octaveName('P_OCTAVA')).toBe('Octava de Pasqua');
    expect(octaveName('O_ORDINAR')).toBeNull();
  });

  test('Pentecost is not the eighth week of Easter', () => {
    const card = buildDayCard(
      day({
        date: new Date(2026, 4, 24),
        celebrationType: 'S',
        liturgyColor: 'R',
        genericLiturgyTime: 'Pasqua',
        specificLiturgyTime: 'P_SETMANES',
        week: '8',
        weekCycle: '4',
      }),
      { title: 'Diumenge de Pentecosta', description: '-' },
      barcelona,
    );
    expect(card.title).toBe('Temps de Pasqua');
    expect(card.celebration?.title).toBe('Diumenge de Pentecosta');
  });

  test('in Christmas time there are no weeks: the database has that of the psalter', () => {
    const christmas = { genericLiturgyTime: 'Nadal', specificLiturgyTime: 'N_ABANS', week: '2', weekCycle: '2' };
    const weekday = buildDayCard(day({ date: new Date(2026, 0, 5), ...christmas }), noCelebration, barcelona);
    expect(weekday.title).toBe('Temps de Nadal');
    expect(weekday.meta).toBe('Any A · Setmana II del salteri');
    const baptism = buildDayCard(
      day({ date: new Date(2026, 0, 11), celebrationType: 'F', liturgyColor: 'B', ...christmas, week: '3' }),
      { title: 'Baptisme del Senyor', description: '-' },
      barcelona,
    );
    expect(baptism.title).toBe('Temps de Nadal');
    expect(baptism.celebration?.title).toBe('Baptisme del Senyor');
  });

  test('a proper day of the season with a title (Palm Sunday) is the title on top, with nothing under the line', () => {
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
    expect(card.title).toBe('Diumenge de Rams');
    // The title does not say the season: the line does
    expect(card.meta).toBe('Quaresma · Any A · Setmana II del salteri');
    expect(card.celebration).toBeNull();
  });

  test('a proper day that already names its season does not say it twice', () => {
    const card = buildDayCard(
      day({ genericLiturgyTime: 'Pasqua', specificLiturgyTime: 'P_OCTAVA', week: '1' }),
      { title: 'Octava de Pasqua', description: '-' },
      barcelona,
    );
    expect(card.title).toBe('Octava de Pasqua');
    expect(card.meta).toBe('Any A · Setmana I del salteri');
  });

  test('an optional memorial not celebrated: under the line, in grey, with the switch off', () => {
    const card = buildDayCard(
      day({ date: new Date(2026, 8, 26), celebrationType: 'L' }),
      { title: 'Sants Cosme i Damià, màrtirs', description: 'Per memòries…' },
      barcelona,
    );
    // On top, the weekday the memorial can be left for, as on any other weekday
    expect(card.title).toBe("Setmana XXV de durant l'any");
    expect(card.meta).toBe('Any A · Setmana I del salteri');
    expect(card.celebration).toEqual({
      typeLabel: 'Memòria lliure',
      title: 'Sants Cosme i Damià, màrtirs',
      muted: true,
      description: 'Per memòries…',
      optionalMemory: { enabled: false, caption: 'Si no l’actives, avui es resa la fèria.' },
    });
  });

  test('an optional memorial celebrated', () => {
    const card = buildDayCard(
      day({ celebrationType: 'V' }),
      { title: 'Memòria de Santa Maria en dissabte', description: '-' },
      { ...barcelona, optionalFestivityEnabled: true },
    );
    expect(card.celebration?.muted).toBe(false);
    expect(card.celebration?.optionalMemory).toEqual({ enabled: true, caption: 'Avui es resa la memòria.' });
  });

  test('an obligatory memorial has no switch', () => {
    const card = buildDayCard(
      day({ celebrationType: 'M' }),
      { title: 'Sants Àngels de la Guarda', description: '-' },
      barcelona,
    );
    expect(card.celebration?.typeLabel).toBe('Memòria obligatòria');
    expect(card.celebration?.muted).toBe(false);
    expect(card.celebration?.optionalMemory).toBeNull();
  });

  test('in Lent, memorials are commemorations', () => {
    expect(celebrationTypeLabel('M', 'Quaresma')).toBe('Commemoració');
    expect(celebrationTypeLabel('L', 'Quaresma')).toBe('Commemoració');
    expect(celebrationTypeLabel('M', 'Ordinari')).toBe('Memòria obligatòria');
    expect(celebrationTypeLabel('-', 'Ordinari')).toBeNull();
  });

  test('with no week (the Triduum), the title is that of the day and the line says the season', () => {
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

  test('the week in its season, also in Ordinary Time', () => {
    expect(weekOfSeason(day({ week: '25' }))).toBe("Setmana XXV de durant l'any");
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
    expect(lent.title).toBe('Setmana II de Quaresma');
    expect(lent.meta).toBe('Any A · Setmana II del salteri');
  });

  test('the days after Ash Wednesday', () => {
    expect(weekText(day({ date: new Date(2026, 1, 18), specificLiturgyTime: 'Q_CENDRA', week: '0' }))).toBe(
      'Dimecres de Cendra',
    );
    expect(weekText(day({ date: new Date(2026, 1, 20), specificLiturgyTime: 'Q_CENDRA', week: '0' }))).toBe(
      'Divendres després de Cendra',
    );
    expect(weekText(day({ week: '.', specificLiturgyTime: 'O_ORDINAR' }))).toBeNull();
  });

  test('with neither week nor title, the title is the season', () => {
    const card = buildDayCard(day({ week: '0', weekCycle: '0' }), noCelebration, barcelona);
    expect(card.title).toBe("Durant l'any");
    expect(card.meta).toBe('');
  });

  test('Ordinary Time is called «Durant l’any»', () => {
    expect(seasonName('Ordinari')).toBe("Durant l'any");
    expect(seasonName('Advent')).toBe('Advent');
    expect(seasonName('')).toBe('');
  });

  test('the season as a title says «Temps», but for Ordinary Time and the Triduum', () => {
    expect(seasonTitle('Pasqua')).toBe('Temps de Pasqua');
    expect(seasonTitle('Advent')).toBe('Temps d’Advent');
    expect(seasonTitle('Ordinari')).toBe("Durant l'any");
    expect(seasonTitle('Tridu Pasqual')).toBe('Tridu Pasqual');
    expect(seasonTitle('')).toBe('');
  });

  test('a colour the database does not use shows as green', () => {
    expect(colorCode('R')).toBe('R');
    expect(colorCode('X')).toBe('V');
    expect(colorCode(undefined)).toBe('V');
  });
});
