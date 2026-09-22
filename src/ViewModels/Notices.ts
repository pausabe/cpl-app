import { dayAndMonth, longDate, lowerFirst, weekdayName } from './CatalanText';

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
