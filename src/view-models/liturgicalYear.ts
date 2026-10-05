import { dayAndMonth, lowerFirst, monthName } from './catalanText';
import { ColorCode, seasonDayTitle, seasonName } from './dayCard';
import { dayInput, dayLabel, DayMarkInput, DayMarks, isoDate, isSelectable, sameDay, seasonColor } from './calendar';
import { SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';

// The year in the calendar: the twelve months in small, every day a square in the colour of its
// season, and the liturgical year as a wheel of its seasons, from the first Sunday of Advent to the
// week of Christ the King. What a day is, its rank, is for the month and for the list of dates.

const dayKey = (date: Date) => date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / 86400000);

// --- The twelve months ---------------------------------------------------------------------

export interface MiniDay {
  key: string;
  // The colour of its season; null until the year is loaded, and outside the database
  color: ColorCode | null;
  today: boolean;
}

export interface MiniMonth {
  key: string;
  year: number;
  month: number;
  // "gener"
  name: string;
  // "octubre de 2026, el mes d’avui": what a screen reader says
  label: string;
  // Squares left empty before the first day, Monday first
  blanks: number;
  days: MiniDay[];
  // The month of today
  current: boolean;
  // The month the calendar was showing
  shown: boolean;
  // Entirely outside the database
  disabled: boolean;
}

