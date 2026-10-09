import { DayCard, ColorCode } from './dayCard';
import { HourKey, currentHour } from './hours';
import { MassBlock, MassScreenType } from './mass';
import { weekdayName } from './catalanText';

// What the widgets of the home screen show, written by the app for the days to come
// (controllers/widgetController) and read by the widgets themselves, which run without the app:
// targets/widgets on iOS (WidgetKit) and modules/cpl-widgets/android on Android. Both read this
// JSON as it is, so a change here is a change of the contract: raise WIDGET_PAYLOAD_VERSION and
// teach both of them.
//
// The hour is not here: each widget works it out from the clock with the bands, which change by
// themselves at 6, 9, 12, 15, 18, 0 and 2 h with the app closed. The rest, the words of each day,
// can only come from the app, which knows the liturgy, the diocese and the options.
export const WIDGET_PAYLOAD_VERSION = 1;

// The days written ahead: someone who does not open the app for longer sees the hour and the date
// without the name of the day
export const WIDGET_DAYS = 14;

export interface WidgetCelebration {
  // «Memòria lliure», «Festa», «Solemnitat»
  type: string;
  title: string;
  // Up to its first comma, where there is little room: «Santa Teresa de Jesús»
  short: string;
  // An optional memorial that is not being celebrated: grey, as on the home
  muted: boolean;
}

export interface WidgetGospel {
  // «Evangeli · Lc 11,15-26», «Benedicció dels Rams · Mt 21,1-11»
  caption: string;
  phrase: string;
  // Where cpl://mass/<opens> opens the readings
  opens: MassScreenType;
}

export interface WidgetDay {
  // Local date, YYYY-MM-DD
  date: string;
  // «Divendres, 9 d’octubre»
  dateText: string;
  // «Divendres 9 oct.», for the small widget
  shortDate: string;
  // «dv. 9», over the clock of the lock screen
  inlineDate: string;
  // The day in its season: «Setmana XXVII de durant l'any», «Octava de Nadal»
  title: string;
  // «Any A · Setmana III del salteri»
  meta: string;
  color: ColorCode;
  celebration: WidgetCelebration | null;
  // The title of the first Vespers, under «Vespres», as on the home: «Tots Sants»
  vespers: string | null;
  gospel: WidgetGospel | null;
}

// From the hour `from` (included) to `to` (not included), local time, the widgets show `hour`:
// «Ara» when `now`, and the liturgy of the day before when `yesterday`.
export interface WidgetBand {
  from: number;
  to: number;
  hour: HourKey;
  now: boolean;
  yesterday: boolean;
}

export interface WidgetPayload {
  version: number;
  // When the app wrote it (ISO 8601)
  writtenAt: string;
  bands: WidgetBand[];
  hourNames: Record<HourKey, string>;
  days: WidgetDay[];
}

export const HOUR_NAMES: Record<HourKey, string> = {
  ofici: 'Ofici de lectura',
  laudes: 'Laudes',
  tercia: 'Tèrcia',
  sexta: 'Sexta',
  nona: 'Nona',
  vespres: 'Vespres',
  completes: 'Completes',
};

// The bands of the home (view-models/hours, currentHour), hour by hour, and two things only the
// widgets do (Pau, 9-10-2026). From midnight to 2 h they stay on the day before, the day of those
// Completes, as «Ahir» does in the midnight question. From 2 to 6 h, when the home marks none,
// they show the Office of Readings, which has no hour and is the prayer of the night watch, but
// without «Ara».
export function widgetBands(): WidgetBand[] {
  const bands: WidgetBand[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const key = currentHour(hour);
    const band = key
      ? { hour: key, now: true, yesterday: key === 'completes' }
      : { hour: 'ofici' as HourKey, now: false, yesterday: false };
    const last = bands[bands.length - 1];
    if (last && last.hour === band.hour && last.now === band.now && last.yesterday === band.yesterday)
      last.to = hour + 1;
    else bands.push({ from: hour, to: hour + 1, ...band });
  }
  return bands;
}

// The band of an hour of the day, 0 to 23
export function bandAt(bands: WidgetBand[], hour: number): WidgetBand {
  return bands.find((band) => hour >= band.from && hour < band.to) ?? bands[0];
}

const WEEKDAY_ABBREVIATIONS = ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'];

// The Catalan abbreviations of the months: «oct.», but «març», «maig» and «juny» are whole
const MONTH_ABBREVIATIONS = [
  'gen.',
  'febr.',
  'març',
  'abr.',
  'maig',
  'juny',
  'jul.',
  'ag.',
  'set.',
  'oct.',
  'nov.',
  'des.',
];

