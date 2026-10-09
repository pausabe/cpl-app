// The tour of what is new in this version: a few steps over the real app, each pointing at the
// button or the row it talks about (components/TourTarget). Some go on with «Següent»; others by
// doing what they say (opening the calendar, Configuració, Lauds, the headphones), which is the
// point of a tour. Pau asked for it on 9 October 2026, for what 9.1 and 9.2 never showed: the
// diocese found with the location, the new calendar, the Gospel at Lauds and listening to the prayer.
// The same day he asked for one more, the widgets of the home screen, which live outside the app:
// the step draws one, and on Android it can put it there.

// Once per version of the tour: a new one is shown again to everybody
export const TOUR_VERSION = '9.3';

export type TourRoute = 'Home' | 'Calendar' | 'Settings' | 'LHDisplay';
export type TourEvent = 'listen-opened';
// Something a step can do besides going on: put a widget on the home screen (Android)
export type TourAction = 'pin-widget';

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
  // A drawing in the bubble: the widget «L’hora d’ara»
  illustration?: 'widget';
  // A button of its own, besides «Següent»
  action?: { label: string; does: TourAction };
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
    text: 'Toca els auriculars per obrir el reproductor.',
    advance: { event: 'listen-opened' },
    needsAudio: true,
  },
  {
    id: 'listen-bar',
    route: 'LHDisplay',
    target: 'listen-bar',
    // It opens paused (tourController): nothing is heard unless the play button is touched
    text: 'Amb el botó de reproduir, la pregària es llegeix en veu alta, a dos cors. La pantalla va marcant el que es diu, i sona també amb el mòbil bloquejat i al cotxe. Tocant el reproductor tries la part i la velocitat; amb la creu, es tanca.',
    advance: 'next',
    needsAudio: true,
  },
  // widgetsStep goes here
  {
    id: 'end',
    route: null,
    target: null,
    title: 'Això és tot',
    text: 'Pots tornar a veure aquestes novetats a Configuració, a sota de tot.',
    advance: 'next',
  },
];

export interface TourWidgets {
  platform: 'ios' | 'android';
  // Whether the launcher lets the app put a widget there with one touch
  canPin: boolean;
}

const WIDGETS_WHAT =
  'Ara pots tenir la CPL a la pantalla d’inici del mòbil, amb l’hora que toca resar: un toc i s’obre.';

// How to put one there by hand, in the words of each system: iOS 17 has «+», later ones «Edita»
function widgetsStep({ platform, canPin }: TourWidgets): TourStep {
  const how =
    platform === 'ios'
      ? ' Mantén premut un espai buit de la pantalla d’inici, toca «Edita» o «+» i busca la CPL.'
      : canPin
        ? ''
        : ' Mantén premut un espai buit de la pantalla d’inici, toca «Widgets» i busca la CPL.';
  // A card wherever the tour is: over Lauds, whose player may be playing and must go on
  return {
    id: 'widgets',
    route: null,
    target: null,
    title: 'A la pantalla d’inici',
    text: WIDGETS_WHAT + how,
    advance: 'next',
    illustration: 'widget',
    ...(platform === 'android' && canPin
      ? { action: { label: 'Posa-la a l’inici', does: 'pin-widget' as const } }
      : {}),
  };
}

// Without widgets (the web, the tests), no step about them
export function tourSteps({ audio, widgets = null }: { audio: boolean; widgets?: TourWidgets | null }): TourStep[] {
  const steps = STEPS.filter((step) => audio || !step.needsAudio);
  if (!widgets) return steps;
  return [...steps.slice(0, -1), widgetsStep(widgets), steps[steps.length - 1]];
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
