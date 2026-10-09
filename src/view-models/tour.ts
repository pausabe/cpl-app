// The tour of what is new in this version: a few steps over the real app, each pointing at the
// button or the row it talks about (components/TourTarget). Some go on with «Següent»; others by
// doing what they say (opening the calendar, Configuració, Lauds, the headphones), which is the
// point of a tour. Pau asked for it on 9 October 2026, for what 9.1 and 9.2 never showed: the
// diocese found with the location, the new calendar, the Gospel at Lauds and listening to the prayer.

// Once per version of the tour: a new one is shown again to everybody
export const TOUR_VERSION = '9.3';

export type TourRoute = 'Home' | 'Calendar' | 'Settings' | 'LHDisplay';
export type TourEvent = 'listen-started';

export interface TourStep {
  id: string;
  // The screen it happens on; null, wherever it is
  route: TourRoute | null;
  // What it points at (TourTarget); null, a card in the middle
  target: string | null;
  title?: string;
  text: string;
  // How it goes on: the button, or the app getting to a screen, or something happening
  advance: 'next' | { route: TourRoute } | { event: TourEvent };
  // Only while the prayer can be heard (cpl-cloud can turn it off)
  needsAudio?: boolean;
}

const STEPS: TourStep[] = [
  {
    id: 'intro',
    route: null,
    target: null,
    title: 'Novetats',
    text: "Hi ha unes quantes coses noves a l'app. Te les ensenyem en un minut?",
    advance: 'next',
  },
  {
    id: 'calendar-button',
    route: 'Home',
    target: 'calendar-button',
    text: 'El calendari litúrgic és nou. Toca’l.',
    advance: { route: 'Calendar' },
  },
  {
    id: 'calendar',
    route: 'Calendar',
    target: null,
    title: 'Calendari',
    text: 'Cada mes amb el color del seu temps i la celebració de cada dia. Toca un dia per anar-hi; a dalt, qualsevol mes i qualsevol any.',
    advance: 'next',
  },
  {
    id: 'settings-button',
    route: 'Home',
    target: 'settings-button',
    text: 'A Configuració també hi ha coses noves. Toca-la.',
    advance: { route: 'Settings' },
  },
  {
    id: 'location',
    route: 'Settings',
    target: 'settings-location',
    text: 'La diòcesi es pot triar sola, amb la ubicació del mòbil.',
    advance: 'next',
  },
  {
    id: 'laudes-gospel',
    route: 'Settings',
    target: 'settings-laudes-gospel',
    text: 'Si ho vols, Laudes porta l’Evangeli del dia, després del responsori breu.',
    advance: 'next',
  },
  {
    id: 'day-audio',
    route: 'Settings',
    target: 'settings-day-audio',
    text: "Abans d'anar on no hi ha connexió, baixa't l'àudio d'avui.",
    advance: 'next',
    needsAudio: true,
  },
  {
    id: 'laudes',
    route: 'Home',
    target: 'hour-laudes',
    text: 'I la novetat més gran: escoltar la pregària. Obre Laudes.',
    advance: { route: 'LHDisplay' },
    needsAudio: true,
  },
  {
    id: 'listen-button',
    route: 'LHDisplay',
    target: 'listen-button',
    text: 'Toca els auriculars: la pregària es llegeix en veu alta, a dos cors.',
    advance: { event: 'listen-started' },
    needsAudio: true,
  },
  {
    id: 'listen-bar',
    route: 'LHDisplay',
    target: 'listen-bar',
    text: 'La pantalla va marcant el que es diu, i sona també amb el mòbil bloquejat i al cotxe. Tocant el reproductor tries la part i la velocitat; amb la creu, s’atura.',
    advance: 'next',
    needsAudio: true,
  },
  {
    id: 'end',
    route: null,
    target: null,
    title: 'Això és tot',
    text: 'Pots tornar a veure aquestes novetats a Configuració, a sota de tot.',
    advance: 'next',
  },
];

export function tourSteps({ audio }: { audio: boolean }): TourStep[] {
  return STEPS.filter((step) => audio || !step.needsAudio);
}

// What the bubble of a step says on its buttons
export function tourButtons(step: TourStep, index: number, count: number) {
  const first = index === 0;
  const last = index === count - 1;
  return {
    primary: step.advance === 'next' ? (first ? 'Som-hi' : last ? 'Fet' : 'Següent') : null,
    // The last one only closes
    secondary: first ? 'Ara no' : last ? null : 'Surt',
    progress: first || last ? null : `${index} de ${count - 2}`,
  };
}
