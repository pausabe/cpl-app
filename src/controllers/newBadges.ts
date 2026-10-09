import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoApplication from 'expo-application';

// What is new in Configuració says «Nou» next to it until it is touched: the diocese found with the
// location, the Gospel at Lauds and the audio of the day, which the tour of what is new leaves out
// (Pau, 9 October 2026). What is never touched stops being new two weeks after it was first seen
// there; counted from the first sight, so that nobody loses it without having seen it, and however
// many versions come out in between.
//
// Nothing is new to whoever got the app less than two weeks before: to them everything is. The
// phone knows when the app was installed, not counting the updates.

export type NewThing = 'location' | 'laudes-gospel' | 'day-audio';
export const NEW_THINGS: NewThing[] = ['location', 'laudes-gospel', 'day-audio'];

// Per thing: when Configuració first showed it, or SEEN once it has been touched or is not new to
// whoever has the app. Each thing counts its own two weeks, so the next new one starts afresh.
export const newSeenKey = (thing: NewThing) => `newSeen_${thing}`;
export const SEEN = 'true';
export const NEW_FOR_MS = 14 * 24 * 60 * 60 * 1000;

async function installedRecently(now: number): Promise<boolean> {
  try {
    const installed = await ExpoApplication.getInstallationTimeAsync();
    return now - installed.getTime() < NEW_FOR_MS;
  } catch {
    // Not known: as if they had it before, which is what «Nou» was made for
    return false;
  }
}

async function freshThings(): Promise<NewThing[]> {
  const pairs = await AsyncStorage.multiGet(NEW_THINGS.map(newSeenKey));
  const stored = new Map(NEW_THINGS.map((thing, i) => [thing, pairs[i][1]]));
  const now = Date.now();
  const firstSight = NEW_THINGS.filter((thing) => !stored.get(thing));
  if (firstSight.length > 0) {
    const value = (await installedRecently(now)) ? SEEN : String(now);
    firstSight.forEach((thing) => stored.set(thing, value));
    AsyncStorage.multiSet(firstSight.map((thing) => [newSeenKey(thing), value])).catch(() => undefined);
  }
  return NEW_THINGS.filter((thing) => {
    const value = stored.get(thing);
    return value !== SEEN && now - Number(value) <= NEW_FOR_MS;
  });
}

export function useNewBadges() {
  // Nothing says «Nou» until it is known what has been touched
  const [fresh, setFresh] = useState<ReadonlySet<NewThing>>(new Set());
  useEffect(() => {
    let alive = true;
    freshThings()
      .then((things) => {
        if (alive) setFresh(new Set(things));
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
    AsyncStorage.setItem(newSeenKey(thing), SEEN).catch(() => undefined);
  }, []);
  const isNew = useCallback((thing: NewThing) => fresh.has(thing), [fresh]);
  return { isNew, seen };
}
