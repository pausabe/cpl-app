import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_TEST_BUILD } from '../services/cplApi';
import { LISTEN_HINT, TOUR_VERSION, tourSteps, type TourRoute, type TourStep } from '../view-models/tour';
import { navigationRef } from './navigationRef';
import * as Listen from './listenController';
import { canPinWidget, hasWidgets } from '../services/widgetService';

// The tour of what is new (view-models/tour): which step it is on. It goes on with the buttons of
// the bubble, and stays on the home. It is shown once per version of the tour, when the home has
// nothing else to say; Configuració can show it again.
//
// Whoever goes into it («Som-hi») is told to open an hour and touch the headphones: the first hour
// they open, the headphones are pointed at, once. Whoever says «Ara no» is left alone (Pau, 9
// October 2026). The hint is a tour of one step, drawn the same way.

export interface TourState {
  steps: TourStep[];
  index: number;
  // What is saved when it ends, so that it does not come back
  done: [key: string, value: string];
}

const SEEN_KEY = `tourSeen_${TOUR_VERSION}`;
// «pending» from «Som-hi» until it has been shown, then «done»
const LISTEN_HINT_KEY = `listenHint_${TOUR_VERSION}`;

type Listener = () => void;
const listeners = new Set<Listener>();
let state: TourState | null = null;

function changed() {
  listeners.forEach((listener) => listener());
}

export const getTour = () => state;
export function subscribeTour(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const useTour = () => useSyncExternalStore(subscribeTour, getTour, getTour);

export const currentStep = (): TourStep | null => (state ? state.steps[state.index] : null);

export function currentRoute(): string | null {
  try {
    return navigationRef.isReady() ? (navigationRef.getCurrentRoute()?.name ?? null) : null;
  } catch {
    return null;
  }
}

// To a screen of the stack it goes back, closing what is over it: a plain navigate opens a second
// home over the calendar (React Navigation 7), and back then went through every screen again (Pau,
// 9 October 2026)
export function backTo(route: TourRoute) {
  navigationRef.navigate(route, undefined, { pop: true });
}

// Never in the tests or the copies built to be tried out (Maestro, the captures), where it would
// cover everything
const quiet = () => IS_TEST_BUILD || (globalThis as { __CPL_NO_TOUR__?: boolean }).__CPL_NO_TOUR__;

export function startTour() {
  const widgets = hasWidgets()
    ? { platform: Platform.OS === 'ios' ? ('ios' as const) : ('android' as const), canPin: canPinWidget() }
    : null;
  state = {
    steps: tourSteps({ audio: Listen.getListenAvailability().enabled, widgets }),
    index: 0,
    done: [SEEN_KEY, 'true'],
  };
  changed();
}

// The home, with nothing else to say: once per version
export async function maybeStartTour() {
  if (state || quiet()) return;
  // Only from the home: a widget may have opened an hour over it at once
  const route = currentRoute();
  if (route && route !== 'Home') return;
  try {
    if (await AsyncStorage.getItem(SEEN_KEY)) return;
  } catch {
    return;
  }
  startTour();
}

// An hour opened: the headphones, if the tour told about them and they have not been shown yet
export async function maybeShowListenHint() {
  if (state || quiet() || !Listen.getListenAvailability().enabled) return;
  try {
    if ((await AsyncStorage.getItem(LISTEN_HINT_KEY)) !== 'pending') return;
  } catch {
    return;
  }
  if (state) return;
  // Already listening: it knows
  if (Listen.getListenState().phase !== 'idle') {
    AsyncStorage.setItem(LISTEN_HINT_KEY, 'done').catch(() => undefined);
    return;
  }
  state = { steps: [LISTEN_HINT], index: 0, done: [LISTEN_HINT_KEY, 'done'] };
  changed();
}

async function listenHintPending() {
  try {
    if ((await AsyncStorage.getItem(LISTEN_HINT_KEY)) === 'done') return;
    await AsyncStorage.setItem(LISTEN_HINT_KEY, 'pending');
  } catch {
    // Without it, no hint
  }
}

export function finishTour() {
  if (!state) return;
  const [key, value] = state.done;
  state = null;
  changed();
  AsyncStorage.setItem(key, value).catch(() => undefined);
}

export function nextStep() {
  if (!state) return;
  // «Som-hi»: the step about listening is coming, and with it the hint
  if (state.index === 0 && state.steps.some((step) => step.id === 'listen')) listenHintPending();
  if (state.index >= state.steps.length - 1) {
    finishTour();
    return;
  }
  state = { ...state, index: state.index + 1 };
  changed();
}

// The headphones touched through the hole: the prayer starts, and the hint goes
function onListen() {
  const step = currentStep();
  if (step?.endsWhen === 'listen-opened' && Listen.getListenState().phase !== 'idle') nextStep();
}

let wired = false;
export function wireTour(): () => void {
  if (wired) return () => undefined;
  wired = true;
  const offListen = Listen.subscribeListen(onListen);
  return () => {
    wired = false;
    offListen();
  };
}

// For tests
export function resetTour() {
  state = null;
}
