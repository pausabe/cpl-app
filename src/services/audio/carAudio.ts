import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import type { AudioPlayer } from 'expo-audio';

// The media session of the app on Android (modules/cpl-car): what Android Auto, the lock screen,
// the notification and the buttons of headphones and steering wheels talk to. It plays with the app's
// own player; the app tells it what is being said and what the car can choose, and it tells the app
// what the car asks for. On iOS (and in the tests) there is none: expo-audio does the lock screen and
// CarPlay by itself.

export interface CarEvents {
  // ⏮ ⏭ in the car, on the lock screen, the notification or a steering wheel
  onCarCommand: { type: 'next' | 'previous' };
  // An hour chosen in the car («2026-10-09|Laudes»), or «continue»
  onCarPlay: { id: string };
  // Android Auto has just opened the app
  onCarConnected: Record<string, never>;
}

interface CarNativeModule {
  ready(): void;
  attach(player: AudioPlayer, title: string, artist: string, artwork: string | null): Promise<void>;
  update(title: string, artist: string, artwork: string | null): Promise<void>;
  detach(): Promise<void>;
  setCatalog(json: string): Promise<void>;
  carWasUsed(): boolean;
  addListener<E extends keyof CarEvents>(event: E, listener: (body: CarEvents[E]) => void): { remove(): void };
}

const native: CarNativeModule | null =
  Platform.OS === 'android' ? requireOptionalNativeModule<CarNativeModule>('CplCar') : null;

export const hasCarSession = (): boolean => native !== null;

export function onCar<E extends keyof CarEvents>(event: E, listener: (body: CarEvents[E]) => void): () => void {
  if (!native) return () => undefined;
  const subscription = native.addListener(event, listener);
  return () => subscription.remove();
}

// Listening: what the car asked while the app was starting comes now
export function carReady(): void {
  native?.ready();
}

export function attachToCar(player: AudioPlayer, title: string, artist: string, artwork: string | null): void {
  native?.attach(player, title, artist, artwork).catch(() => undefined);
}

export function updateCar(title: string, artist: string, artwork: string | null): void {
  native?.update(title, artist, artwork).catch(() => undefined);
}

export function detachFromCar(): void {
  native?.detach().catch(() => undefined);
}

export interface CarCatalogEntry {
  id: string;
  title: string;
  subtitle: string;
}

export function setCarCatalog(day: string, items: CarCatalogEntry[], current: CarCatalogEntry | null): void {
  native?.setCatalog(JSON.stringify({ day, items, current })).catch(() => undefined);
}

export function carWasUsed(): boolean {
  try {
    return native?.carWasUsed() ?? false;
  } catch {
    return false;
  }
}
