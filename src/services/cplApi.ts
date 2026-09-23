// What the app shares with cpl-api: where it is and how it says who it is.
//
// The key travels inside the app, so it is not a real secret: it keeps the texts, which belong to
// the CPL, from being downloadable by anyone who finds the address. It is set when the app is
// built (EXPO_PUBLIC_CPL_APP_KEY, in .env) and never written in the repository, which is public.
// EXPO_PUBLIC_CPL_API_URL only to try it against a server running on this machine
export const API_URL = process.env.EXPO_PUBLIC_CPL_API_URL ?? 'https://cpl-api.canmartorell.dev';
export const APP_KEY = process.env.EXPO_PUBLIC_CPL_APP_KEY ?? '';
export const APP_KEY_HEADER = 'X-CPL-App-Key';

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
