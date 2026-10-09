import * as Logger from '../../utils/logger';
import * as StorageService from '../storage/storageService';
import StorageKeys from '../storage/storageKeys';
import { appVersion } from '../cplApi';

// What went wrong on this phone, kept until it reaches cpl-cloud (healthReport.ts), so that Pau learns
// about the app's errors before anyone has to tell him (the «Salut» tab of the publishing website).
//
// Three kinds: 'fatal', the code failed and the app is about to close; 'handled', the app caught it but
// whoever uses it was left without what they wanted (the home could not load the day, a prayer came out
// blank); and 'unexpected_exit', the previous session ended with the app in front for no known reason
// (healthMonitor.ts).
//
// Only what helps to understand the error is kept: its name, its message and the lines of code where it
// happened, without anything that could say who anyone is. Addresses lose what follows «?», emails and
// long identifiers go, long texts are cut, and of a path only the file is kept: an iPhone's path carries
// an identifier of the installation. cpl-cloud cleans it all again.
//
// A crash loop must not fill the phone nor the server: the same problem is kept once a day with how many
// times it happened, at most 20 problems wait, those older than a week are dropped, and a session
// records at most 50.

export type ProblemKind = 'fatal' | 'handled' | 'unexpected_exit';

// Where in the app: cpl-cloud says it in words (issueLabel, src/shared/health.ts)
export type ProblemPlace =
  | 'js'
  | 'render'
  | 'js-error'
  | 'background'
  | 'home-load'
  | 'home-assets'
  | 'settings-reload'
  | 'database-open'
  | 'calendar-day'
  | 'calendar-year'
  | 'widgets'
  | 'car'
  | 'prayer-office'
  | 'prayer-laudes'
  | 'prayer-minor'
  | 'prayer-vespers'
  | 'prayer-night'
  | 'prayer-mass';

export interface Problem {
  kind: ProblemKind;
  place?: ProblemPlace;
  name?: string;
  message?: string;
  stack?: string;
  // The version of the app where it happened: the report may go after an update
  app?: string;
  count: number;
  // The day it happened first (UTC, as cpl-cloud counts days), and what makes two of them the same
  day: string;
  key: string;
}

export const MAX_WAITING = 20;
export const DAYS_WAITING = 7;
export const MAX_RECORDS_PER_SESSION = 50;
const MAX_COUNT = 1000;
const MAX_NAME = 80;
const MAX_MESSAGE = 300;
const MAX_STACK_LINES = 12;
const MAX_STACK_LINE = 200;
const MAX_STACK = 2000;
// Repeats of a problem already written down are added up and written together, a moment later
const REPEATS_WAIT = 3000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// --- Taking out what does not belong ---------------------------------------------------------------

