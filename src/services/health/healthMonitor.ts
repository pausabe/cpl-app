import { AppState, type AppStateStatus } from 'react-native';
import * as StorageService from '../storage/storageService';
import StorageKeys from '../storage/storageKeys';
import { appVersion } from '../cplApi';
import { recordProblem, reportProblem, wasReported, type ProblemPlace } from './problems';
import { reportHealth } from './healthReport';

// Listens for what goes wrong anywhere in the app, and sends it when the app opens or comes back.
//
// - An error of the code that closes the app: it is written down before the app goes, waiting a moment
//   at most for the phone to keep it, and sent the next time it opens.
// - A promise that failed with nobody listening: the app goes on, but something did not happen.
// - The previous session ended with the app in front: a mark is set while the app is in front and taken
//   away when it goes to the background. If it is still there when the app opens, the app was closed
//   without going to the background: the phone's own code failed (a crash of React Native or of the
//   system), it hung and the system closed it, or the phone switched off. There is no knowing which, but
//   it is the only way to see those closings without native code.
//
// Not under Jest (the tests of the app would each be a session), and not in a copy built to be tried out
// (healthReport.ts sends nothing then, but the errors are still written down, to see them in the logs).

// How long a closing error waits for the phone to keep it before letting the app close
export const FATAL_WAIT = 1000;
// The report goes a few seconds after opening, when the home has been drawn: never in its way
const REPORT_DELAY = 8000;

interface ErrorUtilsLike {
  getGlobalHandler(): ((error: unknown, isFatal?: boolean) => void) | undefined;
  setGlobalHandler(handler: (error: unknown, isFatal?: boolean) => void): void;
}

interface HermesLike {
  enablePromiseRejectionTracker?: (options: {
    allRejections: boolean;
    onUnhandled: (id: number, rejection: unknown) => void;
    onHandled: (id: number) => void;
  }) => void;
}

interface AppStateLike {
  currentState: AppStateStatus | string | null;
  addEventListener(type: 'change', listener: (state: AppStateStatus) => void): { remove(): void };
}

let started = false;

export function startHealthMonitoring(): void {
  if (started || process.env.JEST_WORKER_ID !== undefined) return;
  started = true;
  const globals = globalThis as unknown as { ErrorUtils?: ErrorUtilsLike; HermesInternal?: HermesLike | null };
  if (globals.ErrorUtils) catchClosingErrors(globals.ErrorUtils);
  // In development React Native already shows them, and keeps doing so
  if (!__DEV__ && globals.HermesInternal) catchUnhandledRejections(globals.HermesInternal);
  watchSessions(AppState).catch(() => undefined);
}

// The errors that reach the top. React Native's own handler goes on doing what it did: in development
// the red screen, in a build of the stores closing the app. Before that, the error is written down.
export function catchClosingErrors(errorUtils: ErrorUtilsLike, wait = FATAL_WAIT): void {
  const previous = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    if (!isFatal) {
      reportProblem('js-error', error);
      previous?.(error, isFatal);
      return;
    }
    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      previous?.(error, isFatal);
    };
    recordClosingError('js', error).then(close, close);
    setTimeout(close, wait);
  });
}

// An error that is about to close the app. It is not an unexpected exit as well: what closed it is known,
// and is the error.
export function recordClosingError(place: ProblemPlace, error: unknown): Promise<void> {
  return Promise.all([recordProblem('fatal', place, error), sessionEnded()]).then(() => undefined);
}

// Hermes tells of promises that failed without anyone waiting for them. What was already reported where
// it was caught (and thrown again) is not reported twice.
export function catchUnhandledRejections(hermes: HermesLike): void {
  hermes.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id, rejection) => {
      if (!wasReported(rejection)) reportProblem('background', rejection);
    },
    onHandled: () => undefined,
  });
}

// --- The mark of a session in front ----------------------------------------------------------------

// The marks are written in order: a change to the background right after one to the front must not be
// overtaken by it
let marks: Promise<void> = Promise.resolve();

function mark(change: () => Promise<void>): Promise<void> {
  marks = marks.then(change).catch(() => undefined);
  return marks;
}

function sessionStarted(): Promise<void> {
  return mark(() =>
    StorageService.storeData(StorageKeys.HealthSession, JSON.stringify({ app: appVersion(), since: Date.now() })),
  );
}

function sessionEnded(): Promise<void> {
  return mark(() => StorageService.removeData(StorageKeys.HealthSession));
}

// If the previous session left its mark, it ended with the app in front. Told with the version of the app
// that had it, which may not be this one.
export async function checkLastSession(): Promise<void> {
  const stored = await StorageService.getData(StorageKeys.HealthSession, '');
  if (!stored) return;
  let app: string | null = null;
  try {
    const parsed = JSON.parse(stored) as { app?: unknown };
    app = typeof parsed.app === 'string' ? parsed.app : null;
  } catch {
    // A mark that cannot be read is a mark all the same
  }
  await recordProblem('unexpected_exit', null, undefined, app);
  await sessionEnded();
}

let reportTimer: ReturnType<typeof setTimeout> | null = null;

function reportSoon(delay: number): void {
  if (reportTimer) clearTimeout(reportTimer);
  reportTimer = setTimeout(() => {
    reportTimer = null;
    reportHealth().catch(() => undefined);
  }, delay);
}

// The marks and the reports: when the app opens, and every time it comes back. What it returns stops it
// (the tests).
export async function watchSessions(appState: AppStateLike, delay = REPORT_DELAY): Promise<{ remove(): void }> {
  await checkLastSession();
  if (appState.currentState === 'active') await sessionStarted();
  const subscription = appState.addEventListener('change', (next) => {
    if (next === 'active') {
      sessionStarted();
      reportSoon(delay);
    } else if (next === 'background' || next === 'inactive') {
      sessionEnded();
    }
  });
  reportSoon(delay);
  return {
    remove: () => {
      subscription.remove();
      if (reportTimer) clearTimeout(reportTimer);
      reportTimer = null;
    },
  };
}
