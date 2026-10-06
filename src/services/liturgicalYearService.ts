import { executeQueryAsync } from './databaseManagerService';
import { Settings } from '../models/Settings';
import * as CalendarService from './calendarService';
import * as DatabaseHelper from './databaseDataHelper';

// What the calendar paints of each day of a year: its colour, the rank of its celebration in the
// place the app prays with, and its season. One query for the whole year (two when the database
// has the calendars of litcal), and not the whole liturgy of every day.
export interface DayMark {
  // 2026-10-05
  date: string;
  // R, V, M or B, as anyliturgic says (Color)
  color: string;
  // S, F, M, L, V or -: the same letter the day itself gets when it is shown
  letter: string;
  // O_ORDINAR, A_SETMANES… (temps)
  specificSeason: string;
  // Ordinari, Advent… (tempsespecific)
  season: string;
  // The week of the season (NumSet)
  week: string;
  // A, B or C (anyABC)
  yearType: string;
}

const two = (n: number) => String(n).padStart(2, '0');

export async function obtainYearMarks(year: number, settings: Settings): Promise<DayMark[]> {
  const rows: Record<string, any>[] = await executeQueryAsync(`SELECT * FROM anyliturgic WHERE any = '${year}'`);
  const letters = await lettersOfPlace(year, settings);
  return rows
    .map((row) => {
      const date = `${year}-${two(Number(row.mes))}-${two(Number(row.dia))}`;
      return {
        date,
        color: row.Color,
        // As obtainLiturgySpecificDayInformation: the calendar of the place when it has the day,
        // and otherwise the column of the place
        letter:
          letters?.get(date) ?? DatabaseHelper.getCelebrationTypeFromTodayLiurgyRow(settings.dioceseCode, row) ?? '-',
        specificSeason: row.temps,
        season: row.tempsespecific,
        week: row.NumSet,
        yearType: row.anyABC,
      };
    })
    .sort((one, other) => (one.date < other.date ? -1 : one.date > other.date ? 1 : 0));
}

// The letters of the calendar of the place, or null when the database has no calendars, or none
// for this place
async function lettersOfPlace(year: number, settings: Settings): Promise<Map<string, string> | null> {
  const calendars = await CalendarService.obtainCalendars();
  if (!calendars) return null;
  const calendar = CalendarService.calendarOfPlace(calendars, settings);
  if (!calendar) return null;
  return CalendarService.lettersOfYear(year, CalendarService.chainOf(calendars, calendar));
}
