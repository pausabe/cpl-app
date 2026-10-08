import { useSyncExternalStore } from 'react';
import type { SpeechParagraph } from '../view-models/speech/paragraph';

// The paragraphs of the prayer that is on the screen, for the voice to read.
//
// PrayerFlow hands them to the sink its screen gives it (components/SpeechSink), and the screen keeps them
// here, with the name of the hour («Laudes», «Missa»…). The player reads them from here, and so
// does the audio generator when it opens every hour of every day. When the screen changes what it
// shows (the invitatory opened, another Marian antiphon, «Continua amb…»), the paragraphs change
// with it, and so does what is read.
export interface ScreenSpeech {
  hour: string;
  paragraphs: SpeechParagraph[];
  // What it is made of, to tell two of them apart without comparing every run
  signature: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let current: ScreenSpeech | null = null;

export function getScreenSpeech(): ScreenSpeech | null {
  return current;
}

// Kept only when it changed: PrayerFlow calls it on every drawing, and telling the player each
// time would draw everything again for nothing
export function setScreenSpeech(hour: string, paragraphs: SpeechParagraph[]): void {
  const signature = `${hour}\n${JSON.stringify(paragraphs)}`;
  if (current && current.signature === signature) return;
  current = { hour, paragraphs, signature };
  listeners.forEach((listener) => listener());
}

// The screen was closed
export function clearScreenSpeech(hour: string): void {
  if (!current || current.hour !== hour) return;
  current = null;
  listeners.forEach((listener) => listener());
}

export function subscribeScreenSpeech(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useScreenSpeech(): ScreenSpeech | null {
  return useSyncExternalStore(subscribeScreenSpeech, getScreenSpeech, getScreenSpeech);
}
