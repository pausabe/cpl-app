import {
  buildDayCard,
  celebrationTypeLabel,
  colorCode,
  memorialNames,
  memorialsLabel,
  octaveName,
  seasonName,
  seasonTitle,
  shortMemorialName,
  weekdayOfTheSeason,
  weekOfSeason,
  weekText,
  DayInput,
  MemorialsInput,
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

describe('a day with more than one optional memorial', () => {
  // Friday 9 October 2026, in Barcelona
  const friday = day({ date: new Date(2026, 9, 9), celebrationType: 'L', week: '27', weekCycle: '3' });
  const DIONIS = { id: 381, title: 'Sants Dionís, bisbe, i companys, màrtirs', description: 'Segons notícia de…' };
  const LEONARDI = { id: 382, title: 'Sant Joan Leonardi, prevere', description: 'Nasqué a Lucca (Toscana)…' };
  const both = (chosen: number | null): MemorialsInput => ({ options: [DIONIS, LEONARDI], chosen });
  // What the hours have loaded: the one the app has always offered, celebrated or not
  const loaded = { title: DIONIS.title, description: DIONIS.description };

  test('none chosen: the weekday is prayed, and a row to celebrate one of them', () => {
    const card = buildDayCard(friday, loaded, barcelona, both(null));
    expect(card.title).toBe("Setmana XXVII de durant l'any");
    expect(card.celebration).toEqual({
      typeLabel: 'Dues memòries lliures',
      title: 'Avui es resa la fèria',
      muted: false,
      description: null,
      optionalMemory: null,
      memorials: {
        memorialLabel: 'Memòria lliure',
        celebrated: false,
        action: 'Celebrar una memòria',
        names: 'Sants Dionís i companys o sant Joan Leonardi',
        sheet: {
          title: 'Què celebres avui?',
          subtitle: 'Divendres, 9 d’octubre · dues memòries lliures',
          options: [
            {
              id: null,
              title: 'Fèria',
              subtitle: "Divendres de la setmana XXVII de durant l'any",
              selected: true,
            },
            { id: 381, title: DIONIS.title, subtitle: 'Segons notícia de…', selected: false },
            { id: 382, title: LEONARDI.title, subtitle: 'Nasqué a Lucca (Toscana)…', selected: false },
          ],
        },
      },
    });
  });

  test('one chosen: its name and its story, and the row to change it', () => {
    const card = buildDayCard(
      friday,
      { title: LEONARDI.title, description: LEONARDI.description },
      { ...barcelona, optionalFestivityEnabled: true },
      both(382),
    );
    expect(card.celebration).toMatchObject({
      typeLabel: 'Dues memòries lliures',
      title: 'Sant Joan Leonardi, prevere',
      muted: false,
      description: 'Nasqué a Lucca (Toscana)…',
      optionalMemory: null,
    });
    expect(card.celebration?.memorials).toMatchObject({ celebrated: true, action: 'Canviar' });
    expect(card.celebration?.memorials?.sheet.options.map((option) => option.selected)).toEqual([false, false, true]);
  });

  test('a saint without a story has no «Llegeix-ne més» and no line under it in the sheet', () => {
    const quiet = { ...LEONARDI, description: '-' };
    const card = buildDayCard(friday, loaded, barcelona, { options: [DIONIS, quiet], chosen: 382 });
    expect(card.celebration?.description).toBeNull();
    expect(card.celebration?.memorials?.sheet.options[2].subtitle).toBe('');
  });

  test('a story on several lines is one line in the sheet', () => {
    const long = { ...LEONARDI, description: 'Nasqué a Lucca.\nEstudià farmàcia.' };
    const card = buildDayCard(friday, loaded, barcelona, { options: [DIONIS, long], chosen: null });
    expect(card.celebration?.memorials?.sheet.options[2].subtitle).toBe('Nasqué a Lucca. Estudià farmàcia.');
  });

  test('with one memorial, or an obligatory one, the card is as it was', () => {
    const one = buildDayCard(friday, loaded, barcelona, { options: [DIONIS], chosen: null });
    expect(one.celebration).toEqual({
      typeLabel: 'Memòria lliure',
      title: DIONIS.title,
      muted: true,
      description: DIONIS.description,
      optionalMemory: { enabled: false, caption: 'Si no l’actives, avui es resa la fèria.' },
    });
    const obligatory = buildDayCard({ ...friday, celebrationType: 'M' }, loaded, barcelona, both(null));
    expect(obligatory.celebration?.typeLabel).toBe('Memòria obligatòria');
    expect(obligatory.celebration?.memorials).toBeUndefined();
  });

  test('three memorials, «Tres memòries lliures», and the names one after the other', () => {
    const card = buildDayCard(
      day({ date: new Date(2026, 9, 19), celebrationType: 'L', week: '29' }),
      { title: 'Sants Joan de Brébeuf i Isaac Jogues, preveres, i companys, màrtirs', description: '-' },
      barcelona,
      {
        options: [
          { id: 391, title: 'Sants Joan de Brébeuf i Isaac Jogues, preveres, i companys, màrtirs', description: '-' },
          { id: 392, title: 'Sant Pau de la Creu, prevere', description: '-' },
          { id: 393, title: 'Sant Pere d’Alcàntara, prevere', description: '-' },
        ],
        chosen: null,
      },
    );
    expect(card.celebration?.typeLabel).toBe('Tres memòries lliures');
    expect(card.celebration?.memorials?.names).toBe(
      'Sants Joan de Brébeuf i Isaac Jogues i companys, sant Pau de la Creu o sant Pere d’Alcàntara',
    );
    expect(card.celebration?.memorials?.sheet.subtitle).toBe('Dilluns, 19 d’octubre · tres memòries lliures');
    expect(card.celebration?.memorials?.sheet.options[0].subtitle).toBe("Dilluns de la setmana XXIX de durant l'any");
  });

  test('in Lent they are commemorations', () => {
    expect(memorialsLabel(2, 'Quaresma')).toBe('Dues commemoracions');
    expect(memorialsLabel(2, 'Pasqua')).toBe('Dues memòries lliures');
    expect(memorialsLabel(4, 'Ordinari')).toBe('Quatre memòries lliures');
  });

  test('the weekday in its week, as the sheet says it', () => {
    const easter = day({ date: new Date(2027, 3, 13), genericLiturgyTime: 'Pasqua', week: '2' });
    expect(weekdayOfTheSeason(easter)).toBe('Dimarts de la setmana II de Pasqua');
    const christmas = day({ date: new Date(2027, 0, 5), genericLiturgyTime: 'Nadal', week: '1' });
    expect(weekdayOfTheSeason(christmas)).toBe('Dimarts del temps de Nadal');
  });

  test.each([
    ['Sant Joan Leonardi, prevere', 'Sant Joan Leonardi'],
    ['Sants Dionís, bisbe, i companys, màrtirs', 'Sants Dionís i companys'],
    ['Sants Poncià, papa, i Hipòlit, prevere, màrtirs', 'Sants Poncià i Hipòlit'],
    ['Sants Joan Fisher, bisbe, i Tomàs More, màrtirs', 'Sants Joan Fisher i Tomàs More'],
    ['Santa Margarida d’Escòcia', 'Santa Margarida d’Escòcia'],
    ['Sant Climent I, papa i màrtir', 'Sant Climent I'],
    ['Sants Germà, Paulí, Just i Sici, màrtirs', 'Sants Germà, Paulí, Just i Sici'],
    [
      'Beat Joan Huguet i beat Josep Castell, preveres, beat Àngel de Ferreries, i companys màrtirs',
      'Beat Joan Huguet i beat Josep Castell, beat Àngel de Ferreries i companys màrtirs',
    ],
    ['Mare de Déu de Loreto', 'Mare de Déu de Loreto'],
  ])('«%s», short: «%s»', (title, short) => {
    expect(shortMemorialName(title)).toBe(short);
  });

  test('the names in a sentence: «sant» in lower case but for the first, and «Mare de Déu» as it is', () => {
    expect(memorialNames(['Sant Blai, bisbe i màrtir', 'Sant Òscar, bisbe'])).toBe('Sant Blai o sant Òscar');
    expect(memorialNames(['Santa Eulàlia de Mèrida, verge i màrtir', 'Mare de Déu de Loreto'])).toBe(
      'Santa Eulàlia de Mèrida o Mare de Déu de Loreto',
    );
  });
});
