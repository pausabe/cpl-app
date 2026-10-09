import { CelebrationType } from '../services/databaseEnums';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';
import { hasContent, hasVisibleText } from './content';
import { longDate, lowerFirst, ofName, romanize, singleLine, weekdayName } from './catalanText';

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

// The optional memorials of the day in the place (models/OptionalMemorials): with more than one,
// the card offers to choose instead of the switch
export interface MemorialsInput {
  options: { id: number; title: string; description: string }[];
  // The one prayed, or null for the weekday
  chosen: number | null;
}

export type ColorCode = 'R' | 'V' | 'M' | 'B';

export interface OptionalMemory {
  enabled: boolean;
  caption: string;
}

// A day with more than one optional memorial: the card says what is prayed, and a row opens the
// sheet to choose one of them or the weekday («Què celebres avui?»)
export interface MemorialChoice {
  // What each of them is, over the story of the one chosen: «Memòria lliure»
  memorialLabel: string;
  // Whether one of them is celebrated; if not, the weekday
  celebrated: boolean;
  // The first line of the row: «Celebrar una memòria», or «Canviar» once one is chosen
  action: string;
  // The second line, the names short: «Sants Dionís i companys o sant Joan Leonardi»
  names: string;
  sheet: MemorialSheet;
}

export interface MemorialSheet {
  title: string;
  // «Divendres, 9 d’octubre · dues memòries lliures»
  subtitle: string;
  // The weekday first, and then each memorial in the order of the table
  options: MemorialOption[];
}