const URL_PATTERN = /\b(?:https?|file):\/\/[^\s'"()<>]+/gi;
const EMAIL_PATTERN = /[^\s@<>()'"]+@[^\s@<>()'"]+\.[a-z]{2,}/gi;
const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const LONG_HEX_PATTERN = /\b[0-9a-f]{24,}\b/gi;
const PATH_PATTERN = /(?:[a-z][a-z0-9+.-]*:\/\/[^\s/()]*)?(?:\/[^\s/()]*)+\/([^\s/()]+)/gi;
// A long text between quotes is not part of the error: it is data (a query, a piece of a prayer)
const QUOTED_PATTERN = /(["'«])[^"'»\n]{40,}(["'»])/g;

export function scrub(text: string): string {
  return text
    .replace(URL_PATTERN, (url) => url.replace(/[?#].*$/, ''))
    .replace(EMAIL_PATTERN, '<email>')
    .replace(UUID_PATTERN, '<id>')
    .replace(LONG_HEX_PATTERN, '<id>');
}

export function cleanMessage(message: string): string {
  const clean = scrub(message).replace(QUOTED_PATTERN, '$1…$2').replace(/\s+/g, ' ').trim();
  return clean.length > MAX_MESSAGE ? `${clean.slice(0, MAX_MESSAGE - 1)}…` : clean;
}

// The lines of code where it happened, without paths: at most twelve, and short
export function cleanStack(stack: string): string {
  return stack
    .split('\n')
    .map((line) => scrub(line).replace(PATH_PATTERN, '$1').replace(/\s+/g, ' ').trim().slice(0, MAX_STACK_LINE))
    .filter((line) => line.length > 0)
    .slice(0, MAX_STACK_LINES)
    .join('\n')
    .slice(0, MAX_STACK);
}

// Whatever was thrown: an Error, a text (the database manager throws one), or anything else
export function describeThrown(thrown: unknown): Pick<Problem, 'name' | 'message' | 'stack'> {
  if (thrown instanceof Error || (typeof thrown === 'object' && thrown !== null && 'message' in thrown)) {
    const error = thrown as Partial<Error>;
    return {
      name: typeof error.name === 'string' ? error.name.slice(0, MAX_NAME) : undefined,
      message: typeof error.message === 'string' ? cleanMessage(error.message) : undefined,
      stack: typeof error.stack === 'string' ? cleanStack(error.stack) : undefined,
    };
  }
  if (thrown === undefined || thrown === null) return {};
  return { message: cleanMessage(typeof thrown === 'string' ? thrown : String(thrown)) };
}

// Two problems are the same when they are of the same kind, in the same place, with the same error
// and the same message apart from its numbers
function keyOf(problem: Pick<Problem, 'kind' | 'place' | 'name' | 'message'>): string {
  const message = (problem.message ?? '').replace(/\d+/g, '#');
  return [problem.kind, problem.place ?? '', problem.name ?? '', message].join('|');
}

// --- Keeping them --------------------------------------------------------------------------------

// The problems sent today: the same one is not sent again until tomorrow
interface SentToday {
  day: string;
  keys: string[];
}

let waiting: Problem[] | null = null;
// One change at a time, in order: two problems at once must not overwrite each other
let queue: Promise<void> = Promise.resolve();
let recorded = 0;
const writtenThisSession = new Set<string>();
const repeats = new Map<string, number>();
let repeatsTimer: ReturnType<typeof setTimeout> | null = null;
// What was already reported where it was caught: it must not come again as an unhandled rejection
const reported = new WeakSet<object>();

function parse<T>(text: string | undefined, fallback: T): T {
  try {
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function load(): Promise<Problem[]> {
  if (waiting === null) {
    const stored = parse<unknown>(await StorageService.getData(StorageKeys.HealthProblems), []);
    waiting = Array.isArray(stored) ? (stored as Problem[]).filter((one) => one && typeof one.key === 'string') : [];
  }
  return waiting;
}

async function sentToday(): Promise<SentToday> {
  const sent = parse<SentToday>(await StorageService.getData(StorageKeys.HealthSent), { day: '', keys: [] });
  return sent.day === today() && Array.isArray(sent.keys) ? sent : { day: today(), keys: [] };
}

function inTurn(change: () => Promise<void>): Promise<void> {
  const run = queue.then(change);
  queue = run.catch(() => undefined);
  return run;
}

async function save(problems: Problem[]): Promise<void> {
  waiting = problems;
  await StorageService.storeData(StorageKeys.HealthProblems, JSON.stringify(problems));
}

// Writes it down for the next report. It never throws: whatever happens here must not make things
// worse. The promise is there for whoever has to wait for it (the app is about to close).
export function recordProblem(
  kind: ProblemKind,
  place: ProblemPlace | null,
  thrown?: unknown,
  app: string | null = appVersion(),
): Promise<void> {
  try {
    if (typeof thrown === 'object' && thrown !== null) reported.add(thrown);
    const problem: Problem = {
      kind,
      ...(place ? { place } : {}),
      ...describeThrown(thrown),
      ...(app ? { app } : {}),
      count: 1,
      day: today(),
      key: '',
    };
    problem.key = keyOf(problem);
    // Already written down in this session: only how many times, a moment later and all together
    if (writtenThisSession.has(problem.key)) {
      repeats.set(problem.key, (repeats.get(problem.key) ?? 0) + 1);
      repeatsTimer ??= setTimeout(() => {
        repeatsTimer = null;
        flushRepeats();
      }, REPEATS_WAIT);
      return Promise.resolve();
    }
    if (recorded >= MAX_RECORDS_PER_SESSION) return Promise.resolve();
    recorded++;
    writtenThisSession.add(problem.key);
    return inTurn(async () => {
      if ((await sentToday()).keys.includes(problem.key)) return;
      const problems = await load();
      const same = problems.find((one) => one.key === problem.key);
      if (same) {
        same.count = Math.min(MAX_COUNT, same.count + 1);
        await save(problems);
      } else {
        await save([...problems, problem].slice(-MAX_WAITING));
      }
    }).catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}

// A problem the app caught where it happened, for when the person was left without what they wanted
export function reportProblem(place: ProblemPlace, thrown?: unknown): void {
  recordProblem('handled', place, thrown);
}

// The views tell theirs through the logger, which is all they can reach
Logger.setProblemSink(reportProblem);

export function wasReported(thrown: unknown): boolean {
  return typeof thrown === 'object' && thrown !== null && reported.has(thrown);
}

// Adds up the repeats waiting to be written. The tests call it instead of waiting for the timer.
export function flushRepeats(): Promise<void> {
  if (repeatsTimer) {
    clearTimeout(repeatsTimer);
    repeatsTimer = null;
  }
  if (repeats.size === 0) return queue;
  const counted = new Map(repeats);
  repeats.clear();
  return inTurn(async () => {
    const problems = await load();
    for (const problem of problems) {
      const more = counted.get(problem.key);
      if (more) problem.count = Math.min(MAX_COUNT, problem.count + more);
    }
    await save(problems);
  }).catch(() => undefined);
}

// What is waiting to be sent: the oldest first, without those that have waited more than a week
export async function waitingProblems(): Promise<Problem[]> {
  let result: Problem[] = [];
  await inTurn(async () => {
    const limit = new Date();
    limit.setUTCDate(limit.getUTCDate() - DAYS_WAITING);
    const problems = await load();
    const fresh = problems.filter((one) => one.day >= limit.toISOString().slice(0, 10));
    if (fresh.length !== problems.length) await save(fresh);
    result = fresh.map((one) => ({ ...one }));
  }).catch(() => undefined);
  return result;
}

// They reached cpl-cloud (or it will never take them): out of the queue, and not again until tomorrow
export async function forgetProblems(sent: Problem[]): Promise<void> {
  await inTurn(async () => {
    const keys = new Set(sent.map((one) => one.key));
    const already = await sentToday();
    await StorageService.storeData(
      StorageKeys.HealthSent,
      JSON.stringify({ day: already.day, keys: [...new Set([...already.keys, ...keys])] }),
    );
    await save((await load()).filter((one) => !keys.has(one.key)));
  }).catch(() => undefined);
}

// For the tests: a new session, as if the app had just opened
export function newSession(): void {
  waiting = null;
  recorded = 0;
  writtenThisSession.clear();
  repeats.clear();
  if (repeatsTimer) clearTimeout(repeatsTimer);
  repeatsTimer = null;
}
