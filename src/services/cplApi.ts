import { Platform } from 'react-native';
import * as ExpoApplication from 'expo-application';

// What the app shares with cpl-api: where it is and how it says who it is.
//
// The key travels inside the app, so it is not a real secret: it keeps the texts, which belong to
// the CPL, from being downloadable by anyone who finds the address. It is set when the app is
// built (EXPO_PUBLIC_CPL_APP_KEY, in .env) and never written in the repository, which is public.
// EXPO_PUBLIC_CPL_API_URL only to try it against a server running on this machine
export const API_URL = process.env.EXPO_PUBLIC_CPL_API_URL ?? 'https://cpl-api.canmartorell.dev';
export const APP_KEY = process.env.EXPO_PUBLIC_CPL_APP_KEY ?? '';
export const APP_KEY_HEADER = 'X-CPL-App-Key';

// A copy built to be tried out, not to be prayed with: the ones that run on a simulator, on an
// emulator or under the Maestro flows. It reports no use, because a phone that opens the app fifty
// times in an afternoon of tests is not a person, and the count is there to say how many people
// there are. Set when the app is built (EXPO_PUBLIC_CPL_TEST_BUILD), by the Makefile targets that
// build those copies; what is installed on a real phone never carries it.
export const IS_TEST_BUILD = process.env.EXPO_PUBLIC_CPL_TEST_BUILD === '1';

// Three numbers with no zero in front, as cpl-api writes a version: anything else it would refuse
const APP_VERSION_PATTERN = /^(0|[1-9]\d{0,2})\.(0|[1-9]\d{0,2})\.(0|[1-9]\d{0,2})$/;

// The version of the app as the stores show it ("9.0.0"). cpl-api goes by it to give a phone only
// the publications its code can show, to say how many phones already have the newest app, and to
// know whether to tell this one there is a newer one. A build that has none (the web one) or one
// cpl-api would not read sends nothing, so that nothing is ever refused because of it.
export function appVersion(): string | null {
  const version = ExpoApplication.nativeApplicationVersion;
  return version && APP_VERSION_PATTERN.test(version) ? version : null;
}

// Which of the two stores the phone gets the app from; null in the web build
export function phonePlatform(): 'ios' | 'android' | null {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;
}

const REQUEST_TIMEOUT = 15000;

// Never waits forever: on a phone with no network the answer has to come back as a failure
export async function callApi(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...init.headers, [APP_KEY_HEADER]: APP_KEY },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
