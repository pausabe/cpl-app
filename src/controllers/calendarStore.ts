import { useSyncExternalStore } from 'react';
import * as LiturgyStore from './liturgyStore';
import type { DayMark } from './liturgyStore';
import * as Logger from '../utils/logger';
import { reportProblem } from '../services/health/problems';
import { buildDayCard, DayCard } from '../view-models/dayCard';
import { dateOfIso, DayMarks, isoDate } from '../view-models/calendar';

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
// there, the days wanted now (the first first), those that could not be worked out, and the rank of
// every day worked out
let asked = newAsked(-1);

function newAsked(revision: number) {
  return {
    revision,
    years: new Set<number>(),
    days: new Set<string>(),
    wanted: [] as string[],
    failed: new Set<string>(),
    letters: new Map<string, string>(),
  };
}

// Whether a day is being worked out now: one at a time
let working = false;

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
    const { day, celebration, settings, optionalMemorials } = snapshot;
    const key = isoDate(day.today.date);
    previews[key] = buildDayCard(day.today, celebration, settings, optionalMemorials);
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
        reportProblem('calendar-year', error);
      });
  }
}

// The days the calendar is about to show, the first first: the day touched, and then, ready for a
// touch, those of the month with a celebration. One at a time, in the queue of the store of the
// liturgy, and always the first one still wanted: a day touched does not wait for those of the
// month, at most for the one being worked out, and a day left before its turn is not worked out.
export function needPreviews(dates: Date[]): void {
  prepare();
  asked.wanted = dates.map(isoDate);
  workOut();
}

async function workOut(): Promise<void> {
  if (working) return;
  working = true;
  try {
    for (;;) {
      const current = asked;
      const key = current.wanted.find((day) => !current.days.has(day) && !current.failed.has(day));
      if (key === undefined) return;
      current.days.add(key);
      try {
        const preview = await LiturgyStore.previewDay(dateOfIso(key));
        // The data changed meanwhile: what was worked out is of before
        if (asked !== current || !preview) continue;
        const letter = preview.day.celebrationType;
        current.letters.set(key, letter);
        const mark = data.marks[key];
        change({
          previews: {
            ...data.previews,
            [key]: buildDayCard(preview.day, preview.celebration, preview.settings, preview.optionalMemorials),
          },
          ...(mark && mark.letter !== letter ? { marks: { ...data.marks, [key]: { ...mark, letter } } } : {}),
        });
      } catch (error) {
        current.days.delete(key);
        current.failed.add(key);
        Logger.logError(Logger.LogKeys.Calendar, 'needPreviews', error);
        // The card of that day stays waiting: whoever touched it sees nothing come
        reportProblem('calendar-day', error);
      }
    }
  } finally {
    working = false;
  }
}

// The year of the day shown, asked for after every load
export function prefetchShownYear(): void {
  if (!LiturgyStore.isLoaded()) return;
  needYears([LiturgyStore.currentDate().getFullYear()]);
}
