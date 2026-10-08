// The prayer read aloud, as the player sees it: it plays at once what the phone has, starts with the
// beginning when the network is slow and grows the file as the rest arrives, and goes on with the
// phone's own voice, saying so, when there is no network or cpl-api has reached a limit.
jest.mock('expo-file-system', () => require('../helpers/fakeFileSystem'));
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
  expect(player().playbackRate).toBe(Listen.SPEED_RATES.normal);
  expect(player().lockScreen).toEqual({ title: 'Part 0', artist: 'CPL', albumTitle: 'Laudes' });
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
  jest.useFakeTimers();
  const listening = Listen.listen('Completes', 'Completes', script(6));
  await jest.runAllTimersAsync();
  await listening;
  jest.useRealTimers();

  const state = Listen.getListenState();
  expect(state.mode).toBe('device');
  expect(state.notice).toBe(Listen.NOTICES.offline);
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
