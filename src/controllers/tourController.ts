import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_TEST_BUILD } from '../services/cplApi';
import { TOUR_VERSION, tourSteps, type TourRoute, type TourStep } from '../view-models/tour';
import { navigationRef } from './navigationRef';
import * as Listen from './listenController';
import { canPinWidget, hasWidgets } from '../services/widgetService';

// The tour of what is new (view-models/tour): which step it is on, and what makes it go on. A step
// that says «toca'l» goes on when the app gets to the screen it opens or when the voice starts; one
// that says «Següent», with the button; and when the next one is on another screen the app can go
// to by itself (the home, Configuració), it goes there. It is shown once per version of the tour,
// when the home has nothing else to say; Configuració can show it again.
//
// The headphones, while it is on, open the player paused: nothing is heard unless ▶ is touched, and
// the player it opened goes away with it (Pau did not want Lauds left playing, 9 October 2026).

export interface TourState {
  steps: TourStep[];
  index: number;
}

const SEEN_KEY = `tourSeen_${TOUR_VERSION}`;

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

export const holdsListening = () => state !== null;

export function currentRoute(): string | null {
  try {
    return navigationRef.isReady() ? (navigationRef.getCurrentRoute()?.name ?? null) : null;
  } catch {
    return null;
  }
}

// The screens the tour can go back to by itself: they need nothing to open
const REACHABLE: TourRoute[] = ['Home', 'Settings', 'Calendar'];

function goTo(step: TourStep) {
  if (!step.route || currentRoute() === step.route || !REACHABLE.includes(step.route)) return;
  try {
    navigationRef.navigate(step.route as never);
  } catch {
    // It waits on the screen it is
  }
}

export function startTour() {
  const widgets = hasWidgets()
    ? { platform: Platform.OS === 'ios' ? ('ios' as const) : ('android' as const), canPin: canPinWidget() }
    : null;
  state = { steps: tourSteps({ audio: Listen.getListenAvailability().enabled, widgets }), index: 0 };
  changed();
}

// The home, with nothing else to say: once per version, never in the tests or the copies built to
// be tried out (Maestro, the captures), where it would cover everything
export async function maybeStartTour() {
  if (state || IS_TEST_BUILD || (globalThis as { __CPL_NO_TOUR__?: boolean }).__CPL_NO_TOUR__) return;
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

export function finishTour() {
  if (!state) return;
  state = null;
  changed();
  if (Listen.isHeld()) Listen.stop();
  AsyncStorage.setItem(SEEN_KEY, 'true').catch(() => undefined);
}

export function nextStep() {
  if (!state) return;
  if (state.index >= state.steps.length - 1) {
    finishTour();
    return;
  }
  state = { ...state, index: state.index + 1 };
  changed();
  const step = currentStep();
  if (step) goTo(step);
}

// --- What makes a step go on by itself ------------------------------------------------------------

function onRoute() {
  const step = currentStep();
  if (step && typeof step.advance === 'object' && 'route' in step.advance && step.advance.route === currentRoute()) {
    nextStep();
  }
}

function onListen() {
  const step = currentStep();
  if (
    step &&
    typeof step.advance === 'object' &&
    'event' in step.advance &&
    step.advance.event === 'listen-opened' &&
    Listen.getListenState().phase !== 'idle'
  ) {
    nextStep();
  }
}

let wired = false;
export function wireTour(): () => void {
  if (wired) return () => undefined;
  wired = true;
  const offListen = Listen.subscribeListen(onListen);
  const offRoute = navigationRef.addListener('state', onRoute);
  return () => {
    wired = false;
    offListen();
    offRoute();
  };
}

// For tests
export function resetTour() {
  state = null;
}
