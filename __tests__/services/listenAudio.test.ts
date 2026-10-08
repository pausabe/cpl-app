// The audio of an hour read aloud: the MP3 joined from its pieces and silences, the answer of
// cpl-api read back, and the pieces downloaded in order, kept on the phone, and given up on when
// there is no network or cpl-api has reached a limit.
jest.mock('expo-file-system', () => require('../helpers/fakeFileSystem'));

import { FRAME_SECONDS, SILENCE_FRAME, joinHour, mp3Seconds, silence } from '../../src/services/audio/mp3';
import { AudioLimitError, AudioNetworkError, unpackPieces } from '../../src/services/audio/pieceClient';
import { downloadPieces, readyFromStart } from '../../src/services/audio/hourAudio';
import {
  FREE_SPACE_FLOOR,
  MAX_STORED_BYTES,
  StorageFullError,
  filePieceStore,
} from '../../src/services/audio/pieceStore';

const { Directory } = jest.requireMock('expo-file-system');

// A piece of audio: n frames of Azure's kind (the silence frame has the same header)
const audio = (frames: number) => silence(frames * FRAME_SECONDS);

function pack(pieces: [string, Uint8Array | null][]): ArrayBuffer {
  const size = 7 + pieces.reduce((sum, [, a]) => sum + 29 + (a?.length ?? 0), 0);
  const out = new Uint8Array(size);
  const view = new DataView(out.buffer);
  out.set([67, 80, 76, 65, 1], 0);
  view.setUint16(5, pieces.length);
  let at = 7;
  for (const [key, a] of pieces) {
    out.set(
      [...key].map((c) => c.charCodeAt(0)),
      at,
    );
    out[at + 24] = a ? 1 : 0;
    view.setUint32(at + 25, a?.length ?? 0);
    at += 29;
    if (a) {
      out.set(a, at);
      at += a.length;
    }
  }
  return out.buffer;
}

const key = (n: number) => String(n).padStart(24, '0');
const piece = (n: number) => ({ key: key(n), voice: 'ca-ES-JoanaNeural', text: `Peça ${n}.`, pause: 0.7 });

describe('the MP3 of an hour', () => {
  test('the silence is frames alike to Azure’s, 24 ms each, that need nothing before them', () => {
    expect(SILENCE_FRAME.length).toBe(144);
    expect([...SILENCE_FRAME.slice(0, 4)]).toEqual([0xff, 0xf3, 0x64, 0xc4]);
    expect(SILENCE_FRAME[4]).toBe(0);
    expect(mp3Seconds(silence(0.7))).toBeCloseTo(0.696, 2);
  });

  test('joins the pieces with their silences and says where each one starts', () => {
    const joined = joinHour([
      { audio: audio(50), pause: 0.48 },
      { audio: audio(25), pause: 0 },
    ]);
    expect(joined.starts[0]).toBe(0);
    expect(joined.starts[1]).toBeCloseTo(50 * FRAME_SECONDS + 0.48, 2);
    expect(joined.seconds).toBeCloseTo(75 * FRAME_SECONDS + 0.48, 2);
    expect(mp3Seconds(joined.bytes)).toBeCloseTo(joined.seconds, 2);
  });
});

describe('the answer of cpl-api', () => {
  test('gives the pieces that are there and says which are not', () => {
    const { found, missing } = unpackPieces(
      pack([
        [key(1), audio(2)],
        [key(2), null],
      ]),
    );
    expect([...found.keys()]).toEqual([key(1)]);
    expect(found.get(key(1))?.length).toBe(288);
    expect(missing).toEqual([key(2)]);
  });
});

