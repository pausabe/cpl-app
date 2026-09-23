import * as Logger from '../utils/logger';
import * as StorageService from './storage/storageService';
import StorageKeys from './storage/storageKeys';
import { APP_KEY, callApi } from './cplApi';

// How many people use the app, without knowing anything about anyone.
//
// The phone makes itself a code at random each day and throws it away the next one: there is no
// identifier that lasts, nothing that ties one day to another and nothing that says who anyone is.
// Together with the code it sends how many times the app has been opened since the last report.
// The server keeps two numbers a day and forgets the codes after two days.
const MAX_OPENS = 500;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Good enough for counting: the code is not a secret and nothing depends on it being unguessable
function randomCode(): string {
  let code = '';
  while (code.length < 32) {
    code += Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, '0');
  }
  return code.slice(0, 32);
}

async function codeForToday(): Promise<string> {
  const day = today();
  const stored = await StorageService.getData(StorageKeys.UsageCode, '');
  const [storedDay, storedCode] = String(stored).split(':');
  if (storedDay === day && storedCode) {
    return storedCode;
  }
  const code = randomCode();
  await StorageService.storeData(StorageKeys.UsageCode, `${day}:${code}`);
  return code;
}

// Today's code, if there is one yet. Only to show it in the Settings screen: the phone should be
// able to see the one thing it sends about itself.
export async function todaysCode(): Promise<string | null> {
  const stored = await StorageService.getData(StorageKeys.UsageCode, '');
  const [day, code] = String(stored).split(':');
  return day === today() && code ? code : null;
}

// One more opening. It is sent with the next report and counted then.
export async function countOpen(): Promise<void> {
  const opens = Number(await StorageService.getData(StorageKeys.UsageOpens, '0')) || 0;
  await StorageService.storeData(StorageKeys.UsageOpens, Math.min(opens + 1, MAX_OPENS));
}

export type UsageReportResult = 'reported' | 'nothing-to-say' | 'no-key' | 'failed';

export async function reportUsage(): Promise<UsageReportResult> {
  if (!APP_KEY) {
    return 'no-key';
  }
  const opens = Number(await StorageService.getData(StorageKeys.UsageOpens, '0')) || 0;
  const reportedDay = await StorageService.getData(StorageKeys.UsageReportedDay, '');
  // Already counted today and nothing new to add
  if (opens === 0 && reportedDay === today()) {
    return 'nothing-to-say';
  }

  try {
    const response = await callApi('/v1/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: await codeForToday(), opens: Math.min(opens, MAX_OPENS) }),
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
