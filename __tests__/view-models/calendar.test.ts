import {
  calendarMonth,
  dateOfIso,
  DayMarkInput,
  DayMarks,
  dayLabel,
  dayLook,
  isoDate,
  isSelectable,
  isSidewaysDrag,
  mainColor,
  monthAfterSwipe,
  monthRibbon,
  monthTitle,
  rankLabel,
  sameDay,
  shiftMonth,
  WEEKDAY_INITIALS,
} from '../../src/view-models/calendar';

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

describe('every day on its colour, as strong as its rank', () => {
  test('a solemnity, a feast and a memorial are painted; an optional memorial and a weekday are not', () => {
    expect(dayLook(mark('2026-12-08', { color: 'B', letter: 'S' }))).toEqual({ color: 'B', rank: 'solemnity' });
    expect(dayLook(mark('2026-10-12', { color: 'B', letter: 'F' }))).toEqual({ color: 'B', rank: 'feast' });
    expect(dayLook(mark('2026-10-17', { color: 'R', letter: 'M' }))).toEqual({ color: 'R', rank: 'memory' });
    expect(dayLook(mark('2026-10-06', { letter: 'L' }))).toEqual({ color: 'V', rank: null });
    expect(dayLook(mark('2026-10-31', { letter: 'V' }))).toEqual({ color: 'V', rank: null });
    expect(dayLook(mark('2026-10-13'))).toEqual({ color: 'V', rank: null });
  });

  test('a colour the database does not use is green, as on the day card', () => {
    expect(dayLook(mark('2026-10-13', { color: 'X' })).color).toBe('V');
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
    expect(day(12).look).toEqual({ color: 'B', rank: 'feast' });
    expect(day(6).label).toBe('dimarts, 6 d’octubre, memòria lliure');
    expect(day(5).label).toBe('dilluns, 5 d’octubre, memòria obligatòria, avui');
    // A day not loaded yet: no colour, and its date alone
    expect(day(13).look).toBeNull();
    expect(day(13).label).toBe('dimarts, 13 d’octubre');
  });

  test('the key under the month takes the colour most of its days have', () => {
    expect(
      mainColor([
        { color: 'M', rank: null },
        { color: 'M', rank: null },
        { color: 'B', rank: 'solemnity' },
      ]),
    ).toBe('M');
    expect(mainColor([])).toBeNull();
    expect(calendarMonth({ year: 2026, month: 9, today }).color).toBeNull();
    const marks = byDate(mark('2026-10-01', { color: 'B' }), mark('2026-10-02', { color: 'B' }), mark('2026-10-03'));
    expect(calendarMonth({ year: 2026, month: 9, today, marks }).color).toBe('B');
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
