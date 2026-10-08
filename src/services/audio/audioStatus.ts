import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_KEY, callApi } from '../cplApi';

// Whether the prayer can be heard: cpl-api says it (cpl-cloud, audio_config), so that it can be
// turned on when the audio is ready and off if something goes wrong, without a new app. The phone
// asks a few times a day at most and keeps the answer; with no answer yet (no network the first
// time) it is as if it could: the phone's own voice reads it then.
export interface AudioStatus {
  enabled: boolean;
  // What to say when it is off, if cpl-api wants to say something of its own
  message: string | null;
  checkedAt: number;
}

const STORAGE_KEY = 'audioStatus';
export const STATUS_MAX_AGE = 6 * 60 * 60 * 1000;

export async function savedAudioStatus(): Promise<AudioStatus | null> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as AudioStatus) : null;
  } catch {
    return null;
  }
}

export async function fetchAudioStatus(now = Date.now()): Promise<AudioStatus | null> {
  // A build without the key of the app (the tests, a local build) does not ask
  if (!APP_KEY) return null;
  try {
    const response = await callApi('/v1/audio/status');
    if (!response.ok) return null;
    const body = (await response.json()) as { enabled?: unknown; message?: unknown };
    const status: AudioStatus = {
      enabled: body.enabled === true,
      message: typeof body.message === 'string' && body.message.trim() ? body.message.trim() : null,
      checkedAt: now,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    return status;
  } catch {
    return null;
  }
}
