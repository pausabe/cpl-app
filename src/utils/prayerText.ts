import * as Logger from './logger';
import { SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';

// What the prayer screens do to the texts of the database before showing them. Every function
// here gives the same text it always gave: the golden of the screens holds them to it, word for
// word, and a change of behaviour belongs in a commit of its own.

// The text without the one space or line break it ends with, which the database often leaves.
// What is not a text (nothing, or an empty one) comes back as it is.
export function withoutTrailingSpace<T extends string | null | undefined>(text: T): T {
  if (text) {
    const lastChar = text.charAt(text.length - 1);
    if (lastChar === ' ' || lastChar === '\n') return text.slice(0, text.length - 1) as T;
  }
  return text;
}

// The same for the readings of the Mass, where nothing becomes an empty text
export function trimmedText(text: string | null | undefined): string {
  if (!text) {
    return '';
  }

  try {
    const lastChar = text.charAt(text.length - 1);
    if (lastChar === ' ' || lastChar === '\n') return text.slice(0, text.length - 1);
    return text;
  } catch (error) {
    Logger.logError(Logger.LogKeys.GlobalFunctions, 'trim', error as Error);
    return text;
  }
}

// «Càntic» and its reference on two lines
export function canticleTitle(title: string): string {
  if (title) title = title.replace('Càntic\t', 'Càntic\n');
  return title;
}

// The psalm without the marks of the pauses (* and †) and the spaces before them
export function withoutPsalmMarks(psalm: string | null | undefined): string | null {
  if (!psalm) return null;
  psalm = psalm.replace(/ {4}[*]/g, '');
  psalm = psalm.replace(/ {3}[*]/g, '');
  psalm = psalm.replace(/ {2}[*]/g, '');
  psalm = psalm.replace(/ [*]/g, '');
  psalm = psalm.replace(/ {4}[†]/g, '');
  psalm = psalm.replace(/ {3}[†]/g, '');
  psalm = psalm.replace(/ {2}[†]/g, '');
  psalm = psalm.replace(/ [†]/g, '');
  return psalm;
}

// The Al·leluia after the Glòria of the opening, which is left out in Lent and in the Triduum
export function hasAlleluia(time: SpecificLiturgyTimeType): boolean {
  return (
    time !== SpecificLiturgyTimeType.LentAshes &&
    time !== SpecificLiturgyTimeType.LentWeeks &&
    time !== SpecificLiturgyTimeType.PalmSunday &&
    time !== SpecificLiturgyTimeType.HolyWeek &&
    time !== SpecificLiturgyTimeType.PaschalTriduum
  );
}

// The invitatory psalm can be any of the four, unless it is one of the psalms of the day
export function canBeInvitatoryPsalm(psalmNumber: string, titles: (string | undefined)[]): boolean {
  for (const title of titles) {
    if (title && title.search('Salm ' + psalmNumber) !== -1) return false;
  }
  return true;
}

const LONG_THROUGH_CHRIST =
  "Per nostre Senyor Jesucrist, el vostre Fill, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
const SHORT_THROUGH_CHRIST = 'Per Crist Senyor nostre';
const LONG_TO_THE_SON =
  "Vós, que viviu i regneu amb Déu Pare en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
const SHORT_TO_THE_SON = 'Vós, que viviu i regneu pels segles dels segles';
const LONG_THE_SON = "Ell, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
const SHORT_THE_SON = 'Ell, que viu i regna pels segles dels segles';

// How the database ends a prayer, and the conclusion it is given: the short one at the minor
// hours, the long one at the others. The first that matches is the one used.
const CONCLUSIONS: { ending: string; short: string; long: string }[] = [
  { ending: 'Per nostre Senyor Jesucrist', short: SHORT_THROUGH_CHRIST, long: LONG_THROUGH_CHRIST },
  { ending: 'Que amb vós viu i regna', short: SHORT_THROUGH_CHRIST, long: LONG_THROUGH_CHRIST },
  { ending: 'Vós, que viviu i regneu pels segles dels segles', short: SHORT_TO_THE_SON, long: LONG_TO_THE_SON },
  { ending: 'Vós, que viviu i regneu', short: SHORT_TO_THE_SON, long: LONG_TO_THE_SON },
  { ending: 'Que viu i regna pels segles dels segles', short: SHORT_THE_SON, long: LONG_THE_SON },
  { ending: 'Ell, que viu i regna pels segles dels segles', short: SHORT_THE_SON, long: LONG_THE_SON },
  { ending: 'Ell, que amb vós viu i regna', short: SHORT_THE_SON, long: LONG_THE_SON },
];

// The final prayer with its whole conclusion. The soft hyphens go only when a conclusion is
// written in, and not when the text starts with one: that is how it has always been.
export function completePrayer(prayer: string | null | undefined, minorHour: boolean): string {
  if (!prayer) return '';

  let text = prayer;
  if (text.search(/­/g)) {
    text = text.replace(/­/g, '');
  }

  for (const { ending, short, long } of CONCLUSIONS) {
    if (text.includes(ending)) return text.replace(ending, minorHour ? short : long);
  }
  return prayer;
}

// Words that keep their capital letter when the second part of a responsory follows the first
const CAPITALISED_WORDS = ['Senyor', 'Déu', 'Vós', 'Mare', 'Verge', 'Maria', 'Sant'];

// The two first parts of a responsory, as one sentence
export function responsoryTogether(firstPart: string | undefined, secondPart: string | undefined): string {
  if (!firstPart || !secondPart) {
    const errorMessage = `First Part = '${firstPart}', Second Part = '${secondPart}'`;
    Logger.logError(Logger.LogKeys.GlobalFunctions, 'respTogether', new Error(errorMessage));
    return '';
  }

  const lastCharacter = firstPart.charAt(firstPart.length - 1);
  const firstWord = secondPart.split(' ')[0].replace(',', '').replace('.', '').replace(':', '').replace(';', '');
  if (lastCharacter !== '.' && !CAPITALISED_WORDS.includes(firstWord)) {
    return firstPart + ' ' + secondPart.charAt(0).toLowerCase() + secondPart.slice(1);
  }
  return firstPart + ' ' + secondPart;
}

// The names of the pope and the bishop in place of the N. of the intercessions
export function withConcreteNames(intercessions: string, pope: string, bishop: string): string {
  if (intercessions.search('papa N.') !== -1) {
    intercessions = intercessions.replace('papa N.', 'papa ' + pope);
  } else if (intercessions.search('Papa N.') !== -1) {
    intercessions = intercessions.replace('Papa N.', 'papa ' + pope);
  }
  if (intercessions.search('bisbe N.') !== -1) {
    intercessions = intercessions.replace('bisbe N.', 'bisbe ' + bishop);
  }
  return intercessions;
}

// The intercessions of Lauds and Vespers, taken apart to show the response in italics and to say
// where other intentions can be added. When the text does not have the shape expected it is
// shown as it comes, whole.
export type Intercessions =
  | { kind: 'text'; text: string }
  | { kind: 'parts'; intro: string; response: string; intercessions: string; finalPart: string };

// At Vespers the last intercession (for the dead) goes after the other intentions; at Lauds,
// only the closing sentence does.
export function intercessionsOf(
  prayers: string | undefined,
  hour: 'laudes' | 'vespers',
  names: { pope: string; bishop: string },
): Intercessions {
  let all = withoutTrailingSpace(prayers);
  if (all === null || all === undefined || all === '' || all === '-') return { kind: 'text', text: '-' };

  all = withConcreteNames(all, names.pope, names.bishop);
  const whole: Intercessions = { kind: 'text', text: all };
  const somethingIncorrect = (step: number): Intercessions => {
    Logger.log(Logger.LogKeys.Screens, 'intercessions', `InfoLog. something incorrect. Intercessions ${step}`);
    return whole;
  };

  const dashes = all.match(/—/g);
  if (!dashes) return whole;
  const dashCount = dashes.length;
  const newlines = all.match(/\n/g);
  if (!newlines) return whole;
  // Every intercession takes three line breaks, and the introduction three more
  if (newlines.length !== dashCount * 3 + 3) return whole;

  const intro = all.split(':')[0];
  if (all.search(intro + ':') === -1) return somethingIncorrect(1);
  let withoutIntro = all.replace(intro + ':', '');
  if (withoutIntro !== '') {
    while (withoutIntro.charAt(0) === '\n' || withoutIntro.charAt(0) === ' ') {
      withoutIntro = withoutIntro.substring(1, withoutIntro.length);
    }
  }

  const response = withoutIntro.split('\n')[0];
  if (withoutIntro.search(response + '\n\n') === -1) return somethingIncorrect(2);
  let intercessions = withoutIntro.replace(response + '\n\n', '');

  if (intercessions.search(': Pare nostre.') !== -1) {
    intercessions = intercessions.replace(': Pare nostre.', ':');
  } else if (hour === 'vespers' && intercessions.search(':  Pare nostre.') !== -1) {
    intercessions = intercessions.replace(':  Pare nostre.', ':');
  } else {
    return somethingIncorrect(3);
  }

  const pieces = intercessions.split('—');
  const finalPart =
    hour === 'vespers'
      ? pieces[dashCount - 1].split('.\n\n')[1] + '—' + pieces[dashCount]
      : pieces[dashCount].split('.\n\n')[1];
  if (intercessions.search('\n\n' + finalPart) === -1) return somethingIncorrect(4);
  intercessions = intercessions.replace('\n\n' + finalPart, '');

  return { kind: 'parts', intro, response, intercessions, finalPart };
}