export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// «Divendres 9 oct.»
export function shortDate(date: Date): string {
  return `${weekdayName(date.getDay())} ${date.getDate()} ${MONTH_ABBREVIATIONS[date.getMonth()]}`;
}

// «dv. 9»
export function inlineDate(date: Date): string {
  return `${WEEKDAY_ABBREVIATIONS[date.getDay()]} ${date.getDate()}`;
}

// «Santa Teresa de Jesús, verge i doctora de l’Església» → «Santa Teresa de Jesús»
export function shortCelebration(title: string): string {
  const comma = title.indexOf(', ');
  return comma > 0 ? title.slice(0, comma) : title;
}

export interface WidgetDayInput {
  date: Date;
  card: DayCard;
  // The subtitle of «Vespres» on the home (view-models/hours, vespersSubtitle)
  vespers: string | null;
  // The Mass of the day, never the evening one: buildMass with the choice «normal»
  mass: MassBlock;
}

export function buildWidgetDay({ date, card, vespers, mass }: WidgetDayInput): WidgetDay {
  const { celebration } = card;
  return {
    date: isoDate(date),
    dateText: card.dateText,
    shortDate: shortDate(date),
    inlineDate: inlineDate(date),
    title: card.title,
    meta: card.meta,
    color: card.colorCode,
    celebration: celebration
      ? {
          type: celebration.typeLabel,
          title: celebration.title,
          short: shortCelebration(celebration.title),
          muted: celebration.muted,
        }
      : null,
    vespers,
    gospel: mass.gospel.phrase
      ? { caption: mass.gospel.caption, phrase: mass.gospel.phrase, opens: mass.gospel.opens }
      : null,
  };
}

export function buildWidgetPayload(days: WidgetDay[], writtenAt: Date): WidgetPayload {
  return {
    version: WIDGET_PAYLOAD_VERSION,
    writtenAt: writtenAt.toISOString(),
    bands: widgetBands(),
    hourNames: HOUR_NAMES,
    days,
  };
}

// --- Where a touch on a widget goes ------------------------------------------------------------
//
//   cpl://hour/<hour>?day=YYYY-MM-DD   that hour of that day, without passing through the home
//   cpl://mass/<opens>?day=YYYY-MM-DD  the readings of the Mass of that day, at <opens>
//   cpl://today                        the home, as when the app is opened

export const WIDGET_SCHEME = 'cpl';

export type WidgetLink =
  | { kind: 'hour'; hour: HourKey; day: string }
  | { kind: 'mass'; opens: MassScreenType; day: string }
  | { kind: 'today' };

const HOUR_KEYS = Object.keys(HOUR_NAMES) as HourKey[];
const MASS_SCREENS: MassScreenType[] = [
  '1Lect',
  'Salm',
  '2Lect',
  'Evangeli',
  'Rams',
  'VetllaPasquaLecturesSalms',
  'VetllaPasquaEvangeli',
];

export function hourLink(hour: HourKey, day: string): string {
  return `${WIDGET_SCHEME}://hour/${hour}?day=${day}`;
}

export function massLink(opens: MassScreenType, day: string): string {
  return `${WIDGET_SCHEME}://mass/${opens}?day=${day}`;
}

// Null for anything that is not a link of the widgets
export function parseWidgetLink(url: string | null | undefined): WidgetLink | null {
  if (!url) return null;
  const match = /^cpl:\/\/([a-z]+)(?:\/([^?#/]+))?\/?(?:\?([^#]*))?/i.exec(url.trim());
  if (!match) return null;
  const [, kind, target, query] = match;
  const day = /(?:^|&)day=(\d{4}-\d{2}-\d{2})(?:&|$)/.exec(query ?? '')?.[1];
  switch (kind.toLowerCase()) {
    case 'today':
      return { kind: 'today' };
    case 'hour': {
      const hour = HOUR_KEYS.find((key) => key === target);
      return hour && day && validDay(day) ? { kind: 'hour', hour, day } : null;
    }
    case 'mass': {
      const opens = MASS_SCREENS.find((screen) => screen === target);
      return opens && day && validDay(day) ? { kind: 'mass', opens, day } : null;
    }
  }
  return null;
}

function validDay(day: string): boolean {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// The local date of YYYY-MM-DD, at midnight
export function dateOfDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}
