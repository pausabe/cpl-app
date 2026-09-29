import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import * as Logger from '../utils/logger';
import * as StorageService from './storage/storageService';
import StorageKeys from './storage/storageKeys';
import { APP_KEY, IS_TEST_BUILD, appVersion, callApi, phonePlatform } from './cplApi';

// A newer app in the store. The code only reaches the phones through the stores, and whoever does
// not update stays with the old one for good: the app asks cpl-api once a day which version its
// store already offers and, if it is newer than this one, the home says so with a quiet notice that
// opens the store. The version is set by hand in the publishing website once it is really there,
// so the notice never takes anybody to a store with nothing new in it.
//
// Put away, it does not come back for that version: only a newer one brings it back.

const STORE_PAGES = {
  ios: 'https://apps.apple.com/app/id1283136025',
  android: 'market://details?id=cpl.cpl',
};
// A phone with no Play Store app still has a browser
const ANDROID_STORE_ON_THE_WEB = 'https://play.google.com/store/apps/details?id=cpl.cpl';

export type AppCheckResult = 'no-key' | 'test-build' | 'no-store' | 'too-soon' | 'checked' | 'failed';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Negative when a is older than b. Part by part: 9.10.0 is newer than 9.9.0
export function compareVersions(a: string, b: string): number {
  const [first, second] = [a, b].map((version) => version.split('.').map(Number));
  for (let part = 0; part < 3; part++) {
    if (first[part] !== second[part]) return first[part] - second[part];
  }
  return 0;
}

// Whoever shows the notice is told when the answer arrives: the check runs at the opening, when
// the home is already drawn
const listeners = new Set<() => void>();

export async function checkForNewApp(): Promise<AppCheckResult> {
  if (!APP_KEY) {
    return 'no-key';
  }
  // A copy built to be tried out never shows it: it would get into the screenshots of the stores
  if (IS_TEST_BUILD) {
    return 'test-build';
  }
  const platform = phonePlatform();
  if (!platform) {
    return 'no-store';
  }
  if ((await StorageService.getData(StorageKeys.AppCheckDay, '')) === today()) {
    return 'too-soon';
  }

  try {
    const response = await callApi(`/v1/app/latest?platform=${platform}`);
    if (response.status !== 204 && !response.ok) {
      throw new Error(`The server answered ${response.status}`);
    }
    // 204 is nothing to say, and it also puts away what was said before
    const inStore =
      response.status === 204 ? '' : String(((await response.json()) as { version?: string }).version ?? '');
    await StorageService.storeData(StorageKeys.AppInStore, inStore);
    await StorageService.storeData(StorageKeys.AppCheckDay, today());
    listeners.forEach((listener) => listener());
    return 'checked';
  } catch (error) {
    // Nothing is lost: it asks again at the next opening
    Logger.logError(Logger.LogKeys.AppUpdateService, 'checkForNewApp', error as Error);
    return 'failed';
  }
}

// The version to tell about, or null: none known, not newer than this one, or already put away
export async function newerAppInStore(): Promise<string | null> {
  const inStore = String(await StorageService.getData(StorageKeys.AppInStore, ''));
  const mine = appVersion();
  if (!inStore || !mine || !/^\d+\.\d+\.\d+$/.test(inStore) || compareVersions(inStore, mine) <= 0) {
    return null;
  }
  const dismissed = String(await StorageService.getData(StorageKeys.AppUpdateDismissed, ''));
  return dismissed === inStore ? null : inStore;
}

export async function dismissAppUpdate(version: string): Promise<void> {
  await StorageService.storeData(StorageKeys.AppUpdateDismissed, version);
}

export async function openStore(): Promise<void> {
  const platform = phonePlatform();
  if (!platform) return;
  try {
    await Linking.openURL(STORE_PAGES[platform]);
  } catch (error) {
    if (platform === 'android') {
      await Linking.openURL(ANDROID_STORE_ON_THE_WEB).catch(() => undefined);
    } else {
      Logger.logError(Logger.LogKeys.AppUpdateService, 'openStore', error as Error);
    }
  }
}

export interface AppUpdateNotice {
  open: () => void;
  dismiss: () => void;
}

// For the home: the notice while there is a newer app to tell about, and null otherwise
export function useAppUpdateNotice(): AppUpdateNotice | null {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      newerAppInStore().then((newer) => {
        if (mounted) setVersion(newer);
      });
    };
    refresh();
    listeners.add(refresh);
    return () => {
      mounted = false;
      listeners.delete(refresh);
    };
  }, []);

  if (!version) {
    return null;
  }
  return {
    open: () => {
      openStore();
    },
    dismiss: () => {
      setVersion(null);
      dismissAppUpdate(version);
    },
  };
}