export interface MemorialOption {
  // The row of the memorial, or null for the weekday
  id: number | null;
  title: string;
  // The weekday in its week, or the story of the saint (the sheet shows its beginning)
  subtitle: string;
  selected: boolean;
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
  // Only on a day with more than one optional memorial, which has this instead of the switch
  memorials?: MemorialChoice;
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

const isColorCode = (code: unknown): code is ColorCode =>
  typeof code === 'string' && Object.prototype.hasOwnProperty.call(COLOR_NAMES, code);

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

// What the card of a day with more than one optional memorial says when none is chosen
export const WEEKDAY_PRAYED = 'Avui es resa la fèria';

// Two or more, in words, as the card says them of memòries (feminine)
const COUNT_WORDS: Record<number, string> = { 2: 'Dues', 3: 'Tres', 4: 'Quatre', 5: 'Cinc', 6: 'Sis' };

// «Dues memòries lliures»; in Lent, where they are commemorations, «Dues commemoracions»
export function memorialsLabel(count: number, genericLiturgyTime: string): string {
  const number = COUNT_WORDS[count] ?? String(count);
  return `${number} ${genericLiturgyTime === GenericLiturgyTimeType.Lent ? 'commemoracions' : 'memòries lliures'}`;
}

// The name of a memorial without what each saint was, where there is little room: «Sants Dionís,
// bisbe, i companys, màrtirs» → «Sants Dionís i companys». It only leaves out, never writes: the
// pieces between commas that begin in lower case (bisbe, màrtirs, verge i doctora de l’Església),
// but those that are another name or join one («i companys», «i Tomàs More», «beat Àngel…»).
const SAINT_WORD = /^(sant|santa|sants|santes|beat|beata|beats|beates) /i;

const startsUpperCase = (text: string) => text.charAt(0) !== text.charAt(0).toLowerCase();

export function shortMemorialName(title: string): string {
  const [first, ...rest] = title.trim().split(', ');
  let name = first;
  for (const part of rest) {
    if (part.startsWith('i ')) name += ` ${part}`;
    else if (startsUpperCase(part) || SAINT_WORD.test(part)) name += `, ${part}`;
  }
  return name;
}

// «Sants Dionís i companys o sant Joan Leonardi»: in a sentence, «sant» goes in lower case after
// the first name
export function memorialNames(titles: string[]): string {
  const names = titles.map((title, index) => {
    const name = shortMemorialName(title);
    return index > 0 && SAINT_WORD.test(name) ? lowerFirst(name) : name;
  });
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} o ${names[names.length - 1]}`;
}

// The weekday a memorial can be left for, in its week: «Divendres de la setmana XXVII de durant
// l'any»; in Christmas time, which has no weeks, «Dimarts del temps de Nadal»
export function weekdayOfTheSeason(day: DayInput): string {
  const weekday = weekdayName(day.date.getDay());
  if (day.genericLiturgyTime === GenericLiturgyTimeType.Christmas) {
    return `${weekday} del ${lowerFirst(seasonTitle(day.genericLiturgyTime))}`;
  }
  if (validNumber(day.week)) return `${weekday} de la ${lowerFirst(weekOfSeason(day) as string)}`;
  return weekText(day) ?? seasonDayTitle(day);
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

// The day in its season when nothing is celebrated: "Setmana XXVII de durant l'any", "Octava de
// Nadal", "Temps de Nadal". What the card says of a day without a celebration of its own.
export function seasonDayTitle(day: DayInput): string {
  return dayInSeason(day, null, false).title;
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
  memorials: MemorialsInput | undefined,
): Celebration {
  if (day.celebrationType === CelebrationType.OptionalMemory && memorials && memorials.options.length > 1) {
    return buildMemorialChoice(day, celebration, typeLabel, memorials);
  }
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

// A day with more than one optional memorial: what is prayed, the weekday or the memorial chosen,
// and the choice. «Llegeix-ne més» is the story of the one chosen.
function buildMemorialChoice(
  day: DayInput,
  celebration: CelebrationInput,
  memorialLabel: string,
  { options, chosen }: MemorialsInput,
): Celebration {
  const label = memorialsLabel(options.length, day.genericLiturgyTime);
  const prayed = chosen === null ? null : options.find((option) => option.id === chosen);
  // A memorial celebrated that is not among them would be the one the hours have
  const title = chosen === null ? WEEKDAY_PRAYED : (prayed?.title ?? celebration.title);
  const description = chosen === null ? null : (prayed?.description ?? celebration.description);
  return {
    typeLabel: label,
    title,
    muted: false,
    description: hasContent(description) ? description : null,
    optionalMemory: null,
    memorials: {
      memorialLabel,
      celebrated: chosen !== null,
      action: chosen === null ? 'Celebrar una memòria' : 'Canviar',
      names: memorialNames(options.map((option) => option.title)),
      sheet: {
        title: 'Què celebres avui?',
        subtitle: `${longDate(day.date)} · ${lowerFirst(label)}`,
        options: [
          { id: null, title: 'Fèria', subtitle: weekdayOfTheSeason(day), selected: chosen === null },
          ...options.map((option) => ({
            id: option.id,
            title: option.title,
            subtitle: hasVisibleText(option.description) ? singleLine(option.description) : '',
            selected: option.id === chosen,
          })),
        ],
      },
    },
  };
}

// What the card of a day says before its celebration is worked out, from the day alone: its colour,
// the day in its season and the type of its celebration, all but the name. The same as buildDayCard
// says once the name is there, but for a day whose celebration has no texts in the place (the type
// goes) or a day of the season with a name of its own (Palm Sunday, the days of Holy Week). An
// optional memorial is taken as not celebrated, as it is on every day but one.
export interface CardWithoutName {
  colorCode: ColorCode;
  title: string;
  typeLabel: string | null;
  muted: boolean;
}

export function cardWithoutName(day: DayInput): CardWithoutName {
  const typeLabel = celebrationTypeLabel(day.celebrationType, day.genericLiturgyTime);
  const { title } = dayInSeason(
    day,
    typeLabel ? null : seasonDayName(day),
    typeLabel !== null && day.celebrationType === CelebrationType.Solemnity,
  );
  return { colorCode: colorCode(day.liturgyColor), title, typeLabel, muted: isOptionalMemory(day.celebrationType) };
}

// The name of a day of the season without a celebration, as the liturgy gives it when it has no
// other (services/liturgy/celebrationInformationService, buildCelebrationInformation): «Dijous
// Sant», «Cendra», «Fèria d’Advent». A few Sundays have a name of their own in the texts
// («Diumenge quart d'Advent»), which only the day worked out knows.
function seasonDayName(day: DayInput): string | null {
  switch (day.specificLiturgyTime) {
    case SpecificLiturgyTimeType.HolyWeek:
    case SpecificLiturgyTimeType.PaschalTriduum:
      return `${weekdayName(day.date.getDay())} Sant`;
    case SpecificLiturgyTimeType.EasterOctave:
      return 'Octava de Pasqua';
    case SpecificLiturgyTimeType.ChristmasOctave:
      return 'Octava de Nadal';
    case SpecificLiturgyTimeType.LentAshes:
      return 'Cendra';
    case SpecificLiturgyTimeType.AdventFairs:
      return 'Fèria d’Advent';
    case SpecificLiturgyTimeType.PalmSunday:
      return 'Diumenge de Rams';
  }
  return null;
}

// Whether the card shows an optional memorial (or Saint Mary on Saturday) as celebrated: the switch
// turned on, or one of several chosen
function celebratesOptionalMemorial(celebration: Celebration | null): boolean {
  if (!celebration) return false;
  return celebration.memorials ? celebration.memorials.celebrated : !!celebration.optionalMemory?.enabled;
}

// memorialColor is the colour litcal gives the optional memorial celebrated, when the database says
// it (services/liturgy/memorialColorService): a martyr is red on a green weekday. It colours the card
// only when the card shows that memorial celebrated; every other day has the colour of the day.
export function buildDayCard(
  day: DayInput,
  celebration: CelebrationInput,
  settings: PlaceAndOptionsInput,
  memorials?: MemorialsInput,
  memorialColor: string | null = null,
): DayCard {
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

  const built = typeLabel ? buildCelebration(day, celebration, typeLabel, settings, memorials) : null;
  const code =
    celebratesOptionalMemorial(built) && isColorCode(memorialColor) ? memorialColor : colorCode(day.liturgyColor);
  return {
    place: `${settings.dioceseName} (${settings.prayingPlace})`,
    dateText: longDate(day.date),
    colorCode: code,
    colorName: COLOR_NAMES[code],
    title,
    meta,
    celebration: built,
  };
}
