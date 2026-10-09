import { API_URL, APP_KEY, APP_KEY_HEADER } from '../cplApi';

// Asks cpl-api for pieces of audio, up to 30 at once, and reads its answer: every piece one after
// the other, each with its name, whether it is there and its MP3 (cpl-cloud, src/shared/audio.ts).
// The voice and the words go with each name, so that a piece that is not there yet is made on the
// spot. A piece that is still not there comes back as missing. A day downloaded beforehand
// (dayAudio) asks by name only.
export const PIECES_PER_REQUEST = 30;
// An answer is up to a couple of MB: on a slow network it takes more than the usual 15 seconds
const REQUEST_TIMEOUT = 45000;

export interface WantedPiece {
  key: string;
  voice?: string;
  text?: string;
}

export interface FetchedPieces {
  found: Map<string, Uint8Array>;
  missing: string[];
}

// cpl-api has reached one of its limits for today or this month: nothing is paid for, and the
// headphones say it cannot be heard now
export class AudioLimitError extends Error {}
// No network, or a network too slow to answer
export class AudioNetworkError extends Error {}

export function unpackPieces(buffer: ArrayBuffer): FetchedPieces {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const text = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length < 7 || text(0, 4) !== 'CPLA' || bytes[4] !== 1) throw new Error('not a pack of pieces');
  const count = view.getUint16(5);
  const found = new Map<string, Uint8Array>();
  const missing: string[] = [];
  let at = 7;
  for (let i = 0; i < count; i++) {
    const key = text(at, at + 24);
    const present = bytes[at + 24] === 1;
    const length = view.getUint32(at + 25);
    at += 29;
    if (present) found.set(key, bytes.slice(at, at + length));
    else missing.push(key);
    at += length;
  }
  return { found, missing };
}

export async function fetchPieces(pieces: WantedPiece[], signal?: AbortSignal): Promise<FetchedPieces> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/v1/audio/pieces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [APP_KEY_HEADER]: APP_KEY },
      body: JSON.stringify({ pieces }),
      signal: controller.signal,
    });
    if (response.status === 429) throw new AudioLimitError('cpl-api limit');
    if (!response.ok) throw new AudioNetworkError(`cpl-api ${response.status}`);
    return unpackPieces(await response.arrayBuffer());
  } catch (error) {
    if (error instanceof AudioLimitError || error instanceof AudioNetworkError) throw error;
    throw new AudioNetworkError(String(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
