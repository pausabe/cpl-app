import { useSyncExternalStore } from 'react';
import { downloadPieces } from '../services/audio/hourAudio';
import { AudioLimitError } from '../services/audio/pieceClient';
import { fetchDayPieces, saveDownloadedDay, savedDownloadedDay } from '../services/audio/dayAudio';
import type { DayAudioPhase } from '../view-models/speech/dayAudioLabels';
import { pieceStore } from './listenController';

// Today's audio downloaded from Configuració, to pray with no network: every hour and the Mass
// readings. It goes on if Configuració is left, and Configuració says how it is going or how it went.

// «idle»: not downloaded, or some of it went to make room for other pieces; «partial»: downloaded,
// but cpl-api did not have every piece yet (those, the phone's own voice); «notReady»: cpl-api does
// not know that day's pieces yet
export type { DayAudioPhase };

export interface DayAudioState {
  day: string | null;
  phase: DayAudioPhase;
  // 0 to 1, while it downloads
  progress: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let state: DayAudioState = { day: null, phase: 'idle', progress: 0 };
let running: Promise<void> | null = null;

function set(changes: Partial<DayAudioState>) {
  state = { ...state, ...changes };
  listeners.forEach((listener) => listener());
}

export const getDayAudio = () => state;
export function subscribeDayAudio(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const useDayAudio = () => useSyncExternalStore(subscribeDayAudio, getDayAudio, getDayAudio);

// Whether that day is already on the phone, when Configuració opens
export async function checkDayAudio(day: string): Promise<void> {
  if (running && state.day === day) return;
  const saved = await savedDownloadedDay();
  const here = saved?.day === day && saved.keys.length > 0 && saved.keys.every((k) => pieceStore().has(k));
  if (running) return;
  set({ day, phase: here ? (saved?.partial ? 'partial' : 'done') : 'idle', progress: here ? 1 : 0 });
}

export function downloadDayAudio(day: string): Promise<void> {
  if (running) return running;
  running = (async () => {
    set({ day, phase: 'downloading', progress: 0 });
    let keys: string[] | null;
    try {
      keys = await fetchDayPieces(day);
    } catch (error) {
      set({ phase: error instanceof AudioLimitError ? 'limited' : 'offline' });
      return;
    }
    if (!keys?.length) {
      set({ phase: 'notReady' });
      return;
    }
    const download = await downloadPieces(
      keys.map((key) => ({ key })),
      pieceStore(),
      { onProgress: (done, total) => set({ progress: total ? done / total : 1 }) },
    );
    if (download.noSpace) return set({ phase: 'noSpace' });
    if (download.limited) return set({ phase: 'limited' });
    if (download.offline) return set({ phase: 'offline' });
    const missing = new Set(download.missing);
    const partial = missing.size > 0;
    await saveDownloadedDay({ day, keys: keys.filter((k) => !missing.has(k)), partial });
    set({ phase: partial ? 'partial' : 'done', progress: 1 });
  })().finally(() => {
    running = null;
  });
  return running;
}

// For tests
export function resetDayAudio() {
  state = { day: null, phase: 'idle', progress: 0 };
  running = null;
}
