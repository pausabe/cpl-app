import * as Location from 'expo-location';
import * as Logger from '../utils/logger';

// Asking the phone where it is, once, with everything that can go wrong turned into an answer
// instead of an exception. Nothing else in the app talks to expo-location.
//
// The accuracy asked for is the coarsest that still tells dioceses apart, about a kilometre: it
// costs little battery and does not need a precise fix. What comes back carries its own margin of
// error, and dioceseLocationService is what decides whether that margin is small enough to name a
// diocese at all.

export type DevicePosition =
  | { kind: 'position'; latitude: number; longitude: number; accuracyMeters: number }
  | { kind: 'denied' }
  | { kind: 'failed' };

// A fix can take a few seconds indoors, and it can also never arrive.
const TIMEOUT_MILLISECONDS = 15000;

function givingUpAfterTheTimeout<T>(promise: Promise<T>): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), TIMEOUT_MILLISECONDS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Where the phone is, asking for the permission if it has not been asked yet.
 *
 * It never throws: no permission is 'denied', and anything else that goes wrong, including the
 * fix never arriving and the location services being switched off, is 'failed'.
 */
export async function currentPosition(): Promise<DevicePosition> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { kind: 'denied' };
    }
    const position = await givingUpAfterTheTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
    );
    if (!position) {
      return { kind: 'failed' };
    }
    return {
      kind: 'position',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      // Android can leave it out; without it the position is taken at face value, which is what
      // the resolver does with a margin of zero.
      accuracyMeters: position.coords.accuracy ?? 0,
    };
  } catch (error) {
    Logger.logError(Logger.LogKeys.DeviceLocationService, 'currentPosition', error as Error);
    return { kind: 'failed' };
  }
}
