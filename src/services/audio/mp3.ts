// An hour read aloud is one MP3: its pieces one after the other, with the silences of the script
// between them. One file is what the lock screen and the car can play, pause and move along; and
// MP3 can be joined by putting the bytes one after the other, as long as all the frames are alike.
//
// Azure gives every piece as MPEG-2 Layer III, 24 kHz, mono, 48 kbps, with no tags and with each
// piece starting on a frame that needs nothing before it; the silence here is a frame of exactly
// that kind (made with LAME without its bit reservoir, so it needs nothing before it either).

// One frame is 576 samples: 24 ms at 24 kHz
export const FRAME_SECONDS = 576 / 24000;

// A frame of silence, alike to Azure's (fff364c4: MPEG-2, layer III, 48 kbps, 24 kHz, mono)
const SILENCE_FRAME_BASE64 =
  '//NkxAAAAANIAAAAAExBTUU0LjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function fromBase64(text: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = text.replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let bits = 0;
  let value = 0;
  let at = 0;
  for (const char of clean) {
    value = (value << 6) | alphabet.indexOf(char);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[at++] = (value >> bits) & 255;
    }
  }
  return out;
}

export const SILENCE_FRAME = fromBase64(SILENCE_FRAME_BASE64);

// Kbps of each bitrate index, for MPEG-1 and for MPEG-2/2.5, layer III
const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const SAMPLE_RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG-1
  2: [22050, 24000, 16000], // MPEG-2
  0: [11025, 12000, 8000], // MPEG-2.5
};

// How long an MP3 lasts, frame by frame. Bytes that are not a frame (a tag) are skipped.
export function mp3Seconds(bytes: Uint8Array): number {
  let seconds = 0;
  let i = 0;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) {
      i++;
      continue;
    }
    const version = (bytes[i + 1] >> 3) & 3; // 3 MPEG-1, 2 MPEG-2, 0 MPEG-2.5
    const layer = (bytes[i + 1] >> 1) & 3; // 1 is layer III
    const bitrateIndex = bytes[i + 2] >> 4;
    const rateIndex = (bytes[i + 2] >> 2) & 3;
    const padding = (bytes[i + 2] >> 1) & 1;
    if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) {
      i++;
      continue;
    }
    const kbps = BITRATES[version === 3 ? 1 : 2][bitrateIndex];
    const rate = SAMPLE_RATES[version][rateIndex];
    const samples = version === 3 ? 1152 : 576;
    const length = Math.floor(((samples / 8) * kbps * 1000) / rate) + padding;
    seconds += samples / rate;
    i += length;
  }
  return seconds;
}

export function silence(seconds: number): Uint8Array {
  const frames = Math.max(0, Math.round(seconds / FRAME_SECONDS));
  const out = new Uint8Array(frames * SILENCE_FRAME.length);
  for (let f = 0; f < frames; f++) out.set(SILENCE_FRAME, f * SILENCE_FRAME.length);
  return out;
}

export interface HourPiece {
  audio: Uint8Array;
  // Seconds of silence after it
  pause: number;
}

export interface JoinedHour {
  bytes: Uint8Array;
  // Where each piece starts, in seconds
  starts: number[];
  seconds: number;
}

export function joinHour(pieces: HourPiece[]): JoinedHour {
  const pauses = pieces.map((p) => silence(p.pause));
  const size = pieces.reduce((sum, p, i) => sum + p.audio.length + pauses[i].length, 0);
  const bytes = new Uint8Array(size);
  const starts: number[] = [];
  let at = 0;
  let seconds = 0;
  pieces.forEach((piece, i) => {
    starts.push(seconds);
    bytes.set(piece.audio, at);
    at += piece.audio.length;
    bytes.set(pauses[i], at);
    at += pauses[i].length;
    seconds += mp3Seconds(piece.audio) + (pauses[i].length / SILENCE_FRAME.length) * FRAME_SECONDS;
  });
  return { bytes, starts, seconds };
}
