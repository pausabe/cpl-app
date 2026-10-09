import {
  calendarMonth,
  dateOfIso,
  dayInput,
  DayMarkInput,
  DayMarks,
  dayLabel,
  dayLook,
  isoDate,
  isSelectable,
  isSidewaysDrag,
  monthAfterSwipe,
  monthRibbon,
  monthTitle,
  previewCard,
  RANK_LETTERS,
  rankLabel,
  sameDay,
  seasonColor,
  shiftMonth,
  WEEKDAY_INITIALS,
} from '../../src/view-models/calendar';
import { buildDayCard } from '../../src/view-models/dayCard';

const today = new Date(2026, 8, 22, 10, 30);

// A day as the database gives it for Barcelona: an ordinary weekday unless the test says more
const mark = (date: string, rest: Partial<DayMarkInput> = {}): DayMarkInput => ({
  date,
  color: 'V',
  letter: '-',
  specificSeason: 'O_ORDINAR',
  season: 'Ordinari',
  week: '27',
  yearType: 'A',
  ...rest,
});

const byDate = (...days: DayMarkInput[]): DayMarks => Object.fromEntries(days.map((day) => [day.date, day]));

test('the weeks start on Monday', () => {
  expect(WEEKDAY_INITIALS).toEqual(['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg']);
  // 1 September 2026 is a Tuesday: one gap in front
  const september = calendarMonth({ year: 2026, month: 8, today });
  expect(september.weeks[0][0]).toBeNull();
  expect(september.weeks[0][1]!.day).toBe(1);
  expect(september.weeks.every((week) => week.length === 7)).toBe(true);
  const days = september.weeks.flat().filter(Boolean);
  expect(days).toHaveLength(30);
  expect(days[29]!.day).toBe(30);
});

test('a month that starts on Monday has no gap, and a leap February has 29 days', () => {
  const june = calendarMonth({ year: 2026, month: 5, today });
  expect(june.weeks[0][0]!.day).toBe(1);
  expect(calendarMonth({ year: 2028, month: 1, today }).weeks.flat().filter(Boolean)).toHaveLength(29);
  expect(calendarMonth({ year: 2026, month: 1, today }).weeks.flat().filter(Boolean)).toHaveLength(28);
});

test('the title and the name of each day, in Catalan', () => {
  expect(monthTitle(2026, 8)).toBe('Setembre de 2026');
  expect(monthTitle(2026, 3)).toBe('Abril de 2026');
  expect(dayLabel(new Date(2026, 8, 15))).toBe('dimarts, 15 de setembre');
  expect(dayLabel(new Date(2026, 9, 31))).toBe('dissabte, 31 d’octubre');
});

test('it marks the day chosen and today, and a screen reader hears which one is today', () => {
  const month = calendarMonth({ year: 2026, month: 8, today, selected: new Date(2026, 8, 26) });
  const days = month.weeks.flat().filter(Boolean);
  expect(days.filter((d) => d!.selected).map((d) => d!.day)).toEqual([26]);
  expect(days.filter((d) => d!.today).map((d) => d!.day)).toEqual([22]);
  expect(days[21]!.label).toBe('dimarts, 22 de setembre, avui');
});

