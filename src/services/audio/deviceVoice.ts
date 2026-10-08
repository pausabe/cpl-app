import * as Speech from 'expo-speech';

// The phone's own voice, for when the audio cannot be had: no network, or cpl-api has reached a
// limit for today. It reads the same script, piece by piece and with its silences, with the Catalan
// voices the phone has (Montse and Jordi on an iPhone), the two choirs with two voices if there are
// two. It only reads while the app is open, and without lock-screen controls: it is the fallback,
// not the way to listen.

export interface DeviceVoices {
  female: string | null;
  male: string | null;
}

let voices: DeviceVoices | null = null;

export async function catalanVoices(): Promise<DeviceVoices> {
  if (voices) return voices;
  try {
    const all = (await Speech.getAvailableVoicesAsync()).filter((v) => v.language?.toLowerCase().startsWith('ca'));
    // The enhanced ones first, when the user has downloaded them
    all.sort(
      (a, b) =>
        (b.quality === Speech.VoiceQuality.Enhanced ? 1 : 0) - (a.quality === Speech.VoiceQuality.Enhanced ? 1 : 0),
    );
    const named = (pattern: RegExp) => all.find((v) => pattern.test(v.name ?? ''))?.identifier ?? null;
    const female = named(/montse|montserrat|female|dona/i) ?? all[0]?.identifier ?? null;
    const male = named(/jordi|pau|male|home/i) ?? all.find((v) => v.identifier !== female)?.identifier ?? female;
    voices = { female, male };
  } catch {
    voices = { female: null, male: null };
  }
  return voices;
}

export interface SpokenPiece {
  text: string;
  pause: number;
  // The first choir and the presider are a man's voice; the second choir and the reader, a woman's
  male: boolean;
}

export interface DeviceReading {
  stop(): void;
}

// Reads from `from` to the end; onPiece says which one is being read, onDone when it is over
export function readWithDeviceVoice(
  pieces: SpokenPiece[],
  from: number,
  { rate = 1, onPiece, onDone }: { rate?: number; onPiece?: (index: number) => void; onDone?: () => void },
): DeviceReading {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const next = async (index: number) => {
    if (stopped) return;
    if (index >= pieces.length) {
      onDone?.();
      return;
    }
    const { female, male } = await catalanVoices();
    if (stopped) return;
    onPiece?.(index);
    const piece = pieces[index];
    Speech.speak(piece.text, {
      language: 'ca-ES',
      voice: (piece.male ? male : female) ?? undefined,
      rate,
      onDone: () => {
        timer = setTimeout(() => next(index + 1), piece.pause * 1000);
      },
    });
  };
  next(from);
  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      Speech.stop();
    },
  };
}
