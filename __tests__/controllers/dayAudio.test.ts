// Today's audio downloaded beforehand from Configuració, to pray with no network; and the pieces cpl-api
// remade with another sound, which the phone lets go of to download them again.
jest.mock('expo-file-system', () => require('../helpers/fakeFileSystem'));
jest.mock('../../src/services/cplApi', () => ({ ...jest.requireActual('../../src/services/cplApi'), APP_KEY: 'test' }));
jest.mock('../../src/services/audio/pieceClient', () => {
  const actual = jest.requireActual('../../src/services/audio/pieceClient');
  return { ...actual, fetchPieces: jest.fn() };
});

import * as Listen from '../../src/controllers/listenController';
import * as DayAudio from '../../src/controllers/dayAudioController';
import { fetchPieces, AudioNetworkError } from '../../src/services/audio/pieceClient';
import { filePieceStore } from '../../src/services/audio/pieceStore';
import { forgetChangedPieces } from '../../src/services/audio/audioChanges';
import { dayAudioLabels } from '../../src/view-models/speech/dayAudioLabels';

const { Directory } = jest.requireMock('expo-file-system');
const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
const fetchMock = fetchPieces as jest.Mock;
const key = (n: number) => String(n).padStart(24, '0');
const bytes = (n: number) => new Uint8Array(n).fill(7);

let store: ReturnType<typeof filePieceStore>;
let folder = 0;

function answer(responses: Record<string, { status?: number; body?: unknown }>) {
  return jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, '');
    const r = responses[path];
    if (!r) throw new Error(`offline: ${path}`);
    return { ok: (r.status ?? 200) < 400, status: r.status ?? 200, json: async () => r.body } as Response;
  });
}

beforeEach(async () => {
  store = filePieceStore(new Directory(`mem:/document/day-${folder++}`));
  Listen.resetListen(store);
  DayAudio.resetDayAudio();
  fetchMock.mockReset();
  await AsyncStorage.clear();
});
afterEach(() => jest.restoreAllMocks());

