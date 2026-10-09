// The health of the app: what goes wrong is written down on the phone (problems.ts), sent to cpl-api
// when the app opens (healthReport.ts), and caught wherever it happens, including the closings that leave
// no error behind (healthMonitor.ts).

function load({ appKey = 'the-app-key', testBuild = false, robot = false, version = '9.3.0' } = {}) {
  let loaded;
  jest.isolateModules(() => {
    process.env.EXPO_PUBLIC_CPL_APP_KEY = appKey;
    process.env.EXPO_PUBLIC_CPL_TEST_BUILD = testBuild ? '1' : '';
    jest.doMock('expo-application', () => ({ nativeApplicationVersion: version }));
    jest.doMock('expo-device', () => ({ osVersion: '18.6.2', modelName: 'iPhone 13' }));
    jest.doMock('../../src/services/googlePlayRobot', () => ({ isGooglePlayRobot: () => robot }));
    jest.doMock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));
    loaded = {
      storage: require('@react-native-async-storage/async-storage'),
      keys: require('../../src/services/storage/storageKeys').default,
      problems: require('../../src/services/health/problems'),
      report: require('../../src/services/health/healthReport'),
      monitor: require('../../src/services/health/healthMonitor'),
      usage: require('../../src/services/usageService'),
      logger: require('../../src/utils/logger'),
    };
  });
  return loaded;
}

const answer = (status = 204) => {
  global.fetch = jest.fn(async () => ({ ok: status >= 200 && status < 300, status }));
};
const sent = (call = 0) => JSON.parse(global.fetch.mock.calls[call][1].body);

async function waiting(app) {
  return JSON.parse((await app.storage.getItem(app.keys.HealthProblems)) ?? '[]');
}

function failure(message, name = 'TypeError') {
  const error = new Error(message);
  error.name = name;
  error.stack =
    `${name}: ${message}\n` +
    '    at psalmody (/private/var/containers/Bundle/Application/0A1B2C3D-1111-2222-3333-444455556666/CPL.app/main.jsbundle:1:884213)\n' +
    '    at LaudesComponent (address at index.android.bundle:1:883102)';
  return error;
}

beforeEach(async () => {
  jest.useRealTimers();
  answer();
});

describe('writing down what went wrong', () => {
  test('keeps the error, without paths, addresses with data, emails or long texts', async () => {
    const app = load();
    await app.storage.clear();
    const error = failure(
      'Download https://cpl-api.canmartorell.dev/v1/db/files/9-abc?e=1&s=secret for maria@exemple.cat failed in ' +
        "'Senyor, obriu-me els llavis, i la meva boca proclamarà la vostra lloança'",
    );

    await app.problems.recordProblem('handled', 'home-load', error);

    const [problem] = await waiting(app);
    expect(problem).toMatchObject({ kind: 'handled', place: 'home-load', name: 'TypeError', app: '9.3.0', count: 1 });
    expect(problem.message).toBe(
      "Download https://cpl-api.canmartorell.dev/v1/db/files/9-abc for <email> failed in '…'",
    );
    expect(problem.stack).toContain('at psalmody (main.jsbundle:1:884213)');
    expect(JSON.stringify(problem)).not.toMatch(/0A1B2C3D|secret|maria/);
  });

  test('whatever was thrown: a text, or nothing at all', async () => {
    const app = load();
    await app.storage.clear();
    await app.problems.recordProblem('handled', 'home-load', 'There is no database to open');
    await app.problems.recordProblem('unexpected_exit', null);

    expect(await waiting(app)).toEqual([
      expect.objectContaining({ message: 'There is no database to open' }),
      expect.objectContaining({ kind: 'unexpected_exit', count: 1 }),
    ]);
  });

  test('the same error again is counted, not written down again', async () => {
    const app = load();
    await app.storage.clear();
    for (let i = 0; i < 30; i++) {
      await app.problems.recordProblem('handled', 'calendar-day', failure(`No day in row ${i}`));
    }
    await app.problems.flushRepeats();

    expect(await waiting(app)).toEqual([expect.objectContaining({ place: 'calendar-day', count: 30 })]);
  });

  test('a loop of different errors stops at 50 a session, and at most 20 wait', async () => {
    const app = load();
    await app.storage.clear();
    for (let i = 0; i < 80; i++) {
      await app.problems.recordProblem(
        'handled',
        'background',
        failure(`error ${String.fromCharCode(65 + (i % 26))}${i > 25 ? 'x'.repeat(i) : ''}`),
      );
    }

    const problems = await waiting(app);
    expect(problems).toHaveLength(app.problems.MAX_WAITING);
    // The newest ones: the 50th was the last one written down
    expect(problems.at(-1).message).toBe(`error X${'x'.repeat(49)}`);
  });

  test('what was written down survives the app closing, and adds up with the next session', async () => {
    const app = load();
    await app.storage.clear();
    await app.problems.recordProblem('fatal', 'js', failure('boom'));

    app.problems.newSession();
    await app.problems.recordProblem('fatal', 'js', failure('boom'));

    expect(await waiting(app)).toEqual([expect.objectContaining({ kind: 'fatal', count: 2 })]);
  });

  test('those that waited more than a week are dropped', async () => {
    const app = load();
    await app.storage.clear();
    const old = { kind: 'handled', place: 'widgets', count: 1, day: '2026-01-01', key: 'old' };
    await app.storage.setItem(app.keys.HealthProblems, JSON.stringify([old]));
    app.problems.newSession();
    await app.problems.recordProblem('handled', 'car', failure('no hour'));

    expect((await app.problems.waitingProblems()).map((one) => one.place)).toEqual(['car']);
  });
});

