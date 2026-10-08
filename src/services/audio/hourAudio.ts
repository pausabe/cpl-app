import { File, Paths } from 'expo-file-system';
import { joinHour } from './mp3';
import type { PieceStore } from './pieceStore';
import {
  AudioLimitError,
  AudioNetworkError,
  PIECES_PER_REQUEST,
  fetchPieces as defaultFetchPieces,
  type WantedPiece,
} from './pieceClient';

// Getting an hour ready to be heard: the pieces the phone does not have yet are downloaded, a few
// requests at a time, and the hour is joined into one MP3 with the pieces that are here, in order,
// so that it can start while the rest arrives (a slow network) and play with none at all (an hour
// heard before).

export interface ScriptPiece extends WantedPiece {
  pause: number;
}

export interface Download {
  // The pieces that are not on cpl-api and could not be made on the spot
  missing: string[];
  // cpl-api said it has reached a limit, or the network was not there
  limited: boolean;
  offline: boolean;
}

const RETRIES = 2;

export async function downloadPieces(
  pieces: ScriptPiece[],
  store: PieceStore,
  {
    onProgress,
    signal,
    fetchPieces = defaultFetchPieces,
  }: {
    onProgress?: (done: number, total: number) => void;
    signal?: AbortSignal;
    fetchPieces?: typeof defaultFetchPieces;
  } = {},
): Promise<Download> {
  const wanted = new Map<string, WantedPiece>();
  for (const p of pieces) if (!store.has(p.key) && !wanted.has(p.key)) wanted.set(p.key, p);
  const keep = new Set(pieces.map((p) => p.key));
  const todo = [...wanted.values()];
  const result: Download = { missing: [], limited: false, offline: false };
  let done = 0;
  onProgress?.(0, todo.length);
  // In the order they are said, so that the beginning is here first
  for (let at = 0; at < todo.length && !signal?.aborted; at += PIECES_PER_REQUEST) {
    const batch = todo.slice(at, at + PIECES_PER_REQUEST).map(({ key, voice, text }) => ({ key, voice, text }));
    for (let attempt = 0; ; attempt++) {
      try {
        const { found, missing } = await fetchPieces(batch, signal);
        for (const [key, bytes] of found) store.write(key, bytes, keep);
        result.missing.push(...missing);
        break;
      } catch (error) {
        if (error instanceof AudioLimitError) {
          result.limited = true;
          return result;
        }
        if (signal?.aborted) return result;
        if (attempt >= RETRIES || !(error instanceof AudioNetworkError)) {
          result.offline = true;
          return result;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
    done += batch.length;
    onProgress?.(done, todo.length);
  }
  return result;
}

// How many pieces from the start are already on the phone
export function readyFromStart(pieces: ScriptPiece[], store: PieceStore): number {
  let n = 0;
  while (n < pieces.length && store.has(pieces[n].key)) n++;
  return n;
}

export interface HourFile {
  uri: string;
  // Where each piece starts, in seconds, and how long the file lasts
  starts: number[];
  seconds: number;
  // How many pieces of the hour are in it, from the start
  count: number;
}

let generation = 0;

// The first `count` pieces joined, with their silences, in a file of the cache
export async function writeHourFile(pieces: ScriptPiece[], count: number, store: PieceStore): Promise<HourFile> {
  const parts = [];
  for (const piece of pieces.slice(0, count)) {
    const audio = await store.read(piece.key);
    if (!audio) break;
    parts.push({ audio, pause: piece.pause });
  }
  const joined = joinHour(parts);
  // A new name each time: the player keeps the file it was given open
  const file = new File(Paths.cache, `hour-${Date.now()}-${generation++}.mp3`);
  file.write(joined.bytes);
  store.touch(pieces.slice(0, parts.length).map((p) => p.key));
  return { uri: file.uri, starts: joined.starts, seconds: joined.seconds, count: parts.length };
}

// The files of hours played before, which nobody needs any more
export function forgetHourFile(uri: string | null) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Already gone
  }
}
