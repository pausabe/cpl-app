import { dayAndMonth, lowerFirst, monthName, shortMonthName, weekdayName } from './catalanText';
import { celebrationTypeLabel, colorCode, ColorCode, seasonTitle } from './dayCard';

// The month grid of the calendar: weeks from Monday to Sunday, the day chosen, today, the days
// outside the database left out, every day on the colour of its liturgical season, and the letter
// of its celebration in the colour of the celebration.

// Monday first, as in a Catalan calendar
export const WEEKDAY_INITIALS = ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'];

// What the calendar knows of a day before changing to it, as the database says it for the place
// of the day shown (the DayMark of the services, which the views do not import)
export interface DayMarkInput {
  // 2026-10-05
  date: string;
  color: string;
  letter: string;
  specificSeason: string;
  season: string;
  week: string;
  yearType: string;
}

// The marks of the years loaded so far, by date
export type DayMarks = Record<string, DayMarkInput>;

// The background says the season and nothing else. A celebration is its letter, as a printed
// calendar writes it (M a memorial, F a feast, S a solemnity), in the liturgical colour of the
// celebration: red for a martyr in a green October, white for Our Lady in Advent. A weekday has
// no letter, and its colour is the season's. An optional memorial has none either: in ordinary
// time it is every other day, and the day is the weekday's unless the reader turns it on. (Before,
// each day was painted in its own colour, and in a green October a white day said «Christmas and
// Easter» to whoever read the key.)
export type DayRank = 'solemnity' | 'feast' | 'memory';

export const RANK_LETTERS: Record<DayRank, string> = { memory: 'M', feast: 'F', solemnity: 'S' };

export interface DayLook {
  // The season
  color: ColorCode;
  rank: DayRank | null;
  // The colour of the celebration, for its letter
  own: ColorCode;
}

// The colour of each season: green the ordinary time, purple Advent and Lent, white Christmas and
// Easter, red the Triduum
const SEASON_COLORS: Record<string, ColorCode> = {
  Ordinari: 'V',
  Advent: 'M',
  Quaresma: 'M',
  Nadal: 'B',
  Pasqua: 'B',
  'Tridu Pasqual': 'R',
};

// The colour of the season of a day; a season the calendar does not know, the colour of the day
export function seasonColor(mark: DayMarkInput): ColorCode {
  return SEASON_COLORS[mark.season] ?? colorCode(mark.color);
}

export interface CalendarDay {
  date: Date;
  day: number;
  // "dimarts, 8 de desembre, solemnitat": what a screen reader says for the day
  label: string;
  selected: boolean;
  today: boolean;
  // Outside the dates the database has
  disabled: boolean;
  // Null until the year is loaded
  look: DayLook | null;
}

export interface CalendarMonth {
  year: number;
  month: number;
  // "Setembre de 2026"
  title: string;
  // Rows of seven; a blank before the first day and after the last
  weeks: (CalendarDay | null)[][];
  canGoBack: boolean;
  canGoForward: boolean;
  // The seasons it has, in order, named under its title: «Temps d’Advent», «Temps de Nadal»
  seasons: { color: ColorCode; title: string }[];
}

export interface CalendarInput {
  year: number;
  month: number;
  selected?: Date | null;
  today: Date;
  minimum?: Date | null;
  maximum?: Date | null;
  marks?: DayMarks;
}

const dayKey = (date: Date) => date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
const monthKey = (year: number, month: number) => year * 12 + month;
const two = (n: number) => String(n).padStart(2, '0');

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && dayKey(a) === dayKey(b);
}

// The key of a day in the marks: 2026-10-05, the local date
export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
}