describe('sending it', () => {
  test('sends what is waiting, with the app, the phone and its identifier, and forgets it', async () => {
    const app = load();
    await app.storage.clear();
    await app.usage.countOpen();
    await app.usage.reportUsage();
    const { device } = await app.usage.currentIdentifier();
    global.fetch.mockClear();
    await app.problems.recordProblem('handled', 'prayer-laudes', failure('x is undefined'));
    await app.problems.recordProblem('unexpected_exit', null, undefined, '9.2.5');

    await expect(app.report.reportHealth()).resolves.toBe('reported');

    expect(global.fetch.mock.calls[0][0]).toMatch(/\/v1\/errors$/);
    expect(global.fetch.mock.calls[0][1].headers['X-CPL-App-Key']).toBe('the-app-key');
    expect(sent()).toEqual({
      app: '9.3.0',
      platform: 'ios',
      os: '18.6.2',
      model: 'iPhone 13',
      database: expect.any(Number),
      device,
      events: [
        {
          kind: 'handled',
          place: 'prayer-laudes',
          name: 'TypeError',
          message: 'x is undefined',
          stack: expect.stringContaining('at LaudesComponent'),
          app: '9.3.0',
          count: 1,
        },
        { kind: 'unexpected_exit', app: '9.2.5', count: 1 },
      ],
    });
    expect(await waiting(app)).toEqual([]);
    await expect(app.report.reportHealth()).resolves.toBe('nothing-to-say');
  });

  test('the same problem is not sent again the same day', async () => {
    const app = load();
    await app.storage.clear();
    await app.problems.recordProblem('handled', 'car', failure('no hour'));
    await app.report.reportHealth();

    app.problems.newSession();
    await app.problems.recordProblem('handled', 'car', failure('no hour'));

    expect(await waiting(app)).toEqual([]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('at most ten in a report; the rest go with the next one', async () => {
    const app = load();
    await app.storage.clear();
    for (let i = 0; i < 12; i++) {
      await app.problems.recordProblem('handled', 'background', failure(`error ${String.fromCharCode(65 + i)}`));
    }

    await app.report.reportHealth();
    expect(sent().events).toHaveLength(10);
    expect(await waiting(app)).toHaveLength(2);
  });

  test('if it does not get through it is kept, and the next try waits a quarter of an hour', async () => {
    const app = load();
    await app.storage.clear();
    await app.problems.recordProblem('fatal', 'js', failure('boom'));
    answer(429);

    await expect(app.report.reportHealth()).resolves.toBe('failed');
    expect(await waiting(app)).toHaveLength(1);
    answer();
    await expect(app.report.reportHealth()).resolves.toBe('too-soon');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('what cpl-api will never take is not sent again and again', async () => {
    const app = load();
    await app.storage.clear();
    await app.problems.recordProblem('fatal', 'js', failure('boom'));
    answer(400);

    await expect(app.report.reportHealth()).resolves.toBe('refused');
    expect(await waiting(app)).toEqual([]);
  });

  test("a copy built to be tried out, Google Play's robot and an app without the key send nothing", async () => {
    for (const [options, result] of [
      [{ testBuild: true }, 'test-build'],
      [{ robot: true }, 'robot'],
      [{ appKey: '' }, 'no-key'],
    ]) {
      const app = load(options);
      await app.storage.clear();
      await app.problems.recordProblem('fatal', 'js', failure('boom'));
      await expect(app.report.reportHealth()).resolves.toBe(result);
    }
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('catching it', () => {
  function errorUtils(previous = jest.fn()) {
    let handler = previous;
    return {
      previous,
      getGlobalHandler: () => handler,
      setGlobalHandler: (next) => {
        handler = next;
      },
      fire: (error, isFatal) => handler(error, isFatal),
    };
  }

  test('an error that closes the app is written down first, and then the app closes as before', async () => {
    const app = load();
    await app.storage.clear();
    const utils = errorUtils();
    app.monitor.catchClosingErrors(utils);

    utils.fire(failure('Maximum call stack size exceeded', 'RangeError'), true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(await waiting(app)).toEqual([expect.objectContaining({ kind: 'fatal', name: 'RangeError' })]);
    expect(utils.previous).toHaveBeenCalledTimes(1);
  });

  test('the app closes all the same if the phone takes too long to keep it', async () => {
    const app = load();
    await app.storage.clear();
    const utils = errorUtils();
    app.monitor.catchClosingErrors(utils, 20);
    jest.spyOn(app.storage, 'setItem').mockImplementation(() => new Promise(() => undefined));

    utils.fire(failure('boom'), true);
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(utils.previous).toHaveBeenCalledTimes(1);
  });

  test("an error that does not close the app goes on to React Native's handler too", async () => {
    const app = load();
    await app.storage.clear();
    const utils = errorUtils();
    app.monitor.catchClosingErrors(utils);

    utils.fire(failure('not fatal'), false);
    await app.problems.waitingProblems();

    expect(await waiting(app)).toEqual([expect.objectContaining({ kind: 'handled', place: 'js-error' })]);
    expect(utils.previous).toHaveBeenCalledWith(expect.any(Error), false);
  });

  test('a prayer that comes out blank is told through the logger, all the views can reach', async () => {
    const app = load();
    await app.storage.clear();

    app.logger.reportProblem('prayer-laudes', failure('x is undefined'));
    await app.problems.waitingProblems();

    expect(await waiting(app)).toEqual([expect.objectContaining({ kind: 'handled', place: 'prayer-laudes' })]);
  });

  test('a promise that failed with nobody listening, unless it was reported where it was caught', async () => {
    const app = load();
    await app.storage.clear();
    let tracker;
    app.monitor.catchUnhandledRejections({ enablePromiseRejectionTracker: (options) => (tracker = options) });
    const caught = failure('reported already');
    app.problems.reportProblem('settings-reload', caught);

    tracker.onUnhandled(1, failure('Network request failed'));
    tracker.onUnhandled(2, caught);
    await app.problems.waitingProblems();

    expect((await waiting(app)).map((one) => one.place)).toEqual(['settings-reload', 'background']);
  });
});

describe('the closings that leave no error', () => {
  function appState(currentState = 'active') {
    const listeners = [];
    return {
      currentState,
      addEventListener: (_type, listener) => {
        listeners.push(listener);
        return { remove: () => undefined };
      },
      change: async (next, app) => {
        listeners.forEach((listener) => listener(next));
        // The mark is written in its turn
        await new Promise((resolve) => setTimeout(resolve, 10));
        return app;
      },
    };
  }

  // The app opens: a new session of the same phone, watched until the end of the test
  const watchers = [];
  async function open(app, state = appState('active'), delay = 60_000) {
    app.problems.newSession();
    watchers.push(await app.monitor.watchSessions(state, delay));
    return state;
  }
  afterEach(() => watchers.splice(0).forEach((watcher) => watcher.remove()));

  test('while the app is in front there is a mark, with the version of the app', async () => {
    const app = load();
    await app.storage.clear();
    await open(app);
    expect(JSON.parse(await app.storage.getItem(app.keys.HealthSession))).toMatchObject({ app: '9.3.0' });
  });

  test('a session that ended with the app in front is told the next time, with its version', async () => {
    const app = load({ version: '9.3.0' });
    await app.storage.clear();
    // The 9.2.5 was closed in front: nothing took its mark away. Then the app was updated.
    await app.storage.setItem(app.keys.HealthSession, JSON.stringify({ app: '9.2.5', since: 1 }));

    await open(app);

    expect(await waiting(app)).toEqual([expect.objectContaining({ kind: 'unexpected_exit', app: '9.2.5' })]);
  });

  test('going to the background takes the mark away: closing it from there is no problem', async () => {
    const app = load();
    await app.storage.clear();
    const state = await open(app);

    await state.change('background');
    expect(await app.storage.getItem(app.keys.HealthSession)).toBeNull();
    await state.change('active');
    await state.change('inactive');

    await open(app);
    expect(await waiting(app)).toEqual([]);
  });

  test('an error that closed the app is the error, not an unexpected closing as well', async () => {
    const app = load();
    await app.storage.clear();
    await open(app);
    const utils = {
      getGlobalHandler: () => undefined,
      setGlobalHandler: (handler) => (utils.fire = handler),
    };
    app.monitor.catchClosingErrors(utils);
    utils.fire(failure('boom'), true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    await open(app);
    expect((await waiting(app)).map((one) => one.kind)).toEqual(['fatal']);
  });

  test('the report goes a few seconds after opening, and again when coming back', async () => {
    const app = load();
    await app.storage.clear();
    await app.problems.recordProblem('fatal', 'js', failure('boom'));

    const state = await open(app, appState('active'), 20);
    expect(global.fetch).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await app.problems.recordProblem('handled', 'car', failure('no hour'));
    await state.change('background');
    await state.change('active');
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('under Jest the app itself watches nothing', () => {
    const app = load();
    const setGlobalHandler = jest.spyOn(global.ErrorUtils ?? { setGlobalHandler() {} }, 'setGlobalHandler');
    app.monitor.startHealthMonitoring();
    expect(setGlobalHandler).not.toHaveBeenCalled();
  });
});
