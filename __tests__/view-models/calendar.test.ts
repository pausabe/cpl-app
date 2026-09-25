import {
  calendarMonth,
  dayLabel,
  isSelectable,
  monthInYear,
  monthTitle,
  sameDay,
  selectableYears,
  shiftMonth,
  WEEKDAY_INITIALS,
} from '../../src/view-models/calendar';

const today = new Date(2026, 8, 22, 10, 30);

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
  expect(monthTitle(2026, 8)).toBe('setembre de 2026');
  expect(monthTitle(2026, 3)).toBe('abril de 2026');
  expect(dayLabel(new Date(2026, 8, 15))).toBe('dimarts, 15 de setembre');
  expect(dayLabel(new Date(2026, 9, 31))).toBe('dissabte, 31 d’octubre');
});

test('it marks the day chosen and today', () => {
  const month = calendarMonth({ year: 2026, month: 8, today, selected: new Date(2026, 8, 26) });
  const days = month.weeks.flat().filter(Boolean);
  expect(days.filter((d) => d!.selected).map((d) => d!.day)).toEqual([26]);
  expect(days.filter((d) => d!.today).map((d) => d!.day)).toEqual([22]);
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

test('the list of years: those of the database, or five on each side if they are not known', () => {
  expect(selectableYears(2026, new Date(2017, 0, 3), new Date(2026, 11, 29))).toEqual([
    2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
  ]);
  expect(selectableYears(2026)).toEqual([2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031]);
});

test('on changing the year it stays in the same month, if that year has it', () => {
  const min = new Date(2017, 2, 5);
  const max = new Date(2026, 9, 20);
  expect(monthInYear(2019, 8, min, max)).toEqual({ year: 2019, month: 8 });
  // March 2017 is the first month the database has; October 2026, the last
  expect(monthInYear(2017, 0, min, max)).toEqual({ year: 2017, month: 2 });
  expect(monthInYear(2026, 11, min, max)).toEqual({ year: 2026, month: 9 });
});
