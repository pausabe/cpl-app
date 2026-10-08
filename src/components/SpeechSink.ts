import { createContext } from 'react';
import type { SpeechParagraph } from '../view-models/speech/paragraph';

// Where a prayer screen wants the paragraphs of its PrayerFlow, for the voice to read them
// (controllers/speechStore.ts). Without one, PrayerFlow keeps nothing.
export type SpeechSinkFn = (paragraphs: SpeechParagraph[]) => void;

export const SpeechSink = createContext<SpeechSinkFn | null>(null);