export interface YearOverview {
  year: number;
  title: string;
  months: MiniMonth[];
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface YearOverviewInput {
  year: number;
  marks: DayMarks;
  today: Date;
  shown: { year: number; month: number };
  minimum?: Date | null;
  maximum?: Date | null;
}

export function yearOverview({ year, marks, today, shown, minimum, maximum }: YearOverviewInput): YearOverview {
  const months: MiniMonth[] = [];
  for (let month = 0; month < 12; month++) {
    const first = new Date(year, month, 1);
    const length = new Date(year, month + 1, 0).getDate();
    const days: MiniDay[] = [];
    for (let day = 1; day <= length; day++) {
      const date = new Date(year, month, day);
      const mark = isSelectable(date, minimum, maximum) ? marks[isoDate(date)] : undefined;
      days.push({
        key: String(day),
        color: mark ? seasonColor(mark) : null,
        today: sameDay(date, today),
      });
    }
    const current = year === today.getFullYear() && month === today.getMonth();
    months.push({
      key: String(month),
      year,
      month,
      name: monthName(month),
      label: `${monthName(month)} de ${year}${current ? ', el mes d’avui' : ''}`,
      blanks: (first.getDay() + 6) % 7,
      days,
      current,
      shown: year === shown.year && month === shown.month,
      disabled: !isSelectable(new Date(year, month, length), minimum, null) || !isSelectable(first, null, maximum),
    });
  }
  return {
    year,
    title: String(year),
    months,
    canGoBack: !minimum || year > minimum.getFullYear(),
    canGoForward: !maximum || year < maximum.getFullYear(),
  };
}

// --- The liturgical year -----------------------------------------------------------------

// The first Sunday of Advent of a year: the fourth Sunday before Christmas, from 27 November to
// 3 December
export function adventSunday(year: number): Date {
  const christmas = new Date(year, 11, 25);
  const lastSunday = addDays(christmas, -(christmas.getDay() || 7));
  return addDays(lastSunday, -21);
}

// The liturgical year a day belongs to, by the year of the Advent that opens it: 5 October 2026
// is in the year 2025–2026, and 29 November 2026 opens 2026–2027
export function liturgicalYearOf(date: Date): number {
  const year = date.getFullYear();
  return dayKey(date) >= dayKey(adventSunday(year)) ? year : year - 1;
}

// The wheel is drawn in a box of this size, which the view scales: the ring, the names of the
// seasons outside it and the mark of today
export const WHEEL = { width: 350, height: 300, cx: 175, cy: 150, outer: 100, inner: 70, labels: 113 };

export interface WheelPath {
  d: string;
  color: ColorCode;
}

export interface WheelLabel {
  text: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

export interface LiturgicalWheel {
  startYear: number;
  // "2025–2026"
  title: string;
  // "Any A", or empty until the year is loaded
  yearName: string;
  first: Date;
  // 364 or 371
  days: number;
  // The ring, in runs of one colour: the seasons
  arcs: WheelPath[];
  // A thin cut where a season begins
  cuts: string[];
  seasons: WheelLabel[];
  today: { needle: string; dot: { x: number; y: number }; label: WheelLabel } | null;
  // "Setmana XXVII de durant l'any", in the middle when today is in this year
  todayTitle: string | null;
  // "L’any litúrgic 2025–2026, any A": what a screen reader says of the wheel
  label: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface WheelInput {
  startYear: number;
  marks: DayMarks;
  today: Date;
  minimum?: Date | null;
  maximum?: Date | null;
}

// A point of the wheel: degrees clockwise from the top
export function pointAt(radius: number, degrees: number): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  return { x: WHEEL.cx + radius * Math.sin(radians), y: WHEEL.cy - radius * Math.cos(radians) };
}

const fixed = (n: number) => Number(n.toFixed(2));

// A piece of the ring between two angles
export function sectorPath(from: number, to: number, outer = WHEEL.outer, inner = WHEEL.inner): string {
  const large = to - from > 180 ? 1 : 0;
  const a = pointAt(outer, from);
  const b = pointAt(outer, to);
  const c = pointAt(inner, to);
  const d = pointAt(inner, from);
  return (
    `M${fixed(a.x)} ${fixed(a.y)}A${outer} ${outer} 0 ${large} 1 ${fixed(b.x)} ${fixed(b.y)}` +
    `L${fixed(c.x)} ${fixed(c.y)}A${inner} ${inner} 0 ${large} 0 ${fixed(d.x)} ${fixed(d.y)}Z`
  );
}

function linePath(from: number, to: number, degrees: number): string {
  const a = pointAt(from, degrees);
  const b = pointAt(to, degrees);
  return `M${fixed(a.x)} ${fixed(a.y)}L${fixed(b.x)} ${fixed(b.y)}`;
}

// The day of the wheel under a touch, in the coordinates of the box, or null away from the ring
export function dayAtPoint(x: number, y: number, days: number): number | null {
  const dx = x - WHEEL.cx;
  const dy = y - WHEEL.cy;
  const radius = Math.hypot(dx, dy);
  if (radius < WHEEL.inner - 18 || radius > WHEEL.outer + 26) return null;
  const degrees = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  return Math.min(days - 1, Math.floor((degrees / 360) * days));
}

// Text outside the ring: it starts on the right, ends on the left and is centred at the top and
// at the bottom, a little lower on the bottom half so that it does not touch the ring
function labelAt(text: string, degrees: number, radius = WHEEL.labels): WheelLabel {
  const point = pointAt(radius, degrees);
  const sin = Math.sin((degrees * Math.PI) / 180);
  const cos = Math.cos((degrees * Math.PI) / 180);
  const anchor = Math.abs(sin) < 0.3 ? 'middle' : sin > 0 ? 'start' : 'end';
  const drop = cos < -0.3 ? 9 : cos > 0.3 ? 0 : 4;
  return { text, x: fixed(point.x), y: fixed(point.y + drop), anchor };
}

// About how wide a name is, at the size the wheel writes them
const textWidth = (text: string) => text.length * 6.4;

function fits(label: WheelLabel): boolean {
  const width = textWidth(label.text);
  const left = label.anchor === 'start' ? label.x : label.anchor === 'end' ? label.x - width : label.x - width / 2;
  return left >= 4 && left + width <= WHEEL.width - 4;
}

const apart = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

// Where the name of a season goes: in the middle of its piece, or as near as it can be while it
// fits in the box and keeps away from the mark of today
function seasonLabel(text: string, from: number, to: number, avoid: number | null): WheelLabel {
  const middle = (from + to) / 2;
  for (let step = 0; step <= (to - from) / 2; step += 4) {
    for (const degrees of step === 0 ? [middle] : [middle - step, middle + step]) {
      if (degrees < from + 2 || degrees > to - 2) continue;
      const label = labelAt(text, degrees);
      if (fits(label) && (avoid === null || apart(degrees, avoid) >= 22)) return label;
    }
  }
  return labelAt(text, middle);
}

export function liturgicalWheel({ startYear, marks, today, minimum, maximum }: WheelInput): LiturgicalWheel {
  const first = adventSunday(startYear);
  const next = adventSunday(startYear + 1);
  const days = daysBetween(first, next);
  const angle = (index: number) => (360 * index) / days;
  const marksOfYear = Array.from({ length: days }, (_, index) => marks[isoDate(addDays(first, index))]);

  const arcs: WheelPath[] = [];
  for (let index = 0; index < days;) {
    const mark = marksOfYear[index];
    if (!mark) {
      index++;
      continue;
    }
    const color = seasonColor(mark);
    let end = index + 1;
    while (end < days && marksOfYear[end] && seasonColor(marksOfYear[end]!) === color) end++;
    arcs.push({ d: sectorPath(angle(index), angle(end)), color });
    index = end;
  }

  const todayIndex = dayKey(today) >= dayKey(first) && dayKey(today) < dayKey(next) ? daysBetween(first, today) : null;
  const todayAngle = todayIndex === null ? null : angle(todayIndex + 0.5);

  // The seasons, in runs: the Triduum is too short to be named
  const runs: { season: string; from: number; to: number }[] = [];
  marksOfYear.forEach((mark, index) => {
    if (!mark) return;
    const last = runs[runs.length - 1];
    if (last && last.season === mark.season && last.to === index) last.to = index + 1;
    else runs.push({ season: mark.season, from: index, to: index + 1 });
  });
  const cuts = runs
    .filter((run) => run.from > 0)
    .map((run) => linePath(WHEEL.inner - 1, WHEEL.outer + 1, angle(run.from)));
  const seasons = runs
    .filter((run) => run.to - run.from >= 7)
    .map((run) => seasonLabel(seasonName(run.season), angle(run.from), angle(run.to), todayAngle));

  const todayMark = todayIndex === null ? undefined : marksOfYear[todayIndex];
  const named = marksOfYear.find(Boolean);
  const yearName = named?.yearType ? `Any ${named.yearType}` : '';
  const title = `${startYear}–${startYear + 1}`;
  return {
    startYear,
    title,
    yearName,
    first,
    days,
    arcs,
    cuts: [...new Set(cuts)],
    seasons,
    today:
      todayAngle === null
        ? null
        : {
            needle: linePath(WHEEL.inner - 6, WHEEL.outer + 6, todayAngle),
            dot: (({ x, y }) => ({ x: fixed(x), y: fixed(y) }))(pointAt(WHEEL.outer + 11, todayAngle)),
            label: labelAt('avui', todayAngle, WHEEL.outer + 21),
          },
    todayTitle: todayMark ? seasonDayTitle(dayInput(today, todayMark)) : null,
    label: `L’any litúrgic ${title}${yearName ? `, ${lowerFirst(yearName)}` : ''}`,
    canGoBack: !minimum || dayKey(first) > dayKey(minimum),
    canGoForward: !maximum || dayKey(next) <= dayKey(maximum),
  };
}

// --- What comes next ---------------------------------------------------------------------

// A date worth going to from the wheel: the next solemnities and the start of a liturgical year,
// or, in another year, its Ash Wednesday and its Easter
export type MilestoneKind = 'solemnity' | 'advent' | 'ashes' | 'easter';

export interface Milestone {
  key: string;
  date: Date;
  kind: MilestoneKind;
  color: ColorCode;
  // A, B or C: the year that begins, for Advent
  yearType: string;
}

const milestone = (mark: DayMarkInput, kind: MilestoneKind, date: Date): Milestone => ({
  key: mark.date,
  date,
  kind,
  color: seasonColor(mark),
  yearType: mark.yearType,
});

// The next solemnities after today and the first Sunday of Advent, the nearest first
export function upcomingMilestones(marks: DayMarks, today: Date, count = 2): Milestone[] {
  const found: Milestone[] = [];
  for (const mark of Object.values(marks)) {
    const [year, month, day] = mark.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (dayKey(date) <= dayKey(today)) continue;
    if (mark.letter === 'S') found.push(milestone(mark, 'solemnity', date));
    else if (sameDay(date, adventSunday(year))) found.push(milestone(mark, 'advent', date));
  }
  return found.sort((a, b) => dayKey(a.date) - dayKey(b.date)).slice(0, count);
}

// Ash Wednesday and Easter Sunday of a liturgical year
export function keyDates(startYear: number, marks: DayMarks): Milestone[] {
  const first = adventSunday(startYear);
  const days = daysBetween(first, adventSunday(startYear + 1));
  const found: Milestone[] = [];
  for (let index = 0; index < days; index++) {
    const date = addDays(first, index);
    const mark = marks[isoDate(date)];
    if (!mark) continue;
    if (mark.specificSeason === SpecificLiturgyTimeType.LentAshes && !found.some((m) => m.kind === 'ashes'))
      found.push(milestone(mark, 'ashes', date));
    if (mark.specificSeason === SpecificLiturgyTimeType.EasterSunday) found.push(milestone(mark, 'easter', date));
  }
  return found;
}

export interface MilestoneRow {
  key: string;
  date: Date;
  kind: MilestoneKind;
  color: ColorCode;
  title: string;
  subtitle: string;
  label: string;
}

const capitalized = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

// A row under the wheel. The name of a solemnity comes from its day, worked out as the home
// would: null until it is there, and the row says when it is meanwhile.
export function milestoneRow(milestone: Milestone, celebrationTitle: string | null): MilestoneRow {
  const { date } = milestone;
  const withYear = `${dayAndMonth(date)} de ${date.getFullYear()}`;
  let title: string;
  let subtitle: string;
  switch (milestone.kind) {
    case 'solemnity':
      title = celebrationTitle ?? 'Solemnitat';
      subtitle = celebrationTitle ? `Solemnitat · ${dayLabel(date)}` : capitalized(dayLabel(date));
      break;
    case 'advent':
      title = 'Diumenge I d’Advent';
      subtitle = milestone.yearType
        ? `Comença l’any ${milestone.yearType} · ${dayAndMonth(date)}`
        : capitalized(dayLabel(date));
      break;
    case 'ashes':
      title = 'Dimecres de Cendra';
      subtitle = withYear;
      break;
    case 'easter':
      title = 'Diumenge de Pasqua';
      subtitle = withYear;
      break;
  }
  return {
    key: milestone.key,
    date,
    kind: milestone.kind,
    color: milestone.color,
    title,
    subtitle,
    label: `${title}, ${subtitle}`,
  };
}
