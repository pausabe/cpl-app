import { CelebrationType } from '../services/databaseEnums';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';
import { hasContent, hasVisibleText } from './content';
import { longDate, ofName, romanize, weekdayName } from './catalanText';

// The day card at the top of the home: where, when, what is celebrated and the colour.
//
// It only needs these fields, the ones of LiturgySpecificDayInformation, CelebrationInformation
// and Settings that say it; whatever provides the day's data can fill them.
export interface DayInput {
  Date: Date;
  CelebrationType: string;
  LiturgyColor: string;
  GenericLiturgyTime: string;
  SpecificLiturgyTime: string;
  Week: string;
  WeekCycle: string;
  YearType: string;
}

export interface CelebrationInput {
  Title: string;
  Description: string;
}

export interface PlaceAndOptionsInput {
  DioceseName: string;
  PrayingPlace: string;
  OptionalFestivityEnabled: boolean;
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
  const weekday = weekdayName(day.Date.getDay());
  if (validNumber(day.Week)) return `${weekday} de la setmana ${romanize(day.Week)}`;
  if (day.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
    return day.Date.getDay() === 3 ? `${weekday} de Cendra` : `${weekday} després de Cendra`;
  }
  return null;
}

// The week of a celebration, on the line under its title: "Setmana XXV", and out of the ordinary
// time "Setmana II de Quaresma". Without the weekday, which the date above already says: with it
// ("Dilluns de la setmana XXV · Any A · …") the line always took two. The days after Ash
// Wednesday have no week: "Dijous després de Cendra".
export function weekOfSeason(day: DayInput): string | null {
  if (!validNumber(day.Week)) return weekText(day);
  const week = `Setmana ${romanize(day.Week)}`;
  const season = day.GenericLiturgyTime;
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
  const hasTitle = hasContent(celebration.Title);
  const season = seasonName(day.GenericLiturgyTime);
  const week = weekText(day);

  let title: string;
  let first: string | null;
  if (hasTitle) {
    title = celebration.Title;
    first = week && WEEKDAY_CELEBRATIONS.includes(day.CelebrationType) ? weekOfSeason(day) : season;
  } else if (week) {
    title = week;
    first = season;
  } else {
    title = season;
    first = null;
  }
  const cycle = validNumber(day.WeekCycle);
  const meta = [
    first,
    cycle && hasVisibleText(day.YearType) ? `Any ${day.YearType}` : null,
    cycle ? `Setmana ${romanize(day.WeekCycle)} del salteri` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const optional = hasTitle && isOptionalMemory(day.CelebrationType);
  const code = colorCode(day.LiturgyColor);
  return {
    place: `${settings.DioceseName} (${settings.PrayingPlace})`,
    dateText: longDate(day.Date),
    colorCode: code,
    colorName: COLOR_NAMES[code],
    typeLabel: hasTitle ? celebrationTypeLabel(day.CelebrationType, day.GenericLiturgyTime) : null,
    title,
    muted: optional && !settings.OptionalFestivityEnabled,
    meta,
    description: hasTitle && hasContent(celebration.Description) ? celebration.Description : null,
    optionalMemory: optional
      ? {
          enabled: !!settings.OptionalFestivityEnabled,
          caption: optionalMemoryCaption(!!settings.OptionalFestivityEnabled),
        }
      : null,
  };
}
