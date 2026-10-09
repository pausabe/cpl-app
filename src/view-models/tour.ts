// The tour of what is new in this version: a few steps over the home, each pointing at where the
// thing is (components/TourTarget) or a card in the middle, all of them with «Següent». Pau asked
// for it on 9 October 2026, for what 9.1 and 9.2 never showed, and for the widgets of the home
// screen. The first one went from screen to screen by itself and had steps without a button
// («Toca’l»); the same day he found it strange for older people, and it became this one, which
// stays on the home and only says where things are.
//
// What the home cannot show, listening, is shown where it happens: whoever went into the tour
// gets the headphones pointed at the first time they open an hour (LISTEN_HINT). Configuració says
// «Nou» next to the rest (controllers/newBadges).

// Once per version of the tour: a new one is shown again to everybody. 9.3.1 went out with the
// first one; whoever saw it does not see this one.
export const TOUR_VERSION = '9.3';

// The tour is on the home: a step waits for it
export type TourRoute = 'Home';
// What ends a step besides its button: the headphones touched through the hole
export type TourEvent = 'listen-opened';
// Something a step can do besides going on: put a widget on the home screen (Android)
export type TourAction = 'pin-widget';
// The icons of the first card, one per thing that is coming
export type TourItemIcon = 'headphones' | 'calendar' | 'widget';

export interface TourStep {
  id: string;
  // The screen it happens on; null, wherever it is
  route: TourRoute | null;
  // What it points at (TourTarget); null, a card in the middle
  target: string | null;
  title?: string;
  text: string;
  // Under the text, smaller: how to do it by hand
  detail?: string;
  // At the bottom, smaller still: where to see the tour again
  footnote?: string;
  // «Nou», over the text
  isNew?: boolean;
  // What is coming, one line each (the first card)
  items?: { icon: TourItemIcon; label: string }[];
  // The hole lets the thing be touched, and this happening ends the step
  endsWhen?: TourEvent;
  // Only while the prayer can be heard (cpl-cloud can turn it off)
  needsAudio?: boolean;
  // A drawing in the bubble: the widget «L’hora d’ara»
  illustration?: 'widget';
  // A button of its own, besides «Següent»
  action?: { label: string; does: TourAction };
}

export interface TourWidgets {
  platform: 'ios' | 'android';
  // Whether the launcher lets the app put a widget there with one touch
  canPin: boolean;
}

const LISTEN: TourStep = {
  id: 'listen',
  route: 'Home',
  target: 'hours',
  title: 'Escoltar la pregària',
  text: 'Ara l’app et pot llegir la pregària en veu alta. Obre una hora i toca els auriculars, a dalt a la dreta.',
  needsAudio: true,
};

const CALENDAR: TourStep = {
  id: 'calendar',
  route: 'Home',
  target: 'calendar-button',
  title: 'Calendari litúrgic',
  text: 'És aquí, a dalt a l’esquerra. Hi trobaràs tot l’any, cada dia amb el color del seu temps i la seva celebració.',
};

// How to put one there by hand, in the words of each system: iOS 17 has «+», later ones «Edita».
// On Android, a button does it when the launcher lets it.
function widgetsStep({ platform, canPin }: TourWidgets): TourStep {
  const pins = platform === 'android' && canPin;
  return {
    id: 'widgets',
    route: 'Home',
    target: null,
    title: 'A la pantalla d’inici',
    text: 'Pots tenir la CPL a la pantalla d’inici del mòbil, amb l’hora que toca resar. Un toc i s’obre.',
    illustration: 'widget',
    ...(pins
      ? { action: { label: 'Posa-la a l’inici', does: 'pin-widget' as const } }
      : {
          detail:
            platform === 'ios'
              ? 'Mantén premut un espai buit de la pantalla d’inici, toca «Edita» o «+» i busca la CPL.'
              : 'Mantén premut un espai buit de la pantalla d’inici, toca «Widgets» i busca la CPL.',
        }),
  };
}

const ITEMS: Record<string, { icon: TourItemIcon; label: string }> = {
  listen: { icon: 'headphones', label: 'Escoltar la pregària' },
  calendar: { icon: 'calendar', label: 'El calendari litúrgic' },
  widgets: { icon: 'widget', label: 'La CPL a la pantalla d’inici' },
};

const HOW_MANY = ['', 'una', 'dues', 'tres'];

// The first card says what is coming and how long it is
function intro(steps: TourStep[]): TourStep {
  const n = steps.length;
  return {
    id: 'intro',
    route: 'Home',
    target: null,
    title: 'Novetats',
    text:
      n === 1
        ? 'Hi ha una cosa nova a l’app. Te l’ensenyem?'
        : `Hi ha ${HOW_MANY[n]} coses noves a l’app. Te les ensenyem? Són ${n === 2 ? 'dos' : HOW_MANY[n]} passos.`,
    items: steps.map((step) => ITEMS[step.id]),
  };
}

export const FOOTNOTE = 'Pots tornar a veure aquestes novetats a Configuració.';

// Without the voice, nothing about listening; without widgets (the web, the tests), nothing about
// them. The last step says where to see it again.
export function tourSteps({ audio, widgets = null }: { audio: boolean; widgets?: TourWidgets | null }): TourStep[] {
  const steps = [audio ? LISTEN : null, CALENDAR, widgets ? widgetsStep(widgets) : null].filter(
    (step): step is TourStep => step !== null,
  );
  const last = { ...steps[steps.length - 1], footnote: FOOTNOTE };
  return [intro(steps), ...steps.slice(0, -1), last];
}

// The headphones, the first time an hour is opened after the tour: touching them through the hole
// starts the prayer, as always, and ends it
export const LISTEN_HINT: TourStep = {
  id: 'listen-hint',
  route: null,
  target: 'listen-button',
  isNew: true,
  text: 'Toca els auriculars i l’app et llegirà la pregària en veu alta.',
  endsWhen: 'listen-opened',
};

// What the bubble of a step says on its buttons, and how far it is. Alone, a step is a hint.
export function tourButtons(index: number, count: number) {
  if (count === 1) return { primary: 'D’acord', secondary: null, progress: null };
  const first = index === 0;
  const last = index === count - 1;
  return {
    primary: first ? 'Som-hi' : last ? 'Fet' : 'Següent',
    // The last one only closes
    secondary: first ? 'Ara no' : last ? null : 'Surt',
    progress: first ? null : { at: index, of: count - 1 },
  };
}
