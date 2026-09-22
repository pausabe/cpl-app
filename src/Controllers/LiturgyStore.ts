import { useSyncExternalStore } from 'react';
import * as DataService from '../Services/DataService';
import { Settings } from '../Models/Settings';
import DatabaseInformation from '../Models/DatabaseInformation';
import LiturgyDayInformation from '../Models/LiturgyDayInformation';
import CelebrationInformation from '../Models/HoursLiturgy/CelebrationInformation';
import HoursLiturgy from '../Models/HoursLiturgy/HoursLiturgy';
import MassLiturgy from '../Models/MassLiturgy';

// The seam between the screens and the rest of the app.
//
// DataService keeps the day's data in module variables and replaces them on every reload.
// This is the only place on the side of the screens that reads them: the controllers take a
// snapshot from here and hand plain props to the views, and they hear from here when the data
// or the settings change. Replacing where the data comes from means changing this file, not
// the screens.

export interface LiturgySnapshot {
  // Grows on every change, so that a screen can tell two snapshots apart
  revision: number;
  settings: Settings;
  database: DatabaseInformation;
  day: LiturgyDayInformation;
  celebration: CelebrationInformation;
  hours: HoursLiturgy;
  mass: MassLiturgy;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let revision = 0;
let snapshot: LiturgySnapshot = take();

function take(): LiturgySnapshot {
  return {
    revision,
    settings: DataService.CurrentSettings,
    database: DataService.CurrentDatabaseInformation,
    day: DataService.CurrentLiturgyDayInformation,
    celebration: DataService.CurrentCelebrationInformation,
    hours: DataService.CurrentHoursLiturgy,
    mass: DataService.CurrentMassLiturgy,
  };
}

export function getSnapshot(): LiturgySnapshot {
  return snapshot;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Tells every screen that something changed: after a reload, or after a setting was changed
// in place (the text size, the dark mode).
export function publish(): void {
  revision++;
  snapshot = take();
  listeners.forEach((listener) => listener());
}

// Loads the liturgy of a day, with the saved settings, and tells the screens.
//
// One reload at a time: each one opens the database again, and two at once (two settings
// changed one after the other) make the second one fail halfway with the database closed
// under it, which used to leave the home blank. A reload asked for while another is running
// waits for it.
let queue: Promise<unknown> = Promise.resolve();

export function reload(date: Date, databaseAsset?: unknown): Promise<void> {
  const run = queue.then(async () => {
    await DataService.ReloadAllData(date, databaseAsset as any);
    publish();
  });
  // The next one waits for this one whether it worked or not
  queue = run.catch(() => undefined);
  return run;
}

// The day being shown: the one to reload after a setting changes.
export function currentDate(): Date {
  return DataService.CurrentLiturgyDayInformation.Today.Date;
}

// When the data was last loaded: coming back to the app on another day loads today's.
export function lastRefreshDate(): Date {
  return DataService.LastRefreshDate;
}

// Changes some settings of the loaded data without reloading it: they only change how the
// texts look, not which texts. The caller saves them with SettingsService.
export function updateSettings(changes: Partial<Settings>, notify = true): void {
  Object.assign(DataService.CurrentSettings, changes);
  if (notify) publish();
}

export function isLoaded(): boolean {
  return DataService.CurrentLiturgyDayInformation.Today.Date !== undefined;
}

export function useLiturgy(): LiturgySnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// What the theme needs: the dark mode and the text size of the prayer
export function useAppearance(): { dark: boolean; textSize: unknown } {
  const { settings } = useLiturgy();
  return { dark: settings.DarkModeEnabled === true, textSize: settings.TextSize };
}
