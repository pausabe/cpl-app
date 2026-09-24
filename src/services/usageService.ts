import * as Logger from '../utils/logger';
import * as StorageService from './storage/storageService';
import StorageKeys from './storage/storageKeys';
import { APP_KEY, callApi } from './cplApi';

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
// can see whether a correction has reached people. It is counted and nothing more: the version is
// not kept next to the identifier, only added to that day's tally. A phone with no database open
// yet sends no version and is counted all the same.
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

export type UsageReportResult = 'reported' | 'nothing-to-say' | 'no-key' | 'failed';

export async function reportUsage(version: number | null = null): Promise<UsageReportResult> {
  if (!APP_KEY) {
    return 'no-key';
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
