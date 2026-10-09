// The prayer read aloud, as the player sees it: it plays at once what the phone has, starts with the
// beginning when the network is slow and grows the file as the rest arrives, and goes on with the
// phone's own voice, saying so, when there is no network or cpl-api has reached a limit.
jest.mock('expo-file-system', () => require('../helpers/fakeFileSystem'));
// A build with the key of the app, which does ask cpl-api whether the prayer can be heard
jest.mock('../../src/services/cplApi', () => ({ ...jest.requireActual('../../src/services/cplApi'), APP_KEY: 'test' }));
jest.mock('../../src/services/audio/pieceClient', () => {
  const actual = jest.requireActual('../../src/services/audio/pieceClient');
  return { ...actual, fetchPieces: jest.fn() };
});

import * as Listen from '../../src/controllers/listenController';
import { fetchPieces, AudioLimitError, AudioNetworkError } from '../../src/services/audio/pieceClient';
import { filePieceStore } from '../../src/services/audio/pieceStore';
import { FRAME_SECONDS, silence } from '../../src/services/audio/mp3';
import type { SpeechPiece } from '../../src/view-models/speech/script';

const { Directory } = jest.requireMock('expo-file-system');
const fakeAudio = jest.requireMock('expo-audio');
const fakeSpeech = jest.requireMock('expo-speech');
const fetchMock = fetchPieces as jest.Mock;

const key = (n: number) => String(n).padStart(24, '0');
// Every piece lasts 1 s (and 0.48 s of silence after it); every 5th is a part title
function script(n: number): SpeechPiece[] {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 5 === 0 ? 'lector' : 'cor1',
    voice: i % 5 === 0 ? 'ca-ES-AlbaNeural' : 'ca-ES-EnricNeural',
    text: i % 5 === 0 ? `Part ${i / 5}.` : `Estrofa ${i}.`,
    pause: 0.48,
    kind: i % 5 === 0 ? 'secció' : 'estrofa',
    section: null,
    key: key(i),
    paragraph: i,
    strophe: 0,
  }));
}
const second = () => silence(1).slice(0, Math.round(1 / FRAME_SECONDS) * 144);

let store: ReturnType<typeof filePieceStore>;
let folder = 0;
const player = () => fakeAudio.__players[fakeAudio.__players.length - 1];
const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

beforeEach(() => {
  store = filePieceStore(new Directory(`mem:/document/listen-${folder++}`));
  Listen.resetListen(store);
  fetchMock.mockReset();
  fakeSpeech.__spoken.length = 0;
});

test('an hour the phone already has plays at once, with the part on the lock screen', async () => {
  const pieces = script(12);
  for (const p of pieces) store.write(p.key, second());

  await Listen.listen('Laudes', 'Laudes', pieces);

  expect(fetchMock).not.toHaveBeenCalled();
  const state = Listen.getListenState();
  expect(state.phase).toBe('playing');
  expect(state.mode).toBe('audio');
  expect(state.seconds).toBeCloseTo(12 * 1.488, 0);
  expect(player().calls.map((c: unknown[]) => c[0])).toEqual(['replace', 'rate', 'play']);
  expect(player().playbackRate).toBe(Listen.NORMAL_RATE);
  // The part being said, the hour, and the CPL icon as the picture (on the lock screen and in the car)
  expect(player().lockScreen).toMatchObject({ title: 'Part 0', artist: 'CPL', albumTitle: 'Laudes' });
  expect(player().lockScreen.artworkUrl).toEqual(expect.any(String));
  expect(fakeAudio.__modes[0]).toMatchObject({ shouldPlayInBackground: true, playsInSilentMode: true });
});

test('jumps from part to part, and back to the start of the part being said', async () => {
  const pieces = script(15);
  for (const p of pieces) store.write(p.key, second());
  await Listen.listen('Laudes', 'Laudes', pieces);

  Listen.nextPart();
  expect(Listen.getListenState().index).toBe(5);
  player().emit({ currentTime: Listen.getListenState().position + 4 });
  Listen.previousPart();
  expect(Listen.getListenState().index).toBe(5);
  Listen.previousPart();
  expect(Listen.getListenState().index).toBe(0);
});

