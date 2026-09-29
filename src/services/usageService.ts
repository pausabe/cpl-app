import * as Device from 'expo-device';
import * as Logger from '../utils/logger';
import * as StorageService from './storage/storageService';
import StorageKeys from './storage/storageKeys';
import SettingsService, { DioceseName } from './SettingsService';
import { APP_KEY, IS_TEST_BUILD, appVersion, callApi, phonePlatform } from './cplApi';

// How many people use the app.
//
// The phone makes itself an identifier and sends it once a day, together with how many times the
// app has been opened since the last report. The identifier is only good for not counting the same
// phone twice: it says nothing about who anyone is, it is not shared with anyone and it is not used
// for anything else. Following the AEPD's guidance on audience measurement, it lasts at most
// thirteen months and is not renewed by using the app: at thirteen months the phone makes a new one
// and the old one is forgotten. The CPL's privacy policy explains it.
//
// The report also says which publication of the database the app is praying with, so that the CPL
// can see whether a correction has reached people; which version of the app it is and on which
// system (only the big number: iOS 18, Android 14), to know how many already have the newest app
// and how many a newer minimum would leave out; and which diocese is chosen, to see that the
// calendar of each one is in use. They are kept next to the identifier, so that each phone counts
// once however many days it opens the app, and they are only ever read as counts: nobody can look
// up what one phone said, and they are forgotten with it. What the phone cannot say (no database
// open yet, the web build) is left out and the phone is counted all the same.
const MONTHS_OF_IDENTIFIER = 13;
const MAX_OPENS = 500;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Good enough for counting: the identifier is not a secret and nothing depends on it being
// unguessable, only on two phones not making the same one
function randomIdentifier(): string {
  let identifier = '';
  while (identifier.length < 32) {
    identifier += Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, '0');
  }
  return identifier.slice(0, 32);
}

// "18.6.2" is 18 and "14" is 14: the big number is what a minimum of the system goes by
function systemVersion(): number | null {
  const major = parseInt(String(Device.osVersion ?? ''), 10);
  return Number.isInteger(major) && major > 0 ? major : null;
}

const DIOCESES = Object.values(DioceseName) as string[];

// What the phone says about itself, leaving out whatever it does not know. The diocese only if it
// is one of the list: something odd left by an old version would get the whole report refused.
async function aboutThisPhone(): Promise<Record<string, string | number>> {
  const about: Record<string, string | number> = {};
  const app = appVersion();
  const platform = phonePlatform();
  const system = systemVersion();
  const diocese = String((await SettingsService.getSettingDiocese()) ?? '');
  if (app) about.app = app;
  if (platform) about.platform = platform;
  if (system) about.os = system;
  if (DIOCESES.includes(diocese)) about.diocese = diocese;
  return about;
}

function isOlderThanThirteenMonths(madeOn: string): boolean {
  const limit = new Date();
  limit.setUTCMonth(limit.getUTCMonth() - MONTHS_OF_IDENTIFIER);
  return madeOn < limit.toISOString().slice(0, 10);
}

// The identifier this phone sends, made if there is none or if the one there is has run its
// thirteen months. What is stored is 'the day it was made:the identifier'.
async function identifier(): Promise<string> {
  const current = await currentIdentifier();
  if (current && !isOlderThanThirteenMonths(current.madeOn)) {
    return current.device;
  }
  const made = randomIdentifier();
  await StorageService.storeData(StorageKeys.UsageDevice, `${today()}:${made}`);
  return made;
}

// To show it in the Settings screen. It does not make one: a phone that has never reported has
// nothing to show.
export async function currentIdentifier(): Promise<{ device: string; madeOn: string } | null> {
  const stored = await StorageService.getData(StorageKeys.UsageDevice, '');
  const [madeOn, device] = String(stored).split(':');
  return device && madeOn ? { device, madeOn } : null;
}

// One more opening. It is sent with the next report and counted then.
export async function countOpen(): Promise<void> {
  const opens = Number(await StorageService.getData(StorageKeys.UsageOpens, '0')) || 0;
  await StorageService.storeData(StorageKeys.UsageOpens, Math.min(opens + 1, MAX_OPENS));
}

export type UsageReportResult = 'reported' | 'nothing-to-say' | 'no-key' | 'test-build' | 'failed';

export async function reportUsage(version: number | null = null): Promise<UsageReportResult> {
  if (!APP_KEY) {
    return 'no-key';
  }
  // A copy built to be tried out says nothing: it does not even make itself an identifier, so the
  // tests leave no trace in the count
  if (IS_TEST_BUILD) {
    return 'test-build';
  }
  // Once a day is enough, and it is half the requests: the openings add up and the ones that
  // happen after today's report go with tomorrow's
  if ((await StorageService.getData(StorageKeys.UsageReportedDay, '')) === today()) {
    return 'nothing-to-say';
  }
  const opens = Number(await StorageService.getData(StorageKeys.UsageOpens, '0')) || 0;

  try {
    const response = await callApi('/v1/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device: await identifier(),
        opens: Math.min(opens, MAX_OPENS),
        ...(version === null ? {} : { version }),
        ...(await aboutThisPhone()),
      }),
    });
    if (!response.ok) {
      throw new Error(`The server answered ${response.status}`);
    }
    await StorageService.storeData(StorageKeys.UsageReportedDay, today());
    await StorageService.storeData(StorageKeys.UsageOpens, 0);
    return 'reported';
  } catch (error) {
    // Nothing is lost: the openings stay counted and go with the next report
    Logger.logError(Logger.LogKeys.UsageService, 'reportUsage', error as Error);
    return 'failed';
  }
}
