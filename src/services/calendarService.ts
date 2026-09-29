import { executeQueryAsync, openedDatabaseVersion } from './databaseManagerService';
import { Settings } from '../models/Settings';
import { DioceseName } from './SettingsService';
import * as DatabaseHelper from './databaseDataHelper';

// The calendar of each place, when the database has it place by place: the tables calendars and
// calendar_days that cpl-cloud's process X writes from litcal. A place has its calendar; a day of a
// calendar is its own row in calendar_days or, when it has none, its parent's, up to the root.
// A database of before has only the 37 columns of anyliturgic, and then none of this is used.

export interface Calendar {
  id: string;
  parent: string | null;
  // What the user reads
  name: string;
  // The diocese and the place as the settings keep them (DioceseName, PrayingPlace)
  diocese: string | null;
  place: string | null;
  // The place in the tables of texts (their Diocesis column: BaD, BaV…)
  code: string | null;
  sort: number;
}

export interface CalendarDay {
  // S, F, M, L, V or -, as the letters of anyliturgic
  letter: string;
  // The day its celebration comes from (08-jun), or -
  moved: string;
  // The id in litcal of the celebration of the day
  celebration: string;
}

let loaded: { version: number | null; calendars: Promise<Calendar[] | null> } | undefined;

// The calendars of the database that is open, or null if it has none
export function obtainCalendars(): Promise<Calendar[] | null> {
  const version = openedDatabaseVersion();
  if (!loaded || loaded.version !== version) loaded = { version, calendars: readCalendars() };
  return loaded.calendars;
}

async function readCalendars(): Promise<Calendar[] | null> {
  const tables = await executeQueryAsync(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('calendars', 'calendar_days')",
  );
  if (tables.length < 2) return null;
  return await executeQueryAsync('SELECT id, parent, name, diocese, place, code, sort FROM calendars ORDER BY sort');
}

// The calendar of the place of the settings. Andorra has one, whatever the place.
export function calendarOfPlace(calendars: Calendar[], settings: Settings): Calendar | undefined {
  return calendars.find(
    (calendar) =>
      calendar.diocese === settings.dioceseName &&
      (calendar.place === settings.prayingPlace || settings.dioceseName === DioceseName.Andorra),
  );
}

// The calendar and its parents, from the most concrete to the root
export function chainOf(calendars: Calendar[], calendar: Calendar): string[] {
  const chain: string[] = [];
  for (let id: string | null = calendar.id; id && !chain.includes(id);) {
    chain.push(id);
    id = calendars.find((candidate) => candidate.id === id)?.parent ?? null;
  }
  return chain;
}

const quoted = (ids: string[]) => ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(', ');

function isoDate(date: Date): string {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
}

// The day of a calendar: the row of the most concrete calendar of the chain that has one
export async function calendarDay(date: Date, chain: string[]): Promise<CalendarDay | undefined> {
  const rows = await executeQueryAsync(
    `SELECT calendar, letter, moved, celebration FROM calendar_days WHERE date = '${isoDate(date)}' AND calendar IN (${quoted(chain)})`,
  );
  for (const id of chain) {
    const row = rows.find((candidate: { calendar: string }) => candidate.calendar === id);
    if (row) return { letter: row.letter, moved: row.moved, celebration: row.celebration };
  }
  return undefined;
}

// Whether the celebration of this date has been moved to another day of the year, in this calendar
export async function isMovedAway(date: Date, chain: string[]): Promise<boolean> {
  const code = DatabaseHelper.getDateShortDatabaseCode(date);
  const year = date.getFullYear();
  const rows = await executeQueryAsync(
    `SELECT DISTINCT date FROM calendar_days WHERE date >= '${year}-01-01' AND date <= '${year}-12-31' AND moved = '${code}' AND calendar IN (${quoted(chain)})`,
  );
  for (const { date: day } of rows as { date: string }[]) {
    const [y, m, d] = day.split('-').map(Number);
    if ((await calendarDay(new Date(y, m - 1, d), chain))?.moved === code) return true;
  }
  return false;
}

// The day of the place of the settings and its calendar, or undefined when the database has no
// calendars, or none for this place
export async function obtainDayOfPlace(
  date: Date,
  settings: Settings,
): Promise<{ day: CalendarDay; chain: string[] } | undefined> {
  const calendars = await obtainCalendars();
  if (!calendars) return undefined;
  const calendar = calendarOfPlace(calendars, settings);
  if (!calendar) return undefined;
  const chain = chainOf(calendars, calendar);
  const day = await calendarDay(date, chain);
  return day ? { day, chain } : undefined;
}

// What the settings offer: the dioceses of the calendars that can be chosen, and the places of each
// one (Andorra has only one)
export interface PlaceOptions {
  dioceses: string[];
  placesOf: (diocese: string) => string[];
}

export function placeOptions(calendars: Calendar[]): PlaceOptions {
  const choosable = calendars.filter((calendar) => calendar.diocese !== null && calendar.place !== null);
  const dioceses = [...new Set(choosable.map((calendar) => calendar.diocese as string))];
  const placesOf = (diocese: string) =>
    choosable.filter((calendar) => calendar.diocese === diocese).map((calendar) => calendar.place as string);
  return { dioceses, placesOf };
}

// The options of the open database, or null when it has no calendars
export async function obtainPlaceOptions(): Promise<PlaceOptions | null> {
  const calendars = await obtainCalendars();
  return calendars ? placeOptions(calendars) : null;
}

// The diocese and the place the app prays with: the saved ones when the database has them; if not,
// the first place of that diocese (Andorra has only one), or the first calendar of the database
// (another edition, before any place has been chosen in it)
export function resolvePlace(
  options: PlaceOptions,
  diocese: string,
  place: string,
): { diocese: string; place: string } {
  const known = options.dioceses.includes(diocese) ? diocese : options.dioceses[0];
  if (known === undefined) return { diocese, place };
  const places = options.placesOf(known);
  return { diocese: known, place: places.includes(place) ? place : (places[0] ?? place) };
}
