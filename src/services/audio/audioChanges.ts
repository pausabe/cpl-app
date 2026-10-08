import AsyncStorage from '@react-native-async-storage/async-storage';
import { callApi } from '../cplApi';
import type { PieceStore } from './pieceStore';

// Pieces remade with another sound: the words are the same (and so is the name of the piece), but
// they are said better now (a word with its stress put right, «part.» no longer read as an
// abbreviation). cpl-api counts every batch as a new version and says which pieces changed since
// the one the phone last saw; the phone lets go of those it has and downloads them again when they
// are needed. With too many changes, it lets go of everything, which is simpler.
const VERSION_KEY = 'audioVersion';

async function seenVersion(): Promise<number> {
  try {
    return Number(await AsyncStorage.getItem(VERSION_KEY)) || 0;
  } catch {
    return 0;
  }
}

export async function forgetChangedPieces(version: number, store: PieceStore): Promise<void> {
  const seen = await seenVersion();
  if (version <= seen) return;
  // Nothing kept, nothing to let go of
  if (store.bytes() > 0) {
    let body: { version?: unknown; keys?: unknown; all?: unknown };
    try {
      const response = await callApi(`/v1/audio/changes?since=${seen}`);
      if (!response.ok) return;
      body = await response.json();
    } catch {
      // Next time
      return;
    }
    if (body.all === true) store.clear();
    else if (Array.isArray(body.keys)) store.forget(body.keys.filter((k): k is string => typeof k === 'string'));
    else return;
  }
  try {
    await AsyncStorage.setItem(VERSION_KEY, String(version));
  } catch {
    // It will ask again
  }
}
