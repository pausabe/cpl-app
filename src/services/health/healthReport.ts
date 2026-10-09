import * as Device from 'expo-device';
import * as Logger from '../../utils/logger';
import * as StorageService from '../storage/storageService';
import StorageKeys from '../storage/storageKeys';
import { APP_KEY, IS_TEST_BUILD, appVersion, callApi, phonePlatform } from '../cplApi';
import { isGooglePlayRobot } from '../googlePlayRobot';
import { openedDatabaseVersion } from '../databaseManagerService';
import { currentIdentifier } from '../usageService';
import { forgetProblems, waitingProblems } from './problems';

// Sends what went wrong (problems.ts) to cpl-api (POST /v1/errors), which groups it into issues for the
// «Salut» tab of the publishing website. It goes when the app opens or comes back (healthMonitor.ts),
// only if there is something to say, never in the way of anything and never throwing.
//
// With it go the versions of the app and of the system, the model of the phone (iPhone 13, Pixel 8) and
// the publication of the database, to understand the error; and the phone's identifier, the one it is
// counted with as a user, only so that cpl-api can count how many phones had each problem and how many
// reports one phone sends a day (it keeps it only as a hash). A phone that has never been counted has
// none, and sends without it.
//
// Like the count of use, a copy built to be tried out and Google Play's robot send nothing: neither is
// a person, and their errors would read as people's.

export const MAX_EVENTS_PER_REPORT = 10;
// After a report that did not get through, the next one waits a while: not at every coming back
const MILLISECONDS_AFTER_A_FAILURE = 15 * 60 * 1000;

export type HealthReportResult =
  'reported' | 'nothing-to-say' | 'no-key' | 'test-build' | 'robot' | 'not-a-phone' | 'too-soon' | 'refused' | 'failed';

let sending: Promise<HealthReportResult> | null = null;

// Only one at a time: the app may open and come back in the same second
export function reportHealth(): Promise<HealthReportResult> {
  if (!sending) {
    sending = send()
      .catch(() => 'failed' as const)
      .finally(() => {
        sending = null;
      });
  }
  return sending;
}

async function send(): Promise<HealthReportResult> {
  if (!APP_KEY) return 'no-key';
  if (IS_TEST_BUILD) return 'test-build';
  if (isGooglePlayRobot()) return 'robot';
  const platform = phonePlatform();
  if (!platform) return 'not-a-phone';
  const problems = (await waitingProblems()).slice(0, MAX_EVENTS_PER_REPORT);
  if (problems.length === 0) return 'nothing-to-say';
  const lastFailure = Number(await StorageService.getData(StorageKeys.HealthLastFailure, '0')) || 0;
  const elapsed = Date.now() - lastFailure;
  if (elapsed >= 0 && elapsed < MILLISECONDS_AFTER_A_FAILURE) return 'too-soon';

  const body: Record<string, unknown> = {
    platform,
    events: problems.map(({ kind, place, name, message, stack, app, count }) => ({
      kind,
      ...(place ? { place } : {}),
      ...(name ? { name } : {}),
      ...(message ? { message } : {}),
      ...(stack ? { stack } : {}),
      ...(app ? { app } : {}),
      count,
    })),
  };
  const app = appVersion();
  if (app) body.app = app;
  if (Device.osVersion) body.os = String(Device.osVersion).slice(0, 20);
  if (Device.modelName) body.model = String(Device.modelName).slice(0, 40);
  const database = openedDatabaseVersion();
  if (database) body.database = database;
  const phone = await currentIdentifier().catch(() => null);
  if (phone) body.device = phone.device;

  try {
    const response = await callApi('/v1/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      await forgetProblems(problems);
      await StorageService.storeData(StorageKeys.HealthLastFailure, '0');
      return 'reported';
    }
    // cpl-api will never take these (a key it does not know, a report it cannot read): out, or they
    // would be sent again at every opening for a week
    if (response.status === 400 || response.status === 403 || response.status === 413) {
      await forgetProblems(problems);
      return 'refused';
    }
    // Too many today (429), or the server down: they wait for the next time
    throw new Error(`The server answered ${response.status}`);
  } catch (error) {
    await StorageService.storeData(StorageKeys.HealthLastFailure, String(Date.now()));
    Logger.logError(Logger.LogKeys.Health, 'reportHealth', error as Error);
    return 'failed';
  }
}