test('with a slow network it starts with the beginning and the file grows as the rest arrives', async () => {
  const pieces = script(45);
  let release: () => void = () => undefined;
  fetchMock.mockImplementation(async (batch: { key: string }[]) => {
    if (batch[0].key !== key(0)) await new Promise<void>((resolve) => (release = resolve));
    return { found: new Map(batch.map((p) => [p.key, second()])), missing: [] };
  });

  const listening = Listen.listen('Vespres', 'Vespres', pieces);
  for (let i = 0; i < 20 && Listen.getListenState().phase !== 'playing'; i++) await flush();
  expect(Listen.getListenState().phase).toBe('playing');
  const firstFile = player().source;

  release();
  await listening;
  await flush();
  expect(player().source).not.toBe(firstFile);
  expect(Listen.getListenState().seconds).toBeCloseTo(45 * 1.488, 0);
  expect(Listen.getListenState().mode).toBe('audio');
});

test('with no network and an hour not on the phone, the phone’s own voice reads it, and says so', async () => {
  fetchMock.mockRejectedValue(new AudioNetworkError('offline'));
  // What the player says while the phone reads (once it has read it all, it goes away)
  const seen: { mode: string; notice: string | null }[] = [];
  const unsubscribe = Listen.subscribeListen(() => {
    const { mode, notice } = Listen.getListenState();
    seen.push({ mode, notice });
  });
  jest.useFakeTimers();
  const listening = Listen.listen('Completes', 'Completes', script(6));
  await jest.runAllTimersAsync();
  await listening;
  jest.useRealTimers();
  unsubscribe();

  expect(seen).toContainEqual({ mode: 'device', notice: Listen.NOTICES.offline });
  await flush();
  expect(fakeSpeech.__spoken[0]).toMatchObject({ text: 'Part 0.', voice: 'ca-montse' });
});

test('past a limit of cpl-api, the same, with its own reason', async () => {
  fetchMock.mockRejectedValue(new AudioLimitError('limit'));
  await Listen.listen('Tèrcia', 'Tèrcia', script(3));
  expect(Listen.getListenState()).toMatchObject({ mode: 'device', notice: Listen.NOTICES.limited });
});

test('stopping lets everything go: the lock screen and the file of the hour', async () => {
  const pieces = script(10);
  for (const p of pieces) store.write(p.key, second());
  await Listen.listen('Sexta', 'Sexta', pieces);
  const file = player().source;

  Listen.stop();

  expect(Listen.getListenState().phase).toBe('idle');
  expect(player().lockScreen).toBeNull();
  expect(jest.requireMock('expo-file-system').__files.has(file)).toBe(false);
});

test('the parts of the hour, to choose where to go', () => {
  expect(Listen.partsOf(script(12))).toEqual([
    { index: 0, title: 'Part 0' },
    { index: 5, title: 'Part 1' },
    { index: 10, title: 'Part 2' },
  ]);
});

test('leaving the prayer that is being read stops it; leaving another one does not', async () => {
  const pieces = script(10);
  for (const p of pieces) store.write(p.key, second());
  await Listen.listen('Completes', 'Completes', pieces);

  Listen.leftHour('Laudes');
  expect(Listen.getListenState().phase).toBe('playing');
  Listen.leftHour('Completes');
  expect(Listen.getListenState().phase).toBe('idle');
});

test('the pace goes in steps of 5 %, within its limits, and is kept', async () => {
  const pieces = script(10);
  for (const p of pieces) store.write(p.key, second());
  await Listen.listen('Laudes', 'Laudes', pieces);

  Listen.setSpeed(112);
  expect(Listen.getListenState().speed).toBe(110);
  expect(player().playbackRate).toBeCloseTo(Listen.rateOf(110));
  Listen.setSpeed(400);
  expect(Listen.getListenState().speed).toBe(Listen.MAX_SPEED);
  const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
  expect(await AsyncStorage.getItem('listenSpeed')).toBe(String(Listen.MAX_SPEED));
});

test('the 10 seconds the lock screen or the car skip become a jump to the next or the previous part', async () => {
  const pieces = script(15);
  for (const p of pieces) store.write(p.key, second());
  const now = jest.spyOn(Date, 'now');
  let clock = 1_000_000;
  now.mockImplementation(() => clock);
  await Listen.listen('Laudes', 'Laudes', pieces);
  player().playing = false;

  clock += 5000;
  player().emit({ currentTime: 2, playing: false });
  // The lock screen skips 10 seconds forward: it goes to the next part instead
  clock += 500;
  player().emit({ currentTime: 12, playing: false });
  expect(Listen.getListenState().index).toBe(5);
  // And 10 back, at the start of a part: to the one before
  clock += 5000;
  player().emit({ currentTime: Listen.getListenState().position, playing: false });
  clock += 500;
  player().emit({ currentTime: Listen.getListenState().position - 10, playing: false });
  expect(Listen.getListenState().index).toBe(0);
  now.mockRestore();
});

