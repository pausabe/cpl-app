import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// What is new in Configuració says «Nou» next to it until it is touched: the diocese found with the
// location, the Gospel at Lauds and the audio of the day, which the tour of what is new leaves out
// (Pau, 9 October 2026). What is never touched stops being new two weeks after it was first seen
// there; counted from the first sight, so that nobody loses it without having seen it.

export type NewThing = 'location' | 'laudes-gospel' | 'day-audio';
export const NEW_THINGS: NewThing[] = ['location', 'laudes-gospel', 'day-audio'];

export const newSeenKey = (thing: NewThing) => `newSeen_${thing}`;
export const NEW_SHOWN_SINCE_KEY = 'newShownSince';
export const NEW_FOR_MS = 14 * 24 * 60 * 60 * 1000;

export function useNewBadges() {
  // Nothing says «Nou» until it is known what has been touched
  const [fresh, setFresh] = useState<ReadonlySet<NewThing>>(new Set());
  useEffect(() => {
    let alive = true;
    AsyncStorage.multiGet([...NEW_THINGS.map(newSeenKey), NEW_SHOWN_SINCE_KEY])
      .then((pairs) => {
        const untouched = NEW_THINGS.filter((_, i) => !pairs[i][1]);
        if (untouched.length === 0) return;
        const since = Number(pairs[NEW_THINGS.length][1]);
        const now = Date.now();
        if (!since) AsyncStorage.setItem(NEW_SHOWN_SINCE_KEY, String(now)).catch(() => undefined);
        else if (now - since > NEW_FOR_MS) return;
        if (alive) setFresh(new Set(untouched));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const seen = useCallback((thing: NewThing) => {
    setFresh((current) => {
      if (!current.has(thing)) return current;
      const next = new Set(current);
      next.delete(thing);
      return next;
    });
    AsyncStorage.setItem(newSeenKey(thing), 'true').catch(() => undefined);
  }, []);
  const isNew = useCallback((thing: NewThing) => fresh.has(thing), [fresh]);
  return { isNew, seen };
}
