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

// A celebration with a rank ("Festa", "Memòria lliure"…): the card says it under a line, apart
// from the day in its season
export interface Celebration {
  typeLabel: string;
  title: string;
  // An optional memorial that is not being celebrated: its label and title go grey
  muted: boolean;
  description: string | null;
  optionalMemory: OptionalMemory | null;
}

export interface DayCard {
  place: string;
  dateText: string;
  colorCode: ColorCode;
  colorName: string;
  // The day in its season: "Setmana XXV de durant l'any", "Octava de Nadal", "Temps de Nadal", or
  // the proper name of a day of the season ("Diumenge de Rams"). Never the weekday, which the
  // date says.
  title: string;
  // "Any A · Setmana I del salteri", with the season first when the title does not say it
  meta: string;
  celebration: Celebration | null;
}

const COLOR_NAMES: Record<ColorCode, string> = { R: 'Vermell', V: 'Verd', M: 'Morat', B: 'Blanc' };

// A code the database does not use shows as green, the colour of most of the year
export function colorCode(code: unknown): ColorCode {
  return typeof code === 'string' && code in COLOR_NAMES ? (code as ColorCode) : 'V';
}

const isOptionalMemory = (type: string) =>
  type === CelebrationType.OptionalMemory || type === CelebrationType.OptionalVirginMemory;

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

// The week in its season, the title of the card: "Setmana XXV de durant l'any", "Setmana II de
// Quaresma". Without the weekday, which the date above already says. The days after Ash
// Wednesday have no week: "Dijous després de Cendra".
export function weekOfSeason(day: DayInput): string | null {
  if (!validNumber(day.week)) return weekText(day);
  const week = `Setmana ${romanize(day.week)}`;
  const season = day.genericLiturgyTime;
  if (!season) return week;
  return season === GenericLiturgyTimeType.Ordinary ? `${week} de durant l'any` : `${week} ${ofName(season)}`;
}

// The octaves go by that name, not by the week: in the Christmas octave the database's week is
// that of the psalter, and Christmas would be «Setmana IV de Nadal». Easter Sunday opens its own.
export function octaveName(specificLiturgyTime: string): string | null {
  switch (specificLiturgyTime) {
    case SpecificLiturgyTimeType.ChristmasOctave:
      return 'Octava de Nadal';
    case SpecificLiturgyTimeType.EasterSunday:
    case SpecificLiturgyTimeType.EasterOctave:
      return 'Octava de Pasqua';
  }
  return null;
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

// The season as the title of the day: "Temps de Pasqua", not "Pasqua", which on its own reads as
// Easter Day
export function seasonTitle(genericLiturgyTime: string): string {
  switch (genericLiturgyTime) {
    case '':
    case GenericLiturgyTimeType.Ordinary:
    case GenericLiturgyTimeType.PaschalTriduum:
      return seasonName(genericLiturgyTime);
  }
  return `Temps ${ofName(genericLiturgyTime)}`;
}

// The title of the day in its season, and whether it already names the season ("Octava de
// Pasqua", "Fèria d’Advent", but not "Diumenge de Rams")
function dayInSeason(
  day: DayInput,
  properName: string | null,
  solemnity: boolean,
): { title: string; saysSeason: boolean } {
  if (properName) return { title: properName, saysSeason: properName.includes(day.genericLiturgyTime) };
  const octave = octaveName(day.specificLiturgyTime);
  if (octave) return { title: octave, saysSeason: true };
  // A solemnity takes the whole day, and its week says nothing (Pentecost would be the eighth
  // week of Easter). In Christmas time the database's week is that of the psalter: there are no
  // weeks of Christmas.
  const week = solemnity || day.genericLiturgyTime === GenericLiturgyTimeType.Christmas ? null : weekOfSeason(day);
  if (week) return { title: week, saysSeason: validNumber(day.week) };
  return { title: seasonTitle(day.genericLiturgyTime), saysSeason: true };
}

function buildCelebration(
  day: DayInput,
  celebration: CelebrationInput,
  typeLabel: string,
  settings: PlaceAndOptionsInput,
): Celebration {
  const optional = isOptionalMemory(day.celebrationType);
  const enabled = !!settings.optionalFestivityEnabled;
  return {
    typeLabel,
    title: celebration.title,
    muted: optional && !enabled,
    description: hasContent(celebration.description) ? celebration.description : null,
    optionalMemory: optional ? { enabled, caption: optionalMemoryCaption(enabled) } : null,
  };
}

export function buildDayCard(day: DayInput, celebration: CelebrationInput, settings: PlaceAndOptionsInput): DayCard {
  const hasTitle = hasContent(celebration.title);
  const typeLabel = hasTitle ? celebrationTypeLabel(day.celebrationType, day.genericLiturgyTime) : null;
  // A day of the season with a name of its own and no rank (Palm Sunday, the Triduum, the days
  // of the Easter octave) is the day itself: it goes on top, with nothing under the line
  const { title, saysSeason } = dayInSeason(
    day,
    hasTitle && !typeLabel ? celebration.title : null,
    typeLabel !== null && day.celebrationType === CelebrationType.Solemnity,
  );

  const cycle = validNumber(day.weekCycle);
  const meta = [
    saysSeason ? null : seasonName(day.genericLiturgyTime),
    cycle && hasVisibleText(day.yearType) ? `Any ${day.yearType}` : null,
    cycle ? `Setmana ${romanize(day.weekCycle)} del salteri` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const code = colorCode(day.liturgyColor);
  return {
    place: `${settings.dioceseName} (${settings.prayingPlace})`,
    dateText: longDate(day.date),
    colorCode: code,
    colorName: COLOR_NAMES[code],
    title,
    meta,
    celebration: typeLabel ? buildCelebration(day, celebration, typeLabel, settings) : null,
  };
}