describe('whether it can be heard', () => {
  const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
  const answer = (body: unknown) =>
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => body } as Response);

  afterEach(() => jest.restoreAllMocks());

  test('cpl-api says it is off: it stays off, with its message, and is not asked again for hours', async () => {
    await AsyncStorage.clear();
    const ask = answer({ enabled: false, message: 'Arriba aviat.' });

    await Listen.refreshListenAvailability(1_000_000);
    expect(Listen.getListenAvailability()).toEqual({ enabled: false, message: 'Arriba aviat.' });
    await Listen.refreshListenAvailability(1_000_000 + 60_000);
    expect(ask).toHaveBeenCalledTimes(1);
  });

  test('with no answer yet (no network), it can: the phone’s own voice reads then', async () => {
    await AsyncStorage.clear();
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
    await Listen.refreshListenAvailability(2_000_000);
    expect(Listen.getListenAvailability().enabled).toBe(true);
  });
});

test('an hour heard to the end says so for a moment, and the player goes away by itself', async () => {
  jest.useFakeTimers();
  const pieces = script(3);
  for (const p of pieces) store.write(p.key, second());
  await Listen.listen('Laudes', 'Laudes', pieces);

  player().emit({ currentTime: 4.4, playing: false, didJustFinish: true });
  expect(Listen.getListenState().phase).toBe('finished');
  jest.advanceTimersByTime(Listen.CLOSE_AFTER_FINISHING_MS);
  expect(Listen.getListenState().phase).toBe('idle');
  jest.useRealTimers();
});

describe('opened held (the tour of what is new): nothing is heard until ▶', () => {
  test('an hour the phone has: ready and paused, off the lock screen; ▶ plays it', async () => {
    const pieces = script(12);
    for (const p of pieces) store.write(p.key, second());

    await Listen.listen('Laudes', 'Laudes', pieces, { held: true });

    expect(Listen.getListenState()).toMatchObject({ phase: 'paused', mode: 'audio' });
    expect(Listen.isHeld()).toBe(true);
    expect(player().calls.map((c: unknown[]) => c[0])).toEqual(['replace', 'rate']);
    expect(player().playing).toBe(false);
    expect(player().lockScreen).toBeNull();

    Listen.toggle();

    expect(Listen.getListenState().phase).toBe('playing');
    expect(Listen.isHeld()).toBe(false);
    expect(player().playing).toBe(true);
    expect(player().lockScreen).toMatchObject({ title: 'Part 0', albumTitle: 'Laudes' });
  });

  test('▶ before the beginning is here: it plays as soon as it is', async () => {
    const pieces = script(15);
    let release: () => void = () => undefined;
    fetchMock.mockImplementation(async (batch: { key: string }[]) => {
      await new Promise<void>((resolve) => (release = resolve));
      return { found: new Map(batch.map((p) => [p.key, second()])), missing: [] };
    });

    const listening = Listen.listen('Vespres', 'Vespres', pieces, { held: true });
    await flush();
    expect(Listen.getListenState().phase).toBe('paused');

    Listen.toggle();
    expect(Listen.getListenState().phase).toBe('preparing');

    release();
    await listening;
    await flush();
    expect(Listen.getListenState().phase).toBe('playing');
    expect(player().playing).toBe(true);
  });

  test('with no network, the phone’s voice waits too, and reads once ▶ is touched', async () => {
    fetchMock.mockRejectedValue(new AudioNetworkError('offline'));
    jest.useFakeTimers();
    const listening = Listen.listen('Completes', 'Completes', script(6), { held: true });
    await jest.runAllTimersAsync();
    await listening;

    expect(Listen.getListenState()).toMatchObject({ phase: 'paused', mode: 'device', notice: Listen.NOTICES.offline });
    expect(fakeSpeech.__spoken).toEqual([]);

    Listen.toggle();
    await flush();
    expect(Listen.getListenState().phase).toBe('playing');
    expect(fakeSpeech.__spoken[0]).toMatchObject({ text: 'Part 0.' });
    Listen.stop();
    jest.useRealTimers();
  });
});