test('the days outside the database cannot be chosen, and you cannot move past that month', () => {
  const minimum = new Date(2026, 8, 10);
  const maximum = new Date(2026, 8, 20);
  const month = calendarMonth({ year: 2026, month: 8, today, minimum, maximum });
  const days = month.weeks.flat().filter(Boolean);
  expect(days.filter((d) => !d!.disabled).map((d) => d!.day)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  expect(month.canGoBack).toBe(false);
  expect(month.canGoForward).toBe(false);
  expect(calendarMonth({ year: 2026, month: 9, today, minimum, maximum: new Date(2027, 0, 1) }).canGoForward).toBe(
    true,
  );
  expect(isSelectable(new Date(2026, 8, 10, 23), minimum, maximum)).toBe(true);
  expect(isSelectable(new Date(2026, 8, 9, 23), minimum, maximum)).toBe(false);
});

test('moving from month to month, from one year to the next too', () => {
  expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
  expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  expect(shiftMonth(2026, 8, 0)).toEqual({ year: 2026, month: 8 });
  expect(sameDay(new Date(2026, 8, 22, 1), new Date(2026, 8, 22, 23))).toBe(true);
  expect(sameDay(null, today)).toBe(false);
});

test('a day is found in the marks by its local date', () => {
  expect(isoDate(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05');
  expect(isoDate(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  expect(dateOfIso('2026-12-08')).toEqual(new Date(2026, 11, 8));
});

describe('every day on the colour of its season, with the letter of its celebration', () => {
  test('the colour is the season, whatever the colour of the day itself', () => {
    // The Immaculate Conception is white, in Advent: purple
    expect(dayLook(mark('2026-12-08', { color: 'B', letter: 'S', season: 'Advent' }))).toEqual({
      color: 'M',
      rank: 'solemnity',
      own: 'B',
    });
    // Our Lady of the Pillar is white, and St Ignatius of Antioch red, in ordinary time: green
    // …and the colour of the celebration is kept for its letter
    expect(dayLook(mark('2026-10-12', { color: 'B', letter: 'F' }))).toEqual({ color: 'V', rank: 'feast', own: 'B' });
    expect(dayLook(mark('2026-10-17', { color: 'R', letter: 'M' }))).toEqual({ color: 'V', rank: 'memory', own: 'R' });
    expect(seasonColor(mark('2026-12-26', { color: 'R', season: 'Nadal' }))).toBe('B');
    expect(seasonColor(mark('2026-03-01', { season: 'Quaresma' }))).toBe('M');
    expect(seasonColor(mark('2026-04-12', { season: 'Pasqua' }))).toBe('B');
    expect(seasonColor(mark('2026-04-03', { color: 'R', season: 'Tridu Pasqual' }))).toBe('R');
  });

  test('a solemnity, a feast and a memorial have a letter; an optional memorial and a weekday have not', () => {
    expect(dayLook(mark('2026-10-06', { letter: 'L' }))).toMatchObject({ color: 'V', rank: null });
    expect(dayLook(mark('2026-10-31', { letter: 'V' }))).toMatchObject({ color: 'V', rank: null });
    expect(dayLook(mark('2026-10-13'))).toMatchObject({ color: 'V', rank: null });
    expect(RANK_LETTERS).toEqual({ memory: 'M', feast: 'F', solemnity: 'S' });
  });

  test('a season the calendar does not know takes the colour of the day, and green if it has none', () => {
    expect(seasonColor(mark('2026-10-13', { season: '', color: 'R' }))).toBe('R');
    expect(dayLook(mark('2026-10-13', { season: '', color: 'X' })).color).toBe('V');
  });

  test('the rank is named as the day card names it: a memorial in Lent is a commemoration', () => {
    expect(rankLabel(mark('2026-10-17', { letter: 'M' }))).toBe('Memòria obligatòria');
    expect(rankLabel(mark('2026-10-06', { letter: 'L' }))).toBe('Memòria lliure');
    expect(rankLabel(mark('2026-03-07', { letter: 'M', season: 'Quaresma' }))).toBe('Commemoració');
    expect(rankLabel(mark('2026-10-13'))).toBeNull();
  });

  test('a day of the month says its rank to a screen reader, once its year is loaded', () => {
    const marks = byDate(
      mark('2026-10-12', { color: 'B', letter: 'F' }),
      mark('2026-10-06', { letter: 'L' }),
      mark('2026-10-05', { color: 'B', letter: 'M' }),
    );
    const october = calendarMonth({ year: 2026, month: 9, today: new Date(2026, 9, 5), marks });
    const day = (n: number) => october.weeks.flat().find((d) => d?.day === n)!;
    expect(day(12).label).toBe('dilluns, 12 d’octubre, festa');
    expect(day(12).look).toEqual({ color: 'V', rank: 'feast', own: 'B' });
    expect(day(6).label).toBe('dimarts, 6 d’octubre, memòria lliure');
    expect(day(5).label).toBe('dilluns, 5 d’octubre, memòria obligatòria, avui');
    // A day not loaded yet: no colour, and its date alone
    expect(day(13).look).toBeNull();
    expect(day(13).label).toBe('dimarts, 13 d’octubre');
  });

  test('a month names its seasons under its title, each once and in order', () => {
    const marks = byDate(
      mark('2026-11-28', { season: 'Ordinari' }),
      mark('2026-11-29', { season: 'Advent', color: 'M' }),
      mark('2026-11-30', { season: 'Advent', color: 'R', letter: 'F' }),
    );
    expect(calendarMonth({ year: 2026, month: 10, today, marks }).seasons).toEqual([
      { color: 'V', title: "Durant l'any" },
      { color: 'M', title: 'Temps d’Advent' },
    ]);
    expect(calendarMonth({ year: 2026, month: 9, today }).seasons).toEqual([]);
  });
});

describe('the card of the day touched', () => {
  const card = {
    place: 'Barcelona (Diòcesi)',
    dateText: 'Dijous, 24 de setembre',
    colorCode: 'B' as const,
    colorName: 'Blanc',
    title: "Durant l'any",
    meta: '',
    celebration: {
      typeLabel: 'Solemnitat',
      title: 'Mare de Déu de la Mercè',
      muted: false,
      description: null,
      optionalMemory: null,
    },
  };

  test('says at once what the year knows, and waits only for the name of the celebration', () => {
    const mercy = mark('2026-09-24', { color: 'B', letter: 'S', week: '25' });
    expect(previewCard(new Date(2026, 8, 24), mercy, undefined)).toEqual({
      dateText: 'Dijous, 24 de setembre',
      colorCode: 'B',
      // A solemnity takes the whole day: no week, as on the home
      title: "Durant l'any",
      typeLabel: 'Solemnitat',
      celebrationTitle: null,
      muted: false,
      waiting: true,
    });
    expect(previewCard(new Date(2026, 8, 24), mercy, card)).toMatchObject({
      celebrationTitle: 'Mare de Déu de la Mercè',
      waiting: false,
    });
  });

  test('a weekday has nothing to wait for, and a day of Holy Week has its name at once', () => {
    expect(previewCard(new Date(2026, 8, 23), mark('2026-09-23', { week: '25' }), undefined)).toMatchObject({
      colorCode: 'V',
      title: "Setmana XXV de durant l'any",
      typeLabel: null,
      waiting: false,
    });
    const thursday = mark('2026-04-02', { color: 'B', season: 'Quaresma', specificSeason: 'Q_SET_SANTA', week: '6' });
    expect(previewCard(new Date(2026, 3, 2), thursday, undefined)).toMatchObject({
      title: 'Dijous Sant',
      waiting: false,
    });
    const ashes = mark('2026-02-19', { color: 'M', season: 'Quaresma', specificSeason: 'Q_CENDRA', week: '0' });
    expect(previewCard(new Date(2026, 1, 19), ashes, undefined).title).toBe('Cendra');
  });

  test('an optional memorial is taken as not celebrated, and a day not loaded has its date alone', () => {
    expect(previewCard(new Date(2026, 9, 6), mark('2026-10-06', { letter: 'L' }), undefined)).toMatchObject({
      typeLabel: 'Memòria lliure',
      muted: true,
      waiting: true,
    });
    expect(previewCard(new Date(2026, 9, 6), undefined, undefined)).toEqual({
      dateText: 'Dimarts, 6 d’octubre',
      colorCode: null,
      title: null,
      typeLabel: null,
      celebrationTitle: null,
      muted: false,
      waiting: false,
    });
  });

  test('two optional memorials: «Memòria lliure» as the year says, and their names, or the one chosen', () => {
    const friday = mark('2026-10-09', { letter: 'L' });
    const options = [
      { id: 381, title: 'Sants Dionís, bisbe, i companys, màrtirs', description: '-' },
      { id: 382, title: 'Sant Joan Leonardi, prevere', description: '-' },
    ];
    const cardOf = (chosen: number | null) =>
      buildDayCard(
        { ...dayInput(new Date(2026, 9, 9), friday), weekCycle: '3' },
        { title: chosen === 382 ? options[1].title : options[0].title, description: '-' },
        { dioceseName: 'Barcelona', prayingPlace: 'Diòcesi', optionalFestivityEnabled: chosen !== null },
        { options, chosen },
      );
    const waiting = previewCard(new Date(2026, 9, 9), friday, undefined);
    const none = previewCard(new Date(2026, 9, 9), friday, cardOf(null));
    // Nothing jumps when the day is worked out: the same type, in grey
    expect([none.typeLabel, none.muted]).toEqual([waiting.typeLabel, waiting.muted]);
    expect(none).toMatchObject({
      typeLabel: 'Memòria lliure',
      celebrationTitle: 'Sants Dionís i companys o sant Joan Leonardi',
      muted: true,
      waiting: false,
    });
    expect(previewCard(new Date(2026, 9, 9), friday, cardOf(382))).toMatchObject({
      typeLabel: 'Memòria lliure',
      celebrationTitle: 'Sant Joan Leonardi, prevere',
      muted: false,
    });
  });
});

describe('the row of months', () => {
  test('a year before and a year after the month shown, with January carrying its year', () => {
    const row = monthRibbon({ year: 2026, month: 11, today: new Date(2026, 9, 5) });
    expect(row).toHaveLength(25);
    expect(row[0]).toMatchObject({ year: 2025, month: 11, text: 'des', yearText: null });
    expect(row[12]).toMatchObject({ year: 2026, month: 11, selected: true, label: 'desembre de 2026' });
    expect(row[13]).toMatchObject({ year: 2027, month: 0, text: 'gen', yearText: '2027', label: 'gener de 2027' });
    expect(row.filter((m) => m.selected)).toHaveLength(1);
    expect(row.filter((m) => m.current).map((m) => m.key)).toEqual(['2026-9']);
  });

  test('the Catalan abbreviations, without their full stop', () => {
    const row = monthRibbon({ year: 2026, month: 5, today, reach: 5 });
    expect(row.map((m) => m.text)).toEqual([
      'gen',
      'febr',
      'març',
      'abr',
      'maig',
      'juny',
      'jul',
      'ag',
      'set',
      'oct',
      'nov',
    ]);
  });

  test('it does not go past the months of the database', () => {
    const row = monthRibbon({
      year: 2017,
      month: 1,
      today,
      minimum: new Date(2017, 0, 3),
      maximum: new Date(2100, 11, 29),
    });
    expect(row[0]).toMatchObject({ year: 2017, month: 0, yearText: '2017' });
    expect(row).toHaveLength(14);
    const last = monthRibbon({ year: 2100, month: 11, today, maximum: new Date(2100, 11, 29) });
    expect(last[last.length - 1]).toMatchObject({ year: 2100, month: 11, selected: true });
  });
});

describe('dragging the month sideways', () => {
  test('to the left goes to the next month, to the right to the one before', () => {
    expect(monthAfterSwipe(-120, 0, 350)).toBe(1);
    expect(monthAfterSwipe(120, 0, 350)).toBe(-1);
  });

  test('a short drag stays, unless it is a quick flick', () => {
    expect(monthAfterSwipe(-60, 0.1, 350)).toBe(0);
    expect(monthAfterSwipe(-60, -0.9, 350)).toBe(1);
    expect(monthAfterSwipe(-10, -2, 350)).toBe(0);
  });

  test('only a drag that goes sideways is taken from the days and from the sheet', () => {
    expect(isSidewaysDrag(30, 5)).toBe(true);
    expect(isSidewaysDrag(30, 25)).toBe(false);
    expect(isSidewaysDrag(8, 0)).toBe(false);
    expect(isSidewaysDrag(2, 40)).toBe(false);
  });
});