describe('downloading an hour', () => {
  let folder = 0;
  const newStore = () => filePieceStore(new Directory(`mem:/document/audio-${folder++}`));

  test('only what is not on the phone, in the order it is said, 30 at a time', async () => {
    const store = newStore();
    store.write(key(0), audio(2));
    const pieces = Array.from({ length: 40 }, (_, i) => piece(i));
    const asked: string[][] = [];
    const fetchPieces = jest.fn(async (batch: { key: string }[]) => {
      asked.push(batch.map((p) => p.key));
      return { found: new Map(batch.map((p) => [p.key, audio(2)])), missing: [] };
    });
    const progress: number[] = [];

    const result = await downloadPieces(pieces, store, { fetchPieces, onProgress: (d) => progress.push(d) });

    expect(result).toEqual({ missing: [], limited: false, offline: false });
    expect(asked.map((b) => b.length)).toEqual([30, 9]);
    expect(asked[0][0]).toBe(key(1));
    expect(progress).toEqual([0, 30, 39]);
    expect(readyFromStart(pieces, store)).toBe(40);
  });

  test('with no network, it tries again and then gives up, keeping what came', async () => {
    const store = newStore();
    const pieces = Array.from({ length: 35 }, (_, i) => piece(i));
    let calls = 0;
    const fetchPieces = jest.fn(async (batch: { key: string }[]) => {
      calls++;
      if (calls > 1) throw new AudioNetworkError('offline');
      return { found: new Map(batch.map((p) => [p.key, audio(1)])), missing: [] };
    });
    jest.useFakeTimers();
    const pending = downloadPieces(pieces, store, { fetchPieces });
    await jest.runAllTimersAsync();
    const result = await pending;
    jest.useRealTimers();

    expect(result.offline).toBe(true);
    expect(calls).toBe(4);
    expect(readyFromStart(pieces, store)).toBe(30);
  });

  test('past a limit of cpl-api, it stops at once', async () => {
    const store = newStore();
    const fetchPieces = jest.fn(async () => {
      throw new AudioLimitError('limit');
    });
    const result = await downloadPieces([piece(1)], store, { fetchPieces });
    expect(result).toEqual({ missing: [], limited: true, offline: false });
    expect(fetchPieces).toHaveBeenCalledTimes(1);
  });
});

describe('the pieces kept on the phone', () => {
  test('past the ceiling, the ones not heard for longest go, never those of the hour', () => {
    const store = filePieceStore(new Directory('mem:/document/audio-ceiling'));
    const big = new Uint8Array(MAX_STORED_BYTES / 4);
    const now = jest.spyOn(Date, 'now');
    ['a', 'b', 'c', 'd'].forEach((k, i) => {
      now.mockReturnValue(1000 + i);
      store.write(k.repeat(24), big);
    });
    now.mockReturnValue(2000);
    store.touch(['a'.repeat(24)]);
    store.write('e'.repeat(24), big, new Set(['b'.repeat(24)]));
    now.mockRestore();

    expect(store.has('a'.repeat(24))).toBe(true);
    expect(store.has('b'.repeat(24))).toBe(true);
    expect(store.has('c'.repeat(24))).toBe(false);
    expect(store.has('e'.repeat(24))).toBe(true);
    expect(store.bytes()).toBeLessThanOrEqual(MAX_STORED_BYTES);
  });
});

describe('a phone short of space', () => {
  const MB = 1024 * 1024;

  test('the pieces never leave it with less than the floor free: the oldest make way', () => {
    // 260 MB free and the floor at 200: room for 60 MB of pieces
    let free = 260 * MB;
    const store = filePieceStore(new Directory('mem:/document/audio-short'), () => free);
    const piece = new Uint8Array(20 * MB);
    const now = jest.spyOn(Date, 'now');
    now.mockReturnValue(1);
    store.write('a'.repeat(24), piece);
    free -= 20 * MB;
    now.mockReturnValue(2);
    store.write('b'.repeat(24), piece);
    free -= 20 * MB;
    now.mockReturnValue(3);
    store.write('c'.repeat(24), piece);
    free -= 20 * MB;
    // The phone is now at the floor: a new piece takes the place of the oldest ones
    now.mockReturnValue(4);
    store.write('d'.repeat(24), piece);
    now.mockRestore();

    expect(store.bytes()).toBeLessThanOrEqual(260 * MB - FREE_SPACE_FLOOR);
    expect(store.has('d'.repeat(24))).toBe(true);
    expect(store.has('c'.repeat(24))).toBe(true);
    expect(store.has('a'.repeat(24))).toBe(false);
  });

  test('with no room at all, it says so instead of filling the phone', () => {
    const store = filePieceStore(new Directory('mem:/document/audio-full'), () => FREE_SPACE_FLOOR - 1);
    expect(() => store.write('a'.repeat(24), new Uint8Array(1024))).toThrow(StorageFullError);
    expect(store.has('a'.repeat(24))).toBe(false);
  });
});