export function dateOfIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function monthTitle(year: number, month: number): string {
  const name = monthName(month);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const index = monthKey(year, month) + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

export function dayLabel(date: Date): string {
  return `${lowerFirst(weekdayName(date.getDay()))}, ${dayAndMonth(date)}`;
}

export function isSelectable(date: Date, minimum?: Date | null, maximum?: Date | null): boolean {
  if (minimum && dayKey(date) < dayKey(minimum)) return false;
  if (maximum && dayKey(date) > dayKey(maximum)) return false;
  return true;
}

export function dayLook(mark: DayMarkInput): DayLook {
  const rank: DayRank | null =
    mark.letter === 'S' ? 'solemnity' : mark.letter === 'F' ? 'feast' : mark.letter === 'M' ? 'memory' : null;
  return { color: seasonColor(mark), rank, own: colorCode(mark.color) };
}

// "Solemnitat", "Memòria lliure", "Commemoració": the rank of the day as the day card names it,
// optional memorials included, or null on a weekday
export function rankLabel(mark: DayMarkInput): string | null {
  return celebrationTypeLabel(mark.letter, mark.season);
}

export function calendarMonth({ year, month, selected, today, minimum, maximum, marks }: CalendarInput): CalendarMonth {
  const first = new Date(year, month, 1);
  const blanksBefore = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (CalendarDay | null)[] = Array(blanksBefore).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const mark = marks?.[isoDate(date)];
    const rank = mark ? rankLabel(mark) : null;
    const isToday = sameDay(date, today);
    cells.push({
      date,
      day,
      label: [dayLabel(date), rank ? lowerFirst(rank) : null, isToday ? 'avui' : null].filter(Boolean).join(', '),
      selected: sameDay(date, selected),
      today: isToday,
      disabled: !isSelectable(date, minimum, maximum),
      look: mark ? dayLook(mark) : null,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const seasons: { color: ColorCode; title: string }[] = [];
  for (const cell of cells) {
    const mark = cell ? marks?.[isoDate(cell.date)] : undefined;
    if (!mark) continue;
    const title = seasonTitle(mark.season);
    if (title && !seasons.some((season) => season.title === title)) seasons.push({ color: seasonColor(mark), title });
  }
  return {
    year,
    month,
    title: monthTitle(year, month),
    weeks,
    canGoBack: !minimum || monthKey(year, month) > monthKey(minimum.getFullYear(), minimum.getMonth()),
    canGoForward: !maximum || monthKey(year, month) < monthKey(maximum.getFullYear(), maximum.getMonth()),
    seasons,
  };
}

// The row of months over the grid, to go to another one with a touch: a year before and a year
// after the one shown, inside the database. January carries its year, where the row crosses one.
export interface RibbonMonth {
  key: string;
  year: number;
  month: number;
  // "gen", "febr"
  text: string;
  // "2027" on January, null on the rest
  yearText: string | null;
  // "gener de 2027"
  label: string;
  selected: boolean;
  // The month of today: a dot
  current: boolean;
}

export interface RibbonInput {
  year: number;
  month: number;
  today: Date;
  minimum?: Date | null;
  maximum?: Date | null;
  reach?: number;
}

export function monthRibbon({ year, month, today, minimum, maximum, reach = 12 }: RibbonInput): RibbonMonth[] {
  const shown = monthKey(year, month);
  const first = Math.max(shown - reach, minimum ? monthKey(minimum.getFullYear(), minimum.getMonth()) : -Infinity);
  const last = Math.min(shown + reach, maximum ? monthKey(maximum.getFullYear(), maximum.getMonth()) : Infinity);
  const todayKey = monthKey(today.getFullYear(), today.getMonth());
  const months: RibbonMonth[] = [];
  for (let key = first; key <= last; key++) {
    const y = Math.floor(key / 12);
    const m = key % 12;
    months.push({
      key: `${y}-${m}`,
      year: y,
      month: m,
      text: shortMonthName(m),
      yearText: m === 0 ? String(y) : null,
      label: `${monthName(m)} de ${y}`,
      selected: key === shown,
      current: key === todayKey,
    });
  }
  return months;
}

// Let go after dragging the month sideways: 1 goes to the next one (dragged to the left), -1 to
// the one before, 0 stays. A quarter of the width, or a quick flick, is enough.
export function monthAfterSwipe(distance: number, velocity: number, width: number): -1 | 0 | 1 {
  const far = Math.abs(distance) > width / 4;
  const flick = Math.abs(velocity) > 0.5 && Math.abs(distance) > 20;
  if (!far && !flick) return 0;
  return distance < 0 ? 1 : -1;
}

// Whether a drag is sideways enough to be a change of month and not a touch or a scroll of the screen
export function isSidewaysDrag(dx: number, dy: number): boolean {
  return Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5;
}
