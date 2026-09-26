import { dayAndMonth, longDate, lowerFirst, weekdayName } from './catalanText';

// The texts of the notices on the home.

export interface LatePrayerTexts {
  title: string;
  question: string;
  yes: { label: string; date: string };
  no: { label: string; date: string };
}

// Between midnight and 3 h: yesterday's liturgy or today's?
export function latePrayerTexts(today: Date, yesterday: Date): LatePrayerTexts {
  return {
    title: `Ja estem a ${lowerFirst(longDate(today))}.`,
    question: `Vols la litúrgia d’ahir, ${lowerFirst(weekdayName(yesterday.getDay()))} ${dayAndMonth(yesterday)}?`,
    yes: { label: 'Sí, la d’ahir', date: longDate(yesterday) },
    no: { label: 'No, la d’avui', date: longDate(today) },
  };
}

// Shown once, the first time 9.0.0 opens
export const WHATS_NEW = {
  title: 'Ara ho tens tot a l’inici',
  body: 'Les hores i les lectures de la missa són aquí mateix: toca la que vulguis. El calendari i la configuració són on sempre.',
  button: 'D’acord',
};

// How the search for the diocese went. Both the button in Configuració and the notice on the home
// are keyed by it, so the words for each outcome are written once.
export type LocationStatus = 'idle' | 'locating' | 'unchanged' | 'nowhere' | 'denied' | 'failed';

// Nothing is said when the diocese has just changed: what it changed to says it better.
export const LOCATION_NOTICES: Record<LocationStatus, string | null> = {
  idle: null,
  locating: null,
  unchanged: 'Ja tenies la diòcesi d’on ets ara.',
  nowhere: 'No s’ha pogut dir a quina diòcesi correspon aquesta ubicació. Tria-la tu mateix.',
  denied: 'No has donat permís d’ubicació. El pots donar als Ajustos del telèfon.',
  failed: 'No s’ha pogut saber on ets. Torna-ho a provar.',
};

// Once the permission has been refused, iOS never asks again: pressing the same button would do
// nothing at all and look broken. It becomes the way out instead.
export const OPEN_PHONE_SETTINGS = 'Obre els Ajustos del telèfon';
export const LOOKING_FOR_YOU = 'Buscant on ets…';
export const USE_MY_LOCATION = 'Fes servir la meva ubicació';

export interface DioceseOfferTexts {
  title: string;
  body: string;
  find: string;
  choose: string;
}

// Offered once, only to whoever has never chosen a diocese: what they are praying with is the one
// the app comes with and there is no way for them to know it. Whoever did choose is never asked,
// wherever they happen to be. Somebody who already knew the app is told which one they have;
// somebody opening it for the first time is only asked.
export function dioceseOfferTexts(currentDiocese: string, openedBefore: boolean): DioceseOfferTexts {
  return {
    title: openedBefore ? `Estàs resant amb la diòcesi de ${currentDiocese}` : 'De quina diòcesi ets?',
    body: openedBefore
      ? 'És la que porta l’aplicació de sèrie, i potser no és la teva. Les celebracions pròpies en depenen.'
      : 'Cada diòcesi té les seves celebracions pròpies. Podem trobar la teva amb la ubicació del telèfon, o la pots triar de la llista.',
    find: USE_MY_LOCATION,
    choose: 'La trio jo',
  };
}
