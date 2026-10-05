import { useSyncExternalStore } from 'react';
import * as LiturgyStore from './liturgyStore';
import type { DayMark } from './liturgyStore';
import * as Logger from '../utils/logger';
import { buildDayCard, DayCard } from '../view-models/dayCard';
import { DayMarks, isoDate } from '../view-models/calendar';

// What the calendar paints, kept while the data does not change (the same revision of the
// liturgy store): the colour and the rank of the days of the years it showed, and what the home
// would show of the days touched. The calendar asks for what it is about to show; the home asks
// for the year of the day shown after every load, so that the calendar opens painted.
//
// The rank painted is the one of the day worked out when it is known: where the database gives a
// place a celebration it has no texts for, the day is a weekday on the home, and so in the
// calendar once it has been worked out.

export interface CalendarData {
  revision: number;
  marks: DayMarks;
  previews: Record<string, DayCard>;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let data: CalendarData = { revision: -1, marks: {}, previews: {} };

// What was asked for since the data last changed: the years and the days already on their way or
// there, the days wanted now, and the rank of every day worked out
let asked = newAsked(-1);

function newAsked(revision: number) {
  return {
    revision,
    years: new Set<number>(),
    days: new Set<string>(),
    wanted: new Set<string>(),
    letters: new Map<string, string>(),
  };
}

function change(next: Partial<CalendarData>) {
  data = { ...data, ...next };
  listeners.forEach((listener) => listener());
}

export function getData(): CalendarData {
  return data;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCalendarData(): CalendarData {
  return useSyncExternalStore(subscribe, getData, getData);
}

// After the data changed (another day, a setting, a new database) what was known is forgotten,
// except the card of the day shown, which the store of the liturgy already has
export function prepare(): void {
  const snapshot = LiturgyStore.getSnapshot();
  if (asked.revision === snapshot.revision) return;
  asked = newAsked(snapshot.revision);
  const previews: Record<string, DayCard> = {};
  if (LiturgyStore.isLoaded()) {
    const { day, celebration, settings } = snapshot;
    const key = isoDate(day.today.date);
    previews[key] = buildDayCard(day.today, celebration, settings);
    asked.days.add(key);
    asked.letters.set(key, day.today.celebrationType);
  }
  change({ revision: snapshot.revision, marks: {}, previews });
}

// The marks of a year with the ranks already worked out
function withLetters(before: DayMarks, marks: DayMark[], letters: Map<string, string>): DayMarks {
  const next = { ...before };
  for (const mark of marks) {
    const letter = letters.get(mark.date);
    next[mark.date] = letter === undefined ? mark : { ...mark, letter };
  }
  return next;
}

export function needYears(years: number[]): void {
  prepare();
  const current = asked;
  for (const year of years) {
    if (current.years.has(year)) continue;
    current.years.add(year);
    LiturgyStore.yearMarks(year)
      .then((marks) => {
        if (asked !== current) return;
        change({ marks: withLetters(data.marks, marks, current.letters) });
      })
      .catch((error) => {
        current.years.delete(year);
        Logger.logError(Logger.LogKeys.Calendar, 'needYears', error);
      });
  }
}

// One day at a time, in the queue of the store of the liturgy: a day touched and left before its
// turn is not worked out
export function needPreviews(dates: Date[]): void {
  prepare();
  const current = asked;
  current.wanted = new Set(dates.map(isoDate));
  for (const date of dates) {
    const key = isoDate(date);
    if (current.days.has(key)) continue;
    current.days.add(key);
    LiturgyStore.previewDay(date, () => asked === current && current.wanted.has(key))
      .then((preview) => {
        if (asked !== current) return;
        if (!preview) {
          current.days.delete(key);
          return;
        }
        const letter = preview.day.celebrationType;
        current.letters.set(key, letter);
        const mark = data.marks[key];
        change({
          previews: { ...data.previews, [key]: buildDayCard(preview.day, preview.celebration, preview.settings) },
          ...(mark && mark.letter !== letter ? { marks: { ...data.marks, [key]: { ...mark, letter } } } : {}),
        });
      })
      .catch((error) => {
        current.days.delete(key);
        Logger.logError(Logger.LogKeys.Calendar, 'needPreviews', error);
      });
  }
}

// The year of the day shown, asked for after every load
export function prefetchShownYear(): void {
  if (!LiturgyStore.isLoaded()) return;
  needYears([LiturgyStore.currentDate().getFullYear()]);
}
