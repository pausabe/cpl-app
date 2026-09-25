import { CelebrationType } from '../services/databaseEnums';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';
import { hasContent, hasVisibleText } from './content';
import { longDate, ofName, romanize, weekdayName } from './catalanText';

// The day card at the top of the home: where, when, what is celebrated and the colour.
//
// It only needs these fields, the ones of LiturgySpecificDayInformation, CelebrationInformation
// and Settings that say it; whatever provides the day's data can fill them.
export interface DayInput {
  date: Date;
  celebrationType: string;
  liturgyColor: string;
  genericLiturgyTime: string;
  specificLiturgyTime: string;
  week: string;
  weekCycle: string;
  yearType: string;
}

export interface CelebrationInput {
  title: string;
  description: string;
}

export interface PlaceAndOptionsInput {
  dioceseName: string;
  prayingPlace: string;
  optionalFestivityEnabled: boolean;
}

export type ColorCode = 'R' | 'V' | 'M' | 'B';

export interface OptionalMemory {
  enabled: boolean;
  caption: string;
}

export interface DayCard {
  place: string;
  dateText: string;
  colorCode: ColorCode;
  colorName: string;
  // "Festa", "Memòria lliure"… only when a celebration has a title
  typeLabel: string | null;
  title: string;
  // An optional memorial that is not being celebrated: its label and title go grey
  muted: boolean;
  // "Setmana XXV · Any A · Setmana I del salteri"
  meta: string;
  description: string | null;
  optionalMemory: OptionalMemory | null;
}

const COLOR_NAMES: Record<ColorCode, string> = { R: 'Vermell', V: 'Verd', M: 'Morat', B: 'Blanc' };

// A code the database does not use shows as green, the colour of most of the year
export function colorCode(code: unknown): ColorCode {
  return typeof code === 'string' && code in COLOR_NAMES ? (code as ColorCode) : 'V';
}

const isOptionalMemory = (type: string) =>
  type === CelebrationType.OptionalMemory || type === CelebrationType.OptionalVirginMemory;

// Celebrations that fall on a weekday of a week: the week is said next to the title
const WEEKDAY_CELEBRATIONS: string[] = [
  CelebrationType.Festivity,
  CelebrationType.Memory,
  CelebrationType.OptionalMemory,
  CelebrationType.OptionalVirginMemory,
];

const validNumber = (value: string) => value !== '0' && value !== '.' && hasVisibleText(value);

// What HomeScreen.tempsName did
export function seasonName(genericLiturgyTime: string): string {
  if (!genericLiturgyTime) return '';
  return genericLiturgyTime === GenericLiturgyTimeType.Ordinary ? "Durant l'any" : genericLiturgyTime;
}

// "Dimarts de la setmana XXV"; in the days after Ash Wednesday, "Dijous després de Cendra".
// What HomeScreen.Info_Liturgica wrote on its first line.
export function weekText(day: DayInput): string | null {
  const weekday = weekdayName(day.date.getDay());
  if (validNumber(day.week)) return `${weekday} de la setmana ${romanize(day.week)}`;
  if (day.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
    return day.date.getDay() === 3 ? `${weekday} de Cendra` : `${weekday} després de Cendra`;
  }
  return null;
}

// The week of a celebration, on the line under its title: "Setmana XXV", and out of the ordinary
// time "Setmana II de Quaresma". Without the weekday, which the date above already says: with it
// ("Dilluns de la setmana XXV · Any A · …") the line always took two. The days after Ash
// Wednesday have no week: "Dijous després de Cendra".
export function weekOfSeason(day: DayInput): string | null {
  if (!validNumber(day.week)) return weekText(day);
  const week = `Setmana ${romanize(day.week)}`;
  const season = day.genericLiturgyTime;
  return !season || season === GenericLiturgyTimeType.Ordinary ? week : `${week} ${ofName(season)}`;
}

// What HomeScreen.transfromCelTypeName wrote above the title
export function celebrationTypeLabel(type: string, genericLiturgyTime: string): string | null {
  const lent = genericLiturgyTime === GenericLiturgyTimeType.Lent;
  switch (type) {
    case CelebrationType.Festivity:
      return 'Festa';
    case CelebrationType.Solemnity:
      return 'Solemnitat';
    case CelebrationType.Memory:
      return lent ? 'Commemoració' : 'Memòria obligatòria';
    case CelebrationType.OptionalMemory:
    case CelebrationType.OptionalVirginMemory:
      return lent ? 'Commemoració' : 'Memòria lliure';
  }
  return null;
}

export function optionalMemoryCaption(enabled: boolean): string {
  return enabled ? 'Avui es resa la memòria.' : 'Si no l’actives, avui es resa la fèria.';
}

export function buildDayCard(day: DayInput, celebration: CelebrationInput, settings: PlaceAndOptionsInput): DayCard {
  const hasTitle = hasContent(celebration.title);
  const season = seasonName(day.genericLiturgyTime);
  const week = weekText(day);

  let title: string;
  let first: string | null;
  if (hasTitle) {
    title = celebration.title;
    first = week && WEEKDAY_CELEBRATIONS.includes(day.celebrationType) ? weekOfSeason(day) : season;
  } else if (week) {
    title = week;
    first = season;
  } else {
    title = season;
    first = null;
  }
  const cycle = validNumber(day.weekCycle);
  const meta = [
    first,
    cycle && hasVisibleText(day.yearType) ? `Any ${day.yearType}` : null,
    cycle ? `Setmana ${romanize(day.weekCycle)} del salteri` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const optional = hasTitle && isOptionalMemory(day.celebrationType);
  const code = colorCode(day.liturgyColor);
  return {
    place: `${settings.dioceseName} (${settings.prayingPlace})`,
    dateText: longDate(day.date),
    colorCode: code,
    colorName: COLOR_NAMES[code],
    typeLabel: hasTitle ? celebrationTypeLabel(day.celebrationType, day.genericLiturgyTime) : null,
    title,
    muted: optional && !settings.optionalFestivityEnabled,
    meta,
    description: hasTitle && hasContent(celebration.description) ? celebration.description : null,
    optionalMemory: optional
      ? {
          enabled: !!settings.optionalFestivityEnabled,
          caption: optionalMemoryCaption(!!settings.optionalFestivityEnabled),
        }
      : null,
  };
}