describe("today's audio, from Configuració", () => {
  test('downloads every piece of the day by name, and then says it is on the phone', async () => {
    const keys = [key(1), key(2), key(3)];
    answer({ '/v1/audio/day/2026-10-09': { body: { day: '2026-10-09', keys } } });
    fetchMock.mockImplementation(async (pieces: { key: string; voice?: string }[]) => {
      expect(pieces.every((p) => p.voice === undefined)).toBe(true);
      return { found: new Map(pieces.map((p) => [p.key, bytes(10)])), missing: [] };
    });

    const progress: number[] = [];
    const unsubscribe = DayAudio.subscribeDayAudio(() => progress.push(DayAudio.getDayAudio().progress));
    await DayAudio.downloadDayAudio('2026-10-09');
    unsubscribe();

    expect(DayAudio.getDayAudio()).toMatchObject({ day: '2026-10-09', phase: 'done', progress: 1 });
    expect(keys.every((k) => store.has(k))).toBe(true);
    expect(progress).toContain(1);

    // Configuració opened again, with no network: it knows
    DayAudio.resetDayAudio();
    await DayAudio.checkDayAudio('2026-10-09');
    expect(DayAudio.getDayAudio().phase).toBe('done');
    // Another day is not downloaded
    await DayAudio.checkDayAudio('2026-10-10');
    expect(DayAudio.getDayAudio().phase).toBe('idle');
  });

  test('if some pieces went to make room for others, it offers to download it again', async () => {
    answer({ '/v1/audio/day/2026-10-09': { body: { keys: [key(1), key(2)] } } });
    fetchMock.mockImplementation(async (pieces: { key: string }[]) => ({
      found: new Map(pieces.map((p) => [p.key, bytes(10)])),
      missing: [],
    }));
    await DayAudio.downloadDayAudio('2026-10-09');
    store.forget([key(2)]);

    await DayAudio.checkDayAudio('2026-10-09');

    expect(DayAudio.getDayAudio().phase).toBe('idle');
  });

  test('a piece cpl-api does not have yet: on the phone all the rest, and it says so', async () => {
    answer({ '/v1/audio/day/2026-10-09': { body: { keys: [key(1), key(2)] } } });
    fetchMock.mockResolvedValue({ found: new Map([[key(1), bytes(10)]]), missing: [key(2)] });

    await DayAudio.downloadDayAudio('2026-10-09');

    expect(DayAudio.getDayAudio().phase).toBe('partial');
    expect(dayAudioLabels('partial', 1).status).toMatch(/veu del telèfon/);
  });

  test('a day cpl-api does not know yet, no network, or a limit: it says so and can be tried again', async () => {
    answer({ '/v1/audio/day/2026-10-09': { status: 404, body: { error: 'unknown_day' } } });
    await DayAudio.downloadDayAudio('2026-10-09');
    expect(DayAudio.getDayAudio().phase).toBe('notReady');

    jest.restoreAllMocks();
    answer({});
    await DayAudio.downloadDayAudio('2026-10-09');
    expect(DayAudio.getDayAudio().phase).toBe('offline');
    expect(dayAudioLabels('offline', 0).action).toBe('Torna-ho a provar');

    jest.restoreAllMocks();
    answer({ '/v1/audio/day/2026-10-09': { status: 429, body: { error: 'audio_limit' } } });
    await DayAudio.downloadDayAudio('2026-10-09');
    expect(DayAudio.getDayAudio().phase).toBe('limited');

    jest.restoreAllMocks();
    answer({ '/v1/audio/day/2026-10-09': { body: { keys: [key(1)] } } });
    fetchMock.mockRejectedValue(new AudioNetworkError('offline'));
    await DayAudio.downloadDayAudio('2026-10-09');
    expect(DayAudio.getDayAudio().phase).toBe('offline');
  });

  test('pressed twice, it downloads once', async () => {
    answer({ '/v1/audio/day/2026-10-09': { body: { keys: [key(1)] } } });
    fetchMock.mockResolvedValue({ found: new Map([[key(1), bytes(10)]]), missing: [] });

    await Promise.all([DayAudio.downloadDayAudio('2026-10-09'), DayAudio.downloadDayAudio('2026-10-09')]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('what Configuració says while it downloads', () => {
    expect(dayAudioLabels('idle', 0)).toEqual({ action: "Baixa l'àudio d'avui", status: null, progress: null });
    expect(dayAudioLabels('downloading', 0.456)).toEqual({ action: null, status: 'Baixant… 46 %', progress: 0.456 });
    expect(dayAudioLabels('done', 1).status).toBe("L'àudio d'avui ja és al mòbil.");
  });
});

describe('pieces remade with another sound', () => {
  test('the phone lets go of those it has, once, and remembers the version', async () => {
    store.write(key(1), bytes(10));
    store.write(key(2), bytes(10));
    const ask = answer({ '/v1/audio/changes?since=0': { body: { version: 2, keys: [key(2), key(9)] } } });

    await forgetChangedPieces(2, store);

    expect(store.has(key(1))).toBe(true);
    expect(store.has(key(2))).toBe(false);
    await forgetChangedPieces(2, store);
    expect(ask).toHaveBeenCalledTimes(1);
  });

  test('too many changes: it lets go of everything', async () => {
    store.write(key(1), bytes(10));
    answer({ '/v1/audio/changes?since=0': { body: { version: 3, all: true } } });

    await forgetChangedPieces(3, store);

    expect(store.bytes()).toBe(0);
  });

  test('with nothing kept it does not even ask; with no network it asks next time', async () => {
    const ask = answer({});
    await forgetChangedPieces(1, store);
    expect(ask).not.toHaveBeenCalled();

    store.write(key(1), bytes(10));
    await forgetChangedPieces(2, store);
    expect(store.has(key(1))).toBe(true);
    jest.restoreAllMocks();
    answer({ '/v1/audio/changes?since=1': { body: { version: 2, keys: [key(1)] } } });
    await forgetChangedPieces(2, store);
    expect(store.has(key(1))).toBe(false);
  });

  test('cpl-api says the version with whether it can be heard, and the old pieces go', async () => {
    store.write(key(5), bytes(10));
    answer({
      '/v1/audio/status': { body: { enabled: true, message: null, version: 1 } },
      '/v1/audio/changes?since=0': { body: { version: 1, keys: [key(5)] } },
    });

    await Listen.refreshListenAvailability(9_000_000);

    expect(store.has(key(5))).toBe(false);
  });
});
