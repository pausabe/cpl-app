import AsyncStorage from '@react-native-async-storage/async-storage';
import { callApi } from '../cplApi';
import { AudioLimitError, AudioNetworkError } from './pieceClient';

// A whole day downloaded beforehand, to pray it with no network: cpl-api knows which pieces each day
// needs (every hour, the Mass readings, every diocese), because cpl-app's audio plan tells it
// (.github/workflows/audio.yml). They are downloaded like those of an hour, by name.

const KEY_PATTERN = /^[0-9a-f]{24}$/;
const SAVED_KEY = 'dayAudio';

// The names of the pieces of a day; null if cpl-api does not know that day yet
export async function fetchDayPieces(day: string): Promise<string[] | null> {
  let response: Response;
  try {
    response = await callApi(`/v1/audio/day/${day}`);
  } catch (error) {
    throw new AudioNetworkError(String(error));
  }
  if (response.status === 404) return null;
  if (response.status === 429) throw new AudioLimitError('cpl-api limit');
  if (!response.ok) throw new AudioNetworkError(`cpl-api ${response.status}`);
  const body = (await response.json().catch(() => null)) as { keys?: unknown } | null;
  if (!Array.isArray(body?.keys)) return null;
  return body.keys.filter((k): k is string => typeof k === 'string' && KEY_PATTERN.test(k));
}

// The last day downloaded: which one, which of its pieces came, and whether some were not there yet
export interface DownloadedDay {
  day: string;
  keys: string[];
  partial: boolean;
}

export async function savedDownloadedDay(): Promise<DownloadedDay | null> {
  try {
    const saved = await AsyncStorage.getItem(SAVED_KEY);
    return saved ? (JSON.parse(saved) as DownloadedDay) : null;
  } catch {
    return null;
  }
}

export async function saveDownloadedDay(day: DownloadedDay): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(day));
  } catch {
    // It will offer to download it again, which costs nothing: the pieces are already here
  }
}
