import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// What is new in Configuració says «Nou» next to it until it is touched: the diocese found with the
// location, the Gospel at Lauds and the audio of the day, which the tour of what is new leaves out
// (Pau, 9 October 2026).

export type NewThing = 'location' | 'laudes-gospel' | 'day-audio';
export const NEW_THINGS: NewThing[] = ['location', 'laudes-gospel', 'day-audio'];

export const newSeenKey = (thing: NewThing) => `newSeen_${thing}`;

export function useNewBadges() {
  // Nothing says «Nou» until it is known what has been touched
  const [fresh, setFresh] = useState<ReadonlySet<NewThing>>(new Set());
  useEffect(() => {
    let alive = true;
    AsyncStorage.multiGet(NEW_THINGS.map(newSeenKey))
      .then((pairs) => {
        if (alive) setFresh(new Set(NEW_THINGS.filter((_, i) => !pairs[i][1])));
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
